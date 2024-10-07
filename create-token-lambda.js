import crypto from 'crypto';

const secret_salt = "your-random-salt"
export const handler = async (event) => {
    console.log(event)
    var user_ip = event.headers['X-Forwarded-For']
    var user_agent = event.headers['User-Agent']
    var timestamp = Date.now()
    var param = {
        "secret_salt": secret_salt,
        "user_ip": user_ip,
        "user_agent":user_agent,
        "timestamp": timestamp
    }

    var param_string = JSON.stringify(param);
    const token=crypto.createHash('sha256').update(param_string).digest('hex');
    return {
            statusCode: 200,
            body: JSON.stringify({ token: token, timestamp: timestamp })
    };
    
};