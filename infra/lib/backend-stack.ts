// infra/lib/backend-stack.ts
import { Stack, StackProps, RemovalPolicy, Duration, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Runtime, Architecture } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { HttpApi, CorsHttpMethod, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';


export class BackendStack extends Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // DynamoDB table
    const leads = new Table(this, 'LeadsTable', {
      partitionKey: { name: 'leadId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: RemovalPolicy.DESTROY // dev convenience; switch to RETAIN for prod
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
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'], //restrict later to  SES identity ARN
    }));




    // HTTP API
    const api = new HttpApi(this, "HttpApi", {
      corsPreflight: {
        allowHeaders: ["content-type"],
        allowMethods: [CorsHttpMethod.POST, CorsHttpMethod.OPTIONS],
        allowOrigins: ["https://www.trendnestmedia.com"],
      },
    });


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
