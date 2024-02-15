import {model, Schema} from "mongoose";
import {IReactionModel} from "../interfaces/model";
import {IReaction} from "../interfaces/common";

const Reaction = new Schema({
    likes: [
        {
            type: Schema.Types.ObjectId,
            refPath: 'user'
        }
    ],
    unLikes: [
        {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    ],
    item: {
        type: Schema.Types.ObjectId,
        refPath: 'field'
    },
    field: {
        type: String,
        enum: ['establishment', 'commentItem', 'establishmentNews']
    }
}, {timestamps: true})

const ReactionsSchema: IReactionModel = model<IReaction, IReactionModel>('reaction', Reaction);

export {
    ReactionsSchema
}