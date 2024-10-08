# AWS Cognito OTP Authentication with Pre-auth Lambda Token Validation

This repository contains an implementation of an AWS Cognito-based user authentication system using phone numbers and one-time passwords (OTP). The OTP is delivered via SMS to users. To safeguard the system from bots that may trigger multiple OTP requests, a token-based validation process is implemented using AWS Lambda, DynamoDB, and API Gateway.

## Problem Statement

In this solution, the API that receives the user's phone number to send the OTP is public and lacks built-in security measures, such as validating requests. This creates the potential for abuse by bots that can send hundreds of OTP requests.

### Objective:
Implement a solution to protect the OTP API from bots by using a token-based validation system, which validates each request before sending the OTP.

## Solution Overview

To prevent bots from triggering OTP requests, we implemented a pre-auth Lambda trigger in AWS Cognito that validates a single-use token before allowing OTP delivery.

### High-level Steps:
1. **Token Generation**: 
    - A Lambda function behind an API Gateway generates a single-use token and stores it in a DynamoDB table with a 5-minute Time-to-Live (TTL).
2. **Frontend Token Request**: 
    - The frontend HTML page triggers the Lambda function to get a token when the page loads.
3. **Auth API Request**: 
    - While making the Auth API call with the user's phone number, the token is passed in the request under the `custom-token` attribute.
4. **Pre-auth Lambda Validation**: 
    - The pre-auth Lambda function checks the token’s validity by querying the DynamoDB table. If valid, it deletes the token and allows the OTP to be sent.
5. **OTP Send Flow**: 
    - If token validation fails, the OTP is not sent, and an error message is displayed on the frontend.

## DynamoDB Table Schema

| Attribute  | Type   | Description                      |
|------------|--------|----------------------------------|
| token      | String | Primary Key: Unique single-use token |
| timestamp  | Number | TTL field: 5-minute expiry       |
| used       | Boolean| Indicates whether the token has been used |

### Table Details:
- **Table Name**: `SingleUseToken`
- **Primary Key**: `token` (String)
- **Other Attributes**: `timestamp` (TTL), `used` (Boolean)

## Project Structure

```
/project-root
  ├── lambdas/
  │   ├── generate-token/
  │   │   └── index.js  # Lambda to generate tokens
  │   └── pre-auth/
  │       └── index.js  # Lambda to validate tokens
  ├── html/
  │   └── index.html   # Frontend to request OTP
  ├── README.md        # This file
```

## Setup and Deployment

### 1. Create DynamoDB Table
Create a DynamoDB table named `SingleUseToken` with the following attributes:
- **Primary Key**: `token` (String)
- **Other Attributes**: `timestamp` (TTL), `used` (Boolean)

Enable TTL on the `timestamp` field to automatically delete expired tokens.

### 2. Lambda Functions
- **Generate Token Lambda**: This function creates a single-use token and stores it in DynamoDB.
- **Pre-auth Lambda**: This function validates the token before sending the OTP.

### 3. API Gateway
Create an API Gateway to expose the `generate-token` Lambda function to the frontend. The API Gateway will allow the frontend to trigger token generation.

### 4. AWS Cognito Setup

- **Enable Custom Attributes**: On your AWS Cognito Console, under the User Pool select the Sign-up Experience tab. Add a custom attributes with Name: **custom-token** with Type: String.

- **Add App Client**: To configure a **Pre-auth Lambda Trigger** in AWS Cognito user pool, navigate to App Integration tab, find App Client List. Create a New App Client with Authentication Flows **ALLOW_CUSTOM_AUTH**. In the read and write permission, check the box against **custom:custom-token** for both Read and Write options.

- **Pre-auth Lambda Trigger**: To configure a **Pre-auth Lambda Trigger** in AWS Cognito user pool, navigate to User Pool properties. Add a lambda trigger for Sign-up and Authentication for Pre-- Trigger. In the lambda function option, select the Pre-auth lambda function created above.

### 4. Frontend HTML

Rename config_template.js to config.js. Replace variables in config.js to values from your cognito user pool and API Gateway.

index.html uses the config.js file for application variables.

### 6. Deployment

1. Deploy the Lambda functions to AWS.
2. Set up API Gateway to expose the token generation Lambda.
3. Configure the DynamoDB table with the required schema.
4. Run the index.html in your local environment. (You may have to disable CORS on your browser)
5. Test the flow by triggering the OTP request from the UI.

## How it Works

1. **Token Generation**: When the page loads, a single-use token is generated by the Lambda function and stored in DynamoDB.
2. **OTP Request**: When the user requests an OTP, the token is passed in the request to the pre-auth Lambda function.
3. **Token Validation**: The pre-auth Lambda checks if the token is valid. If valid, it deletes the token and allows the OTP to be sent.
4. **Secure OTP Delivery**: If token validation fails, the OTP is not sent, preventing abuse by bots.