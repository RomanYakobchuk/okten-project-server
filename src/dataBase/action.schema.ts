import {Schema, model} from "mongoose";
import {IAction} from "../interfaces/common";

const Action = new Schema<IAction>({
        actionType: {
            type: String,
            required: true
        },
        person: {
            type: Schema.Types.ObjectId,
            ref: 'user',
            required: true
        },
        actionWith: {
            type: Schema.Types.ObjectId,
            ref: String
        }
    }, {
        timestamps: true
    }
)

const ActionSchema = model("action", Action);

export {
    ActionSchema
}