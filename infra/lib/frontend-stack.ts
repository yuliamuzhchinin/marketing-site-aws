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
} from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";
import { OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { HostedZone, ARecord, RecordTarget } from "aws-cdk-lib/aws-route53";
import { DnsValidatedCertificate } from "aws-cdk-lib/aws-certificatemanager";
import { CloudFrontTarget } from "aws-cdk-lib/aws-route53-targets";
import * as path from "path";

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const domainName = "trendnestmedia.com";
    const subdomain = "www"; // www.trendnestmedia.com

    const zone = HostedZone.fromLookup(this, "Zone", { domainName });


    const cert = new DnsValidatedCertificate(this, "SiteCert", {
      domainName: `${subdomain}.${domainName}`,
      hostedZone: zone,
      region: "us-east-1",
    });

    const siteBucket = new Bucket(this, 'SiteBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY, // dev convenience
    });

    const oai = new OriginAccessIdentity(this, 'OAI');
    siteBucket.grantRead(oai);

    const spaRoutingFn = new CfFunction(this, "SpaRoutingFn", {
  code: FunctionCode.fromInline(`
function handler(event) {
  var r = event.request;
  // If URL has no file extension and does not end with '/', rewrite to /index.html
  if (!r.uri.includes('.') && !r.uri.endsWith('/')) {
    r.uri = r.uri + '/index.html';
  }
  return r;
}
`),
});

    const distro = new Distribution(this, "SiteDistribution", {
      defaultBehavior: {
        origin: new S3Origin(siteBucket, { originAccessIdentity: oai }),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
        functionAssociations: [{ function: spaRoutingFn, eventType: FunctionEventType.VIEWER_REQUEST }],
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
    });

    new CfnOutput(this, "DomainUrl", { value: `https://www.${domainName}` });
    new CfnOutput(this, "DistributionDomain", { value: distro.distributionDomainName });
  }
}
