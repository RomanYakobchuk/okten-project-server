// const S3 = require('aws-sdk/clients/s3');
// const path = require('path');
// const uuid = require('uuid').v4;
//
// const {configs} = require('../configs');
//
// const BucketConfig = new S3({
//     region: configs.AWS_S3_REGION,
//     secretAccessKey: configs.AWS_S3_SECRET_KEY,
//     accessKeyId: configs.AWS_S3_ACCESS_KEY,
// });
//
// const uploadFile = async (file, itemType, itemId) => {
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
// const updateFile = async (file, fileURL) => {
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
// const deleteFile = async (fileURL) => {
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
// module.exports = {
//     uploadFile,
//     updateFile,
//     deleteFile,
// }
//
// function _buildFilePath(fileName = '', itemType, itemId) {
//     const ext = path.extname(fileName); // .jpg
//
//     return `${itemType}/${itemId}/${uuid()}${ext}`;
// }


const {S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand} = require('@aws-sdk/client-s3');
const path = require('path');
const {configs} = require('../configs');
const {v4: uuidv4} = require('uuid');
const {getSignedUrl} = require("@aws-sdk/s3-request-presigner");

const s3Client = new S3Client({
    region: configs.AWS_S3_REGION,
    credentials: {
        secretAccessKey: configs.AWS_S3_SECRET_KEY,
        accessKeyId: configs.AWS_S3_ACCESS_KEY,
    },
});

const uploadFile = async (file, itemType, itemId) => {
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
};

const updateFile = async (file, fileURL) => {
    const path = fileURL?.split(configs.AWS_S3_BUCKET_URL)?.pop();

    await s3Client.send(new DeleteObjectCommand({
        Bucket: configs.AWS_S3_BUCKET,
        Key: path
    }));

    const ext = file?.name?.split(".").pop(); // .jpg
    const u = path?.split('/')?.pop();
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
};

const deleteFile = async (fileURL) => {
    const path = fileURL?.split(configs.AWS_S3_BUCKET_URL)?.pop();

    const deleteParams = {
        Bucket: configs.AWS_S3_BUCKET,
        Key: path,
    };

    const command = new DeleteObjectCommand(deleteParams);

    return s3Client.send(command);
};

const _getFileUrl = async (Key) => {
    const params = {
        Bucket: configs.AWS_S3_BUCKET,
        Key
    };

    const command = new GetObjectCommand(params);

    const url = await getSignedUrl(s3Client, command);

    return url?.split('?')[0];
};

module.exports = {
    uploadFile,
    updateFile,
    deleteFile,
}

function _buildFilePath(fileName = '', itemType, itemId) {
    const ext = path.extname(fileName); // .jpg

    return `${itemType}/${itemId}/${uuidv4()}${ext}`;
}
