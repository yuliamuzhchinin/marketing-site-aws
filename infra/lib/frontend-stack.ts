import { Stack, StackProps, RemovalPolicy, CfnOutput } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3';
import { Distribution, AllowedMethods, ViewerProtocolPolicy, CachePolicy, ResponseHeadersPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { OriginAccessIdentity } from 'aws-cdk-lib/aws-cloudfront';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';

export class FrontendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const siteBucket = new Bucket(this, 'SiteBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY, // dev convenience
    });

    const oai = new OriginAccessIdentity(this, 'OAI');
    siteBucket.grantRead(oai);

    const distro = new Distribution(this, 'SiteDistribution', {
      defaultBehavior: {
        origin: new S3Origin(siteBucket, { originAccessIdentity: oai }),
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: ResponseHeadersPolicy.SECURITY_HEADERS,
      },
    });

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset(path.join(__dirname, '../../apps/web/out'))],
      destinationBucket: siteBucket,
      distribution: distro,
      distributionPaths: ['/*'],
    });

    new CfnOutput(this, 'CloudFrontDomain', { value: distro.distributionDomainName });
  }
}
