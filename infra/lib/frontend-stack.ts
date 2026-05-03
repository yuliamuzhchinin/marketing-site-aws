// infra/lib/frontend-stack.ts
import { Stack, StackProps, RemovalPolicy, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { BlockPublicAccess, Bucket } from "aws-cdk-lib/aws-s3";
import {
  Distribution,
  AllowedMethods,
  ViewerProtocolPolicy,
  CachePolicy,
  ResponseHeadersPolicy,
  Function as CfFunction,
  FunctionCode,
  FunctionEventType,
  OriginAccessIdentity,
  BehaviorOptions,
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { HostedZone, ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import * as path from "path";

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const domainName = "trendnestmedia.com";
    const subdomain = "www";

    const zone = HostedZone.fromLookup(this, "Zone", { domainName });

    const cert = new DnsValidatedCertificate(this, "SiteCert", {
      domainName: `${subdomain}.${domainName}`,
      hostedZone: zone,
      region: "us-east-1",
    });

    // ── Site bucket (static Next.js export) ──────────────────────
    const siteBucket = new Bucket(this, "SiteBucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const siteOai = new OriginAccessIdentity(this, "OAI");
    siteBucket.grantRead(siteOai);

    // ── Media bucket (blog images — never wiped by deploys) ───────
    const mediaBucket = new Bucket(this, "MediaBucket", {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN, // never auto-delete
    });

    const mediaOai = new OriginAccessIdentity(this, "MediaOAI");
    mediaBucket.grantRead(mediaOai);

    // ── CloudFront routing function ───────────────────────────────
    const spaRoutingFn = new CfFunction(this, "SpaRoutingFn", {
      code: FunctionCode.fromInline(`
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri === "" || uri === "/") {
    request.uri = "/index.html";
    return request;
  }

  if (uri.indexOf(".") === -1) {
    if (uri.charAt(uri.length - 1) !== "/") {
      uri = uri + "/";
    }
    request.uri = uri + "index.html";
  }

  return request;
}
`),
    });

    // ── CloudFront distribution ───────────────────────────────────
    const distro = new Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: new S3Origin(siteBucket, { originAccessIdentity: siteOai }),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
        functionAssociations: [
          {
            function: spaRoutingFn,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
      },
      // /media/* served from the media bucket
      additionalBehaviors: {
        "/media/*": {
          origin: new S3Origin(mediaBucket, { originAccessIdentity: mediaOai }),
          allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        } as BehaviorOptions,
      },
      certificate: cert,
      domainNames: [`${subdomain}.${domainName}`],
      defaultRootObject: "index.html",
    });

    new ARecord(this, "AliasRecordWWW", {
      zone,
      recordName: subdomain,
      target: RecordTarget.fromAlias(new CloudFrontTarget(distro)),
    });

    new BucketDeployment(this, "DeployWebsite", {
      sources: [Source.asset(path.join(__dirname, "../../apps/web/out"))],
      destinationBucket: siteBucket,
      distribution: distro,
      distributionPaths: ["/*"],
      prune: false,
    });

    new CfnOutput(this, "DomainUrl", { value: `https://www.${domainName}` });
    new CfnOutput(this, "DistributionDomain", { value: distro.distributionDomainName });
    new CfnOutput(this, "MediaBucketName", { value: mediaBucket.bucketName });
  }
}