import {NextFunction, Response} from "express";

import {CustomRequest} from "../interfaces/func";
import {Views, View} from "../dataBase";
import {IInstitution, IOauth, IUser, IViews} from "../interfaces/common";

class ViewsController {

    constructor() {
        this.addViewForInstitution = this.addViewForInstitution.bind(this);
    }
    async addViewForInstitution(req: CustomRequest, res: Response, next: NextFunction) {
        const institution = req.data_info as IInstitution;
        const {userId} = req.user as IOauth;
        const user = userId as IUser;
        try {
            if (user?._id?.toString() !== institution?.createdBy?.toString()) {
                const views = institution.views as IViews;
                let currentViews = await Views.findById(views?._id);

                if (!currentViews || currentViews.viewsWith?.toString() !== institution?._id?.toString()) {
                    currentViews = await Views.create({
                        refField: 'institution',
                        viewsWith: institution?._id
                    })

                    institution.views = currentViews?._id;
                    await institution.save();
                }

                const isExistView = await View.findOne({viewsId: currentViews?._id, user: user?._id});
                if (!isExistView) {
                    await View.create({
                        viewsId: currentViews?._id,
                        user: user?._id
                    })
                    currentViews.viewsNumber++;

                    await currentViews.save();
                }
            }
            res.status(200).json(institution);
        } catch (e) {
            next(e)
        }
    }
}

export default new ViewsController();