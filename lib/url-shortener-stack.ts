import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as awslambda from '@aws-cdk/aws-lambda';
import * as awsapigateway from '@aws-cdk/aws-apigateway';


export class UrlShortenerStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'mapping-table', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
    });

    const lambda = new awslambda.Function(this, 'backend', { 
      runtime: awslambda.Runtime.PYTHON_3_8,
      handler: 'handler.main', 
      code: awslambda.Code.fromAsset('./lib/lambda')});

    table.grantReadWriteData(lambda);
    lambda.addEnvironment("TABLE_NAME", table.tableName);
    
    const api = new awsapigateway.LambdaRestApi(this, 'api', {
      handler: lambda
    });
    
  } 

}


