import cloudinary from "cloudinary";

import {configs} from "../configs";
import {UploadedFile} from "express-fileupload";
import {IPicture} from "../interfaces/common";

const cloud = cloudinary.v2;

cloud.config({
    cloud_name: configs.CLOUD_NAME,
    api_key: configs.CLOUD_API_KEY,
    api_secret: configs.CLOUD_API_SECRET
})

interface Repository {
    uploadFile(file: UploadedFile, folder: string): Promise<{url: string}>,
    updateFile(url: string, newFile: UploadedFile, folder: string): Promise<{url: string}>,
    deleteFile(url: string, folder: string): void,
    uploadPictures(folder: string, pictures: UploadedFile[]): Promise<IPicture[]>
}
class CloudService implements Repository {
    async uploadFile(file: UploadedFile, folder: string)  {
        const {secure_url} = await cloud.uploader.upload(file.tempFilePath, {folder: folder});

        return {url: secure_url}
    }

    async updateFile(url: string, newFile: UploadedFile, folder: string) {

        if (url?.includes("https://res.cloudinary.com")) {

            const publicId = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));

            const {secure_url} = await cloud.uploader.upload(newFile.tempFilePath, {public_id: publicId, folder: folder});

            return {url: secure_url}
        } else {
            const {url} = await this.uploadFile(newFile, folder);

            return {url}
        }
    }
    async deleteFile(url: string, folder: string)  {
        if (url?.includes("https://res.cloudinary.com")) {

            const publicId = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));

            const path = `${folder}/${publicId}`;

            await cloud.uploader.destroy(path);
        }
    }

    async uploadPictures(folder: string, pictures: UploadedFile[]) {
        return await Promise.all(
            pictures.map(async (item) => {
                const {url} = await this.uploadFile(item, folder);
                return {name: item.name, url};
            })
        );
    }
}


export {
    CloudService
}