// import S3 from 'aws-sdk/clients/s3';
// import path from 'path';
// import uid from 'uuid';
//
//
// import {configs} from '../configs';
//
// const uuid = uid.v4;
//
// const BucketConfig = new S3({
//     region: configs.AWS_S3_REGION,
//     credentials: {
//         secretAccessKey: configs.AWS_S3_SECRET_KEY,
//         accessKeyId: configs.AWS_S3_ACCESS_KEY,
//     }
// });
//
// const uploadFile = async (file: any, itemType: string, itemId: string) => {
//     const Key = _buildFilePath(file?.name, itemType, itemId);
//
//     return BucketConfig
//         .upload({
//             Bucket: configs.AWS_S3_BUCKET,
//             Key,
//             ContentType: file.mimetype,
//             ACL: "public-read",
//             Body: file.data
//         })
//         .promise();
// }
//
// const updateFile = async (file: any, fileURL: string) => {
//     const path = fileURL?.split(configs.AWS_S3_BUCKET_URL)?.pop();
//
//     return BucketConfig
//         .putObject({
//             Bucket: configs.AWS_S3_BUCKET,
//             Key: path,
//             ContentType: file.mimetype,
//             ACL: "public-read",
//             Body: file.data
//         })
//         .promise();
// }
//
// const deleteFile = async (fileURL: string) => {
//     const path = fileURL.split(configs.AWS_S3_BUCKET_URL).pop();
//
//     return BucketConfig
//         .deleteObject({
//             Bucket: configs.AWS_S3_BUCKET,
//             Key: path,
//         })
//         .promise();
// };
//
// export {
//     uploadFile,
//     updateFile,
//     deleteFile,
// }
//
// function _buildFilePath(fileName = '', itemType: string, itemId: string) {
//     const ext = path.extname(fileName); // .jpg
//
//     return `${itemType}/${itemId}/${uuid()}${ext}`;
// }


import {S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand} from '@aws-sdk/client-s3';
import path from 'path';
import {v4 as uuidv4} from 'uuid';
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {UploadedFile} from "express-fileupload";

import {configs} from '../configs';

const s3Client = new S3Client({
    region: configs.AWS_S3_REGION,
    credentials: {
        secretAccessKey: configs.AWS_S3_SECRET_KEY,
        accessKeyId: configs.AWS_S3_ACCESS_KEY,
    },
});

class S3Service {
    uploadFile = async (file: UploadedFile, itemType: string, itemId: string) => {
        const Key = _buildFilePath(file?.name, itemType, itemId);

        const uploadParams = {
            Bucket: configs.AWS_S3_BUCKET,
            Key,
            ContentType: file.mimetype,
            ACL: "public-read",
            Body: file.data
        };

        const command = new PutObjectCommand(uploadParams);

        await s3Client.send(command);

        return _getFileUrl(Key);
    }

    updateFile = async (file: UploadedFile, fileURL: string) => {
        const path = fileURL?.split(configs.AWS_S3_BUCKET_URL)?.pop() as string;

        await s3Client.send(new DeleteObjectCommand({
            Bucket: configs.AWS_S3_BUCKET,
            Key: path
        }));

        const ext = file?.name?.split(".").pop() as string; // .jpg
        const u = path?.split('/')?.pop() as string;
        const newPath = `${path?.split(u)[0]}${uuidv4()}.${ext}`;
        const uploadParams = {
            Bucket: configs.AWS_S3_BUCKET,
            Key: newPath,
            ContentType: file.mimetype,
            ACL: "public-read",
            Body: file.data
        };

        const command = new PutObjectCommand(uploadParams);

        await s3Client.send(command);

        return _getFileUrl(newPath);
    }

    deleteFile = async (fileURL: string) => {
        const path = fileURL?.split(configs.AWS_S3_BUCKET_URL)?.pop() as string;

        const deleteParams = {
            Bucket: configs.AWS_S3_BUCKET,
            Key: path,
        };

        const command = new DeleteObjectCommand(deleteParams);

        return s3Client.send(command);
    }
}

export {
    S3Service
}

const _getFileUrl = async (Key: string) => {
    const params = {
        Bucket: configs.AWS_S3_BUCKET,
        Key
    };

    const command = new GetObjectCommand(params);

    const url = await getSignedUrl(s3Client, command);

    return url?.split('?')[0];
};
function _buildFilePath(fileName = '', itemType: string, itemId: string) {
    const ext = path.extname(fileName); // .jpg

    return `${itemType}/${itemId}/${uuidv4()}${ext}`;
}
