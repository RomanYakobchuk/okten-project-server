import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {MessageService} from "../services";
import {MessageModel as Message} from "../dataBase";
import {IMessage} from "../interfaces/common";

class MessageController {

    private messageService: MessageService;

    constructor() {
        this.messageService = new MessageService();

        this.createMessage = this.createMessage.bind(this);
        this.getMessagesBySenderId = this.getMessagesBySenderId.bind(this);
        this.receiverData = this.receiverData.bind(this);
    }

    async createMessage(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {conversationId, sender, text, replyTo} = req.body;
            await this.messageService.create({
                conversationId,
                sender,
                text,
                replyTo,
                read: []
            });
            // const mes = await messageService.findOne({_id: message?._id}).populate({path: 'sender', select: '_id name avatar'});

            res.status(200).json({message: 'Message send successfully'})
        } catch (e) {
            next(e)
        }
    }
    getMessagesBySenderId = async (req: CustomRequest, res: Response, next: NextFunction) => {
        const conversation = req.conversation;
        const {_end, _start, _sort, _order, title_like} = req.query;
        try {

            const count = await Message.countDocuments({
                conversationId: conversation?._id
            });
            const messages = await this.messageService
                .findAll({
                    conversationId: conversation?._id
                })
                .populate([
                    {path: 'replyTo', select: '_id sender text', populate: {path: 'sender', select: '_id name'}}
                ])
                .limit(Number(_end) - Number(_start))
                .skip(Number(_start))
                .sort({createdAt: -1})
                .exec();

            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(messages)
        } catch (e) {
            next(e)
        }
    }
    receiverData = async (req: CustomRequest, res: Response, next: NextFunction) => {
        const user = req.userExist;
        try {
            res.status(200).json({
                _id: user?._id,
                avatar: user?.avatar,
                name: user?.name
            })
        } catch (e) {
            next(e)
        }
    }
}

export default new MessageController();