import twilio from 'twilio';
import {configs} from '../configs';

const client = twilio(configs.TWILIO_ACCOUNT_SID, configs.TWILIO_AUTH_TOKEN);

class SmsService {
    async sendSMS(phone: string, message: string) {
        try {
            console.log(`SMS start sending | to: ${phone} | message: ${message}`);

            const smsInfo = await client.messages.create({
                from: configs.TWILIO_NUMBER,
                to: phone,
                body: message,
            });

            console.log(`SMS response | status: ${smsInfo.status} | sid: ${smsInfo.sid}`);
        } catch (e) {
            console.error(`SMS error | to: ${phone} | error: ${e}`);
        }
    }
}

export {
    SmsService
}