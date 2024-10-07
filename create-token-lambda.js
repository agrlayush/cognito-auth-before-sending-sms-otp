import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import crypto from 'crypto';
const dynamoDB = DynamoDBDocument.from(new DynamoDB());
export const handler = async (event) => {
    const token = crypto.randomBytes(16).toString('hex');
    const expirationTime = Math.floor(Date.now() / 1000) + 300; // 5 minutes from now
    
    const params = {
        TableName: 'SingleUseTokens',
        Item: {
            token: token,
            expirationTime: expirationTime,
            used: false
        }
    };
    
    try {
        await dynamoDB.put(params);
        return {
            statusCode: 200,
            body: JSON.stringify({ token: token })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error generating token' })
        };
    }
};