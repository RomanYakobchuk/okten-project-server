import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {Views, View} from "../dataBase";
import {IEstablishment, IOauth, ISubscribe, IUser, IViews} from "../interfaces/common";

class ViewsController {

    constructor() {
        this.addViewForEstablishment = this.addViewForEstablishment.bind(this);
    }
    async addViewForEstablishment(req: CustomRequest, res: Response, next: NextFunction) {
        const establishment = req.data_info as IEstablishment;
        const subscribe = req.subscribe as ISubscribe;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        try {
            if (user?._id?.toString() !== establishment?.createdBy?.toString()) {
                const views = establishment.views as IViews;
                let currentViews = await Views.findById(views?._id);

                if (!currentViews || currentViews.viewsWith?.toString() !== establishment?._id?.toString()) {
                    currentViews = await Views.create({
                        refField: 'establishment',
                        viewsWith: establishment?._id
                    })

                    establishment.views = currentViews?._id;
                    await establishment.save();
                }

                const isExistView = await View.findOne({viewsId: currentViews?._id, user: user?._id});
                if (!isExistView) {
                    await View.create({
                        viewsId: currentViews?._id,
                        user: user?._id,
                        verify: establishment.verify
                    })
                    currentViews.viewsNumber++;

                    await currentViews.save();
                }
            }
            res.status(200).json({
                establishment,
                subscribe
            });
        } catch (e) {
            next(e)
        }
    }
}

export default new ViewsController();