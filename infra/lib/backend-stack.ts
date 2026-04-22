// infra/lib/backend-stack.ts
import { Stack, StackProps, CfnOutput, Duration, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table, ProjectionType } from 'aws-cdk-lib/aws-dynamodb';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { HttpApi, CorsHttpMethod, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as sns from "aws-cdk-lib/aws-sns";
import * as snsSubs from "aws-cdk-lib/aws-sns-subscriptions";
import * as cwActions from "aws-cdk-lib/aws-cloudwatch-actions";
import { CfnStage } from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as ssm from "aws-cdk-lib/aws-ssm";


export class BackendStack extends Stack {
  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // ── DynamoDB: Leads ─────────────────────────────────────────
    const leads = new Table(this, 'LeadsTable', {
      partitionKey: { name: 'leadId', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // ── DynamoDB: Blog Posts ─────────────────────────────────────
    const blogTable = new Table(this, "BlogPostsTable", {
      partitionKey: { name: "id", type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: RemovalPolicy.RETAIN,
    });

    // GSI: look up posts by slug (used by GET /blog/{slug})
    blogTable.addGlobalSecondaryIndex({
      indexName: "slug-index",
      partitionKey: { name: "slug", type: AttributeType.STRING },
      projectionType: ProjectionType.ALL,
    });

    // ── Lambda ───────────────────────────────────────────────────
    const submitFn = new NodejsFunction(this, "ContactSubmitFn", {
      entry: path.join(
        __dirname,
        "../../apps/functions/contact-submit/index.ts"
      ),
      handler: "handler",
      environment: {
        LEADS_TABLE: leads.tableName,
        BLOG_TABLE: blogTable.tableName,
        SES_FROM: "no-reply@trendnestmedia.com",
        SES_TO: "muzhchinin18@gmail.com",
        SES_REGION: this.region,
        // Secret key that protects POST /blog
        // Change this to any strong secret before deploying
        BLOG_API_KEY: ssm.StringParameter.valueFromLookup(
          this, "/trendnest/blog-api-key"
        ),
      },
      bundling: { minify: true },
    });

    leads.grantWriteData(submitFn);
    blogTable.grantReadWriteData(submitFn);

    submitFn.addToRolePolicy(
      new PolicyStatement({
        actions: ["ses:SendEmail", "ses:SendRawEmail"],
        resources: [
          "*",
          `arn:aws:ses:${this.region}:${this.account}:identity/trendnestmedia.com`,
        ],
      })
    );

    // ── HTTP API ─────────────────────────────────────────────────
    const api = new HttpApi(this, "HttpApi", {
      corsPreflight: {
        // Added x-api-key so the admin form can send it
        allowHeaders: ["content-type", "x-api-key"],
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.OPTIONS,
        ],
        allowOrigins: [
          "https://www.trendnestmedia.com",
          "http://localhost:3000",
        ],
      },
    });

    // Throttling
    const cfnStage = api.defaultStage!.node.defaultChild as CfnStage;
    cfnStage.defaultRouteSettings = {
      throttlingBurstLimit: 50,
      throttlingRateLimit: 10,
    };

    // ── Alerts ───────────────────────────────────────────────────
    const alertsTopic = new sns.Topic(this, "AlertsTopic", {
      displayName: "TrendNest Backend Alerts",
    });
    alertsTopic.addSubscription(
      new snsSubs.EmailSubscription("muzhchinin18@gmail.com")
    );
    submitFn
      .metricErrors()
      .createAlarm(this, "ContactFnErrors", {
        threshold: 1,
        evaluationPeriods: 1,
      })
      .addAlarmAction(new cwActions.SnsAction(alertsTopic));
    api
      .metricServerError()
      .createAlarm(this, "Api5xx", {
        threshold: 1,
        evaluationPeriods: 1,
      })
      .addAlarmAction(new cwActions.SnsAction(alertsTopic));

    // ── Routes ───────────────────────────────────────────────────
    const integration = new HttpLambdaIntegration("MainIntegration", submitFn);

    api.addRoutes({
      path: "/contact",
      methods: [HttpMethod.POST],
      integration,
    });

    api.addRoutes({
      path: "/blog",
      methods: [HttpMethod.GET, HttpMethod.POST],
      integration,
    });

    // ✅ Changed from {id} to {slug}
    api.addRoutes({
      path: "/blog/{slug}",
      methods: [HttpMethod.GET],
      integration,
    });

    // ── Outputs ──────────────────────────────────────────────────
    this.apiUrl = api.apiEndpoint;
    new CfnOutput(this, "ApiUrl", { value: this.apiUrl });
    new CfnOutput(this, "LeadsTableName", { value: leads.tableName });
    new CfnOutput(this, "BlogTableName", { value: blogTable.tableName });
  }
}