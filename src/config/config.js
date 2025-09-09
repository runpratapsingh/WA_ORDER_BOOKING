import dotenv from 'dotenv';

dotenv.config();

export const config = {
  metaToken: process.env.META_TOKEN,
  phoneNumberId: process.env.PHONE_NUMBER_ID,
  webhookVerifyToken: process.env.WEBHOOK_VERIFY_TOKEN || 'myVerify123',
  port: process.env.PORT || 3000,
};