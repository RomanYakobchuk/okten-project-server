import {Model, model, Schema, Document} from "mongoose";
import {IView, IViews} from "../interfaces/common";


const ViewSchema = new Schema<IView & Document>(
    {
        viewsId: {
            type: Schema.Types.ObjectId,
            ref: 'views'
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'user',
        },
        verify: {
            type: String,
            index: true,
            default: 'draft',
        },
    },
    { timestamps: true }
);

interface IViewsModel extends Model<IViews>{
    getTopComponents(limit: number): Promise<any>,
}
const ViewsSchema = new Schema({
    refField: {
        type: String,
        required: true
    },
    viewsWith: {
        type: Schema.Types.ObjectId,
        refPath: 'refField',
        required: true
    },
    viewsNumber: {
        type: Number,
        default: 0
    },
    verify: {
        type: String,
        index: true,
        default: 'draft'
    }
}, {timestamps: true})

ViewsSchema.statics.getTopComponents = async function (limit: number) {
    return await this.find({verify: {$regex: new RegExp('published', "i")}}).sort({['viewsNumber']: -1}).limit(limit).exec();
};
const View = model<IView & Document>("view", ViewSchema);
const Views: IViewsModel = model<IViews, IViewsModel>("views", ViewsSchema);


export {
    View,
    Views
}
