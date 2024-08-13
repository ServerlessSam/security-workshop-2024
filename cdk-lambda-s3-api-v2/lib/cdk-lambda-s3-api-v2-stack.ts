import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export class CdkLambdaS3ApiV2Stack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Create an S3 bucket
        const bucket = new s3.Bucket(this, 'PatientDataBucket', {
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            publicReadAccess: true,
            blockPublicAccess: {
              blockPublicAcls: false,
              blockPublicPolicy: false,
              ignorePublicAcls: false,
              restrictPublicBuckets: false,
            }
        });

        // Create a bucket policy to make all objects publicly accessible
        bucket.addToResourcePolicy(new iam.PolicyStatement({
          actions: [
            's3:GetObject'
          ],
          resources: [`${bucket.bucketArn}/*`],
          principals: [new iam.AnyPrincipal()],
        }))
;
        // Create a Lambda function
        const lambdaFunction = new lambda.Function(this, 'PatientDataFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset('lambda'),
            handler: 'index.handler',
            environment: {
                BUCKET_NAME: bucket.bucketName,
            },
        });

        // Grant the Lambda function permissions to write to the S3 bucket
        bucket.grantPut(lambdaFunction);

        // Create an API Gateway REST API resource backed by the Lambda function
        const api = new apigateway.LambdaRestApi(this, 'PatientDataApi', {
            handler: lambdaFunction,
            proxy: false,
        });

        // Create a POST method on the API resource
        const patient = api.root.addResource('patient');
        patient.addMethod('POST');
    }
}