const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require("multer");

const {configs} = require("../configs");


cloudinary.config({
    cloud_name: configs.CLOUD_NAME,
    api_key: configs.CLOUD_API_KEY,
    api_secret: configs.CLOUD_API_SECRET
})

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: ''
    }
})

const uploadFile = async (file, folder) => {
    const {secure_url} = await cloudinary.uploader.upload(file, {folder: folder});

    return {url: secure_url}
}

const updateFile = async (url, newFile, folder) => {

    if (url?.includes("https://res.cloudinary.com")) {

        const publicId = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));

        const {secure_url} = await cloudinary.uploader.upload(newFile, {public_id: publicId, folder: folder});

        return {url: secure_url}
    } else {
        const {url} = await uploadFile(newFile, folder);

        return {url}
    }
}


const deleteFile = async (url, folder) => {
    if (url?.includes("https://res.cloudinary.com")) {

        const publicId = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));

        const path = `${folder}/${publicId}`;

        await cloudinary.uploader.destroy(path);
    }
}

module.exports = {
    uploadFile,
    updateFile,
    deleteFile
}