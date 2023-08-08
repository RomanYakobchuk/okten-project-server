import {Schema, model} from "mongoose";
import {IAction} from "../interfaces/common";

const ActionSchema = new Schema<IAction>({
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

const Action = model("action", ActionSchema);

export {
    Action
}