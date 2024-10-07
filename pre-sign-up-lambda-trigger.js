import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';

const dynamoDB = DynamoDBDocument.from(new DynamoDB());

export const handler = async (event) => {
    const token = event.request.userAttributes['custom:custom-token'];
    // console.log(token)
    
    const params = {
        TableName: 'SingleUseTokens',
        Key: { "token": token }
    };
    
    try {
        const result = await dynamoDB.get(params);
        // console.log(result);
        if (!result.Item) {
            throw new Error('Invalid token');
        }
        
        if (result.Item.used) {
            throw new Error('Token already used');
        }
        
        if (result.Item.expirationTime < Math.floor(Date.now() / 1000)) {
            throw new Error('Token expired');
        }
        
        // Mark token as used
        await dynamoDB.update({
            TableName: 'SingleUseTokens',
            Key: { token: token },
            UpdateExpression: 'SET used = :used',
            ExpressionAttributeValues: { ':used': true }
        });
        
        // Allow sign up to proceed
        return event;
    } catch (error) {
        console.error('Error:', error);
        throw new Error('Error validating token');
    }
};