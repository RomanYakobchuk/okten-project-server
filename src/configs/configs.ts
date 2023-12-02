import path from "path";
import dotenv from "dotenv";
// require('dotenv').config({ path: path.join(process.cwd(), 'environments', `${process.env.MODE}.env`)});
dotenv.config({path: path.resolve(__dirname, "../../../.env")});

interface ENV {
    PORT: string | undefined,
    SOCKET_PORT: string | undefined,
    STAT_PORT: string | undefined,
    HOST: any | undefined,
    MONGO_URL: string | undefined,
    DB_URI: string | undefined,
    MONGO_INITDB_DATABASE: string | undefined,
    MONGO_INITDB_ROOT_USERNAME: string | undefined,
    MONGO_INITDB_ROOT_PASSWORD: string | undefined,
    ACCESS_TOKEN_SECRET: string | undefined,
    REFRESH_TOKEN_SECRET: string | undefined,
    TOKEN_WITH_DATA: string | undefined,
    NO_REPLY_EMAIL: string | undefined,
    NO_REPLY_EMAIL_PASSWORD: string | undefined,
    TWILIO_ACCOUNT_SID: string | undefined,
    TWILIO_AUTH_TOKEN: string | undefined,
    TWILIO_NUMBER: string | undefined,
    CLOUD_NAME: string | undefined,
    CLOUD_API_KEY: any | undefined,
    CLOUD_API_SECRET: string | undefined,
    AWS_S3_BUCKET: string | undefined,
    AWS_S3_REGION: string | undefined,
    AWS_S3_ACCESS_KEY: string | undefined,
    AWS_S3_SECRET_KEY: string | undefined,
    AWS_S3_BUCKET_URL: string | undefined,
    FRONTEND_URL: string | undefined,
    CLIENT_URL: string | undefined,
    API_URL: string | undefined,
    SOCKET_URL: string | undefined,
    STAT_URL: string | undefined,
    GOOGLE_CLIENT_ID: string | undefined,
    GOOGLE_CLIENT_SECRET: string | undefined,
    GOOGLE_API_GET_USER_INFO: string | undefined,

    FACEBOOK_API_GET_USER_INFO: string | undefined,

    GITHUB_OAUTH_ROOT_URL: string | undefined,
    GITHUB_OAUTH_CLIENT_ID: string | undefined,
    GITHUB_OAUTH_CLIENT_SECRET: string | undefined,
    GITHUB_OAUTH_REDIRECT_URL: string | undefined,
    GITHUB_OAUTH_USER_DATA_URL: string | undefined
}

interface Config {
    PORT: string,
    SOCKET_PORT: string,
    STAT_PORT: string,
    HOST: any,
    MONGO_URL: string,
    DB_URI: string,

    MONGO_INITDB_DATABASE: string,
    MONGO_INITDB_ROOT_USERNAME: string,
    MONGO_INITDB_ROOT_PASSWORD: string,

    ACCESS_TOKEN_SECRET: string,
    REFRESH_TOKEN_SECRET: string,
    TOKEN_WITH_DATA: string,

    NO_REPLY_EMAIL: string,
    NO_REPLY_EMAIL_PASSWORD: string,

    TWILIO_ACCOUNT_SID: string,
    TWILIO_AUTH_TOKEN: string,
    TWILIO_NUMBER: string,

    CLOUD_NAME: string,
    CLOUD_API_KEY: any,
    CLOUD_API_SECRET: string,

    AWS_S3_BUCKET: string,
    AWS_S3_REGION: string,
    AWS_S3_ACCESS_KEY: string,
    AWS_S3_SECRET_KEY: string,
    AWS_S3_BUCKET_URL: string,

    FRONTEND_URL: string,
    CLIENT_URL: string,
    API_URL: string,
    SOCKET_URL: string,
    STAT_URL: string,

    GOOGLE_CLIENT_ID: string,
    GOOGLE_CLIENT_SECRET: string,
    GOOGLE_API_GET_USER_INFO: string,

    FACEBOOK_API_GET_USER_INFO: string,

    GITHUB_OAUTH_ROOT_URL: string,
    GITHUB_OAUTH_CLIENT_ID: string,
    GITHUB_OAUTH_CLIENT_SECRET: string,
    GITHUB_OAUTH_REDIRECT_URL: string,
    GITHUB_OAUTH_USER_DATA_URL: string
}
const getConfig = (): ENV => {
    return {
        PORT: process.env.PORT,
        STAT_PORT: process.env.STAT_PORT,
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
        SOCKET_URL: process.env.SOCKET_URL,
        STAT_URL: process.env.STAT_URL,

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

        MONGO_INITDB_DATABASE: process.env.MONGO_INITDB_DATABASE,
        MONGO_INITDB_ROOT_PASSWORD: process.env.MONGO_INITDB_ROOT_PASSWORD,
        MONGO_INITDB_ROOT_USERNAME: process.env.MONGO_INITDB_ROOT_USERNAME,
        SOCKET_PORT: process.env.SOCKET_PORT,

        GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        GOOGLE_API_GET_USER_INFO: process.env.GOOGLE_API_GET_USER_INFO,

        FACEBOOK_API_GET_USER_INFO: process.env.FACEBOOK_API_GET_USER_INFO,

        GITHUB_OAUTH_ROOT_URL: process.env.GITHUB_OAUTH_ROOT_URL,
        GITHUB_OAUTH_CLIENT_ID: process.env.GITHUB_OAUTH_CLIENT_ID,
        GITHUB_OAUTH_CLIENT_SECRET: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        GITHUB_OAUTH_REDIRECT_URL: process.env.GITHUB_OAUTH_REDIRECT_URL,
        GITHUB_OAUTH_USER_DATA_URL: process.env.GITHUB_OAUTH_USER_DATA_URL
    }
}

const getSantizedConfig =(config: ENV): Config => {
    for (const [key, value] of Object.entries(config)) {
        if (value === undefined) {
            throw new Error(`Missing key ${key} in config`)
        }
    }
    return config as Config
};

const config = getConfig();

const sanitizedConfig = getSantizedConfig(config);
export default sanitizedConfig;

// const PORT = process.env.PORT;
// const HOST = process.env.HOST;
// const DB_URI = process.env.DB_URI;
// const MONGO_URL = process.env.MONGO_URL;
//
// const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
// const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
// const TOKEN_WITH_DATA = process.env.TOKEN_WITH_DATA;
//
// const NO_REPLY_EMAIL = process.env.NO_REPLY_EMAIL;
// const NO_REPLY_EMAIL_PASSWORD = process.env.NO_REPLY_EMAIL_PASSWORD;
//
// const FRONTEND_URL = process.env.FRONTEND_URL;
// const CLIENT_URL = process.env.CLIENT_URL;
// const API_URL = process.env.API_URL;
//
// const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
// const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
// const TWILIO_NUMBER = process.env.TWILIO_NUMBER;
//
// const CLOUD_NAME = process.env.CLOUD_NAME;
// const CLOUD_API_KEY = process.env.CLOUD_API_KEY;
// const CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;
//
// const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
// const AWS_S3_REGION = process.env.AWS_S3_REGION;
// const AWS_S3_ACCESS_KEY = process.env.AWS_S3_ACCESS_KEY;
// const AWS_S3_SECRET_KEY = process.env.AWS_S3_SECRET_KEY;
// const AWS_S3_BUCKET_URL = process.env.AWS_S3_BUCKET_URL;
//
// export {
//     PORT,
//     HOST,
//     DB_URI,
//     ACCESS_TOKEN_SECRET,
//     REFRESH_TOKEN_SECRET,
//     TOKEN_WITH_DATA,
//     API_URL,
//     CLIENT_URL,
//     FRONTEND_URL,
//     MONGO_URL,
//     TWILIO_ACCOUNT_SID,
//     TWILIO_AUTH_TOKEN,
//     TWILIO_NUMBER,
//     NO_REPLY_EMAIL,
//     NO_REPLY_EMAIL_PASSWORD,
//     AWS_S3_BUCKET,
//     AWS_S3_REGION,
//     AWS_S3_ACCESS_KEY,
//     AWS_S3_BUCKET_URL,
//     AWS_S3_SECRET_KEY,
//     CLOUD_API_KEY,
//     CLOUD_API_SECRET,
//     CLOUD_NAME,
// }
