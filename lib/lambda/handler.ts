import * as AWS from 'aws-sdk';
import { APIGatewayEvent } from 'aws-lambda';

export const handler = async (event: APIGatewayEvent): Promise<any> => {
    console.info("Environment Variables\n" + JSON.stringify(process.env, null, 2));
    console.info("Event\n" + JSON.stringify(event, null, 2))
    return {
        'statusCode': 200,
        'body': 'usage: ?targetUrl=URL'
    }
}

function createShortUrl(event: APIGatewayEvent) {
    const tableName: string = process.env['TABLE_NAME'] !== undefined ? process.env['TABLE_NAME'] : '';
    const targetUrl: string = event.queryStringParameters!['targetUrl'];
    const Db = new AWS.DynamoDB();
    const params: AWS.DynamoDB.PutItemInput = { 
        TableName: tableName, 
        Item: {
            'id': {'S': 'abcdefg' },
            'target_url': {'S': 'https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/dynamodb-example-table-read-write.html'}               
        }
    };
    
    Db.putItem(params, function(err, data) {
        if(err) {
            console.log("Error", err)
        } else {
            console.log("Success", data)
        }
    })

    return {
        'statusCode': 200,
    }
}

 function readShortUrl(event: APIGatewayEvent) {
    /* Parse redirect ID from path */
    const id:string = event.queryStringParameters!['proxy'];

    /* Pull out the DynamoDB table name from the environment */
    const tableName: string = process.env['TABLE_NAME'] !== undefined ? process.env['TABLE_NAME'] : '';

    /* Load redirect target from DynamoDB */
    const Db = new AWS.DynamoDB();
    const params: AWS.DynamoDB.BatchGetItemInput = {
        RequestItems: {
            tableName: {
                Keys: [
                    {'Id': {S: 'abcdefg'}}
                ]
            } 
        }
    }

    Db.batchGetItem(params, function(err, data) {
        if(err) {
            console.log("Error", err)
            return {
                'statusCode': 500
             }
        } else {
            console.log("Success", data)
            if(data.Responses === undefined){
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'text/plain'},
                    'body': 'No redirect found for ' + id
                }    
            } else {
                data.Responses.TABLE_NAME.forEach(function(element, index, array) {
                    console.debug("Response: ", element);
            
                    // Respond with a redirect
                    return {
                        'statusCode': 301,
                        'headers': {
                            'Location': element
                            }
                        }
                
                });
            }
        }
        return {
            'statusCode': 500
         }

    })
 }