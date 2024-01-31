import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {CloudService} from "../services";

class FileController {
    private cloudService: CloudService;
    constructor() {
        this.cloudService = new CloudService();

        this.uploadFile = this.uploadFile.bind(this);
    }

    async uploadFile(req: CustomRequest, res: Response, next: NextFunction) {

        const {chatId} = req.body;
        try {
            const folderName = `chats/${chatId}`;
            if (req.files?.files) {
                const files = req.files?.files;
                if (files?.name) {
                    const {url} = await this.cloudService.uploadFile(files, folderName);
                }
            } else {
                return res.status(400).json({message: 'Files not loaded'});
            }

        } catch (e) {
            next(e)
        }
    }
}