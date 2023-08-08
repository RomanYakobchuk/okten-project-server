import {MessageModel} from "../dataBase";

class MessageService {
    create(params: any) {
        return MessageModel.create(params)
    }
    findAll(params: any) {
        return MessageModel.find(params)
    }
    findOne(params: any) {
        return MessageModel.findOne(params)
    }
}

export {
    MessageService
}