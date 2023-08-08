export {};

declare global {
    namespace NodeJs {
        interface ProcessEnv {
            PORT: string,
            SOCKET_PORT: string,
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
            API_URL: string
        }
    }
}

