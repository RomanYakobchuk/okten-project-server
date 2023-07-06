const path = require("path");
require('dotenv').config({ path: path.join(process.cwd(), 'environments', `${process.env.MODE}.env`)});

module.exports = {
    PORT: process.env.PORT,
    HOST: process.env.HOST,
    DB_URI: process.env.DB_URI,
    MONGO_URL: process.env.MONGO_URL,

    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
    TOKEN_WITH_DATA: process.env.TOKEN_WITH_DATA,

    NO_REPLY_EMAIL: process.env.NO_REPLY_EMAIL,
    NO_REPLY_EMAIL_PASSWORD: process.env.NO_REPLY_EMAIL_PASSWORD,

    FRONTEND_URL: process.env.FRONTEND_URL,
    CLIENT_URL: process.env.CLIENT_URL,
    API_URL: process.env.API_URL,

    TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
    TWILIO_NUMBER: process.env.TWILIO_NUMBER,

    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUD_API_KEY: process.env.CLOUD_API_KEY,
    CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,

    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    AWS_S3_REGION: process.env.AWS_S3_REGION,
    AWS_S3_ACCESS_KEY: process.env.AWS_S3_ACCESS_KEY,
    AWS_S3_SECRET_KEY: process.env.AWS_S3_SECRET_KEY,
    AWS_S3_BUCKET_URL: process.env.AWS_S3_BUCKET_URL,
};