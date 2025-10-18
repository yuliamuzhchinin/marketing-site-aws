// infra/lib/backend-stack.ts
import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { HttpApi, CorsHttpMethod, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as sns from "aws-cdk-lib/aws-sns";
import * as snsSubs from "aws-cdk-lib/aws-sns-subscriptions";
import * as cwActions from "aws-cdk-lib/aws-cloudwatch-actions";
import { CfnStage } from "aws-cdk-lib/aws-apigatewayv2";


export class BackendStack extends Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const leads = new Table(this, 'LeadsTable', {
      partitionKey: { name: 'leadId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true
    });

    // Lambda handler (bundles TS with esbuild)
    const submitFn = new NodejsFunction(this, "ContactSubmitFn", {
      entry: path.join(__dirname, "../../apps/functions/contact-submit/index.ts"),
      handler: "handler",
      environment: {
        LEADS_TABLE: leads.tableName,
        SES_FROM: "no-reply@trendnestmedia.com",
        SES_TO: "muzhchinin18@gmail.com",
        SES_REGION: this.region, // us-west-1
      },
      bundling: { minify: true },
    });

    leads.grantWriteData(submitFn);
    submitFn.addToRolePolicy(new PolicyStatement({
      actions: ["ses:SendEmail", "ses:SendRawEmail"],
      resources: ["*"],
    }));

    // Give Lambda permission to send emails using SES
    submitFn.addToRolePolicy(new PolicyStatement({
      actions: ["ses:SendEmail", "ses:SendRawEmail"],
      resources: [`arn:aws:ses:${this.region}:${this.account}:identity/trendnestmedia.com`],
    }));

    // HTTP API
    const api = new HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowHeaders: ["content-type"],
        allowMethods: [CorsHttpMethod.POST, CorsHttpMethod.OPTIONS],
        allowOrigins: ["https://www.trendnestmedia.com"],
      },
    });
    // Set default stage throttling (HTTP API)
    const cfnStage = api.defaultStage!.node.defaultChild as CfnStage;
    cfnStage.defaultRouteSettings = {
      throttlingBurstLimit: 50,  // peak bucket
      throttlingRateLimit: 10,   // steady req/sec
    };



    // 1) Alert topic
    const alertsTopic = new sns.Topic(this, "AlertsTopic", {
      displayName: "TrendNest Backend Alerts",
    });

    // 2) Send alerts to email
    alertsTopic.addSubscription(new snsSubs.EmailSubscription("muzhchinin18@gmail.com"));


    // 3) Alarm: Lambda errors
    submitFn.metricErrors().createAlarm(this, "ContactFnErrors", {
      threshold: 1,
      evaluationPeriods: 1,
    }).addAlarmAction(new cwActions.SnsAction(alertsTopic));

    // 4) Alarm: API Gateway 5xx responses
    api.metricServerError().createAlarm(this, "Api5xx", {
      threshold: 1,
      evaluationPeriods: 1,
    }).addAlarmAction(new cwActions.SnsAction(alertsTopic));

    api.addRoutes({
      path: '/contact',
      methods: [HttpMethod.POST],
      integration: new HttpLambdaIntegration('ContactIntegration', submitFn),
    });


    this.apiUrl = api.apiEndpoint;

    new CfnOutput(this, 'ApiUrl', { value: this.apiUrl });
    new CfnOutput(this, 'LeadsTableName', { value: leads.tableName });
  }
}
