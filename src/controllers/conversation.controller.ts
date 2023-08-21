import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {ConversationService} from "../services";
import {IConvMembers, IInstitution, ILastConvMessage, IOauth, IUser} from "../interfaces/common";
import {Schema} from "mongoose";

class ConversationController {
    private conversationService: ConversationService;

    constructor() {
        this.conversationService = new ConversationService();

        this.createConv = this.createConv.bind(this);
        this.getConvByUserId = this.getConvByUserId.bind(this);
        this.getConvTwoUserId = this.getConvTwoUserId.bind(this);
        this.updateTitleName = this.updateTitleName.bind(this);
        this.getConvById = this.getConvById.bind(this);
    }

    async createConv(req: CustomRequest, res: Response, next: NextFunction) {
        const user = req.userExist as IUser;
        const institution = req.data_info as IInstitution;
        try {
            const conv = await this.conversationService.getOne({
                userId: user?._id,
                managerId: institution?.createdBy,
                institutionId: institution?._id
            });

            if (conv) {
                res.status(400).json('Conversation is exist');
            } else {
                const currentDate = new Date();
                const members = [
                    {
                        user: user?._id as Schema.Types.ObjectId,
                        connectedAt: currentDate as Date,
                        role: user?.status,
                    },
                    {
                        user: institution?.createdBy as Schema.Types.ObjectId,
                        connectedAt: currentDate as Date,
                        role: 'manager'
                    }
                ]
                const newConv = await this.conversationService.createConv({
                    members: members as IConvMembers[],
                    institutionId: institution?._id as Schema.Types.ObjectId,
                    userName: user?.name,
                    institutionTitle: institution?.title,
                    lastMessage: {} as ILastConvMessage,
                });

                res.status(200).json(newConv);
            }
        } catch (e) {
            next(e)
        }
    }
    async getConvByUserId(req: CustomRequest, res: Response, next: NextFunction) {
        const {_end, _start, _sort, _order, title_like, userId: searchUserId, institutionId} = req.query;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;

        try {
            const {
                items,
                count
            } = await this.conversationService.getAllByUser(Number(_end), Number(_start), _sort, _order, user?.status, title_like as string, searchUserId as string, institutionId as string);

            console.log(items)
            res.header('x-total-count', `${count}`);
            res.header('Access-Control-Expose-Headers', 'x-total-count');

            res.status(200).json(items);
        } catch (e) {
            next(e)
        }
    }
    async getConvTwoUserId(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const {userId, institutionId} = req.body;

            const conv = await this.conversationService
                .getOne({members: {$elemMatch: {user: userId}}, institutionId})
                .populate([
                    {path: 'members.user', select: '_id avatar name'},
                    {path: 'institutionId', select: '_id title mainPhoto'},
                ]);

            res.status(200).json(conv);
        } catch (e) {
            next(e)
        }
    }
    async updateTitleName(req: CustomRequest, res: Response, next: NextFunction) {
        const conversation = req.conversation;
        const {newName, newTitle} = req.body;
        const status = req.newStatus;
        try {
            if (status === 'admin' || status === 'manager') {
                conversation.userName = newName
            }
            if (status === 'admin' || status === 'user') {
                conversation.institutionTitle = newTitle
            }
            await conversation.save();

            res.status(200).json({message: 'Value updated successfully'});
        } catch (e) {
            next(e)
        }
    }
    async getConvById(req: CustomRequest, res: Response, next: NextFunction) {
        const conversation = req.conversation;
        try {
            res.status(200).json(conversation)
        } catch (e) {
            next(e)
        }
    }
}

export default new ConversationController();