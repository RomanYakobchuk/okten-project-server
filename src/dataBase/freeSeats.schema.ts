import {model, Schema} from "mongoose";
import {IFreeSeats} from "../interfaces/common";
import {IFreeSeatsModel} from "../interfaces/model";

const FreeSeats = new Schema({
    establishmentId: {
        type: Schema.Types.ObjectId,
        ref: 'establishment',
        unique: true
    },
    list: [
        {
            table: {
                type: Number
            },
            numberOfSeats: {
                type: Number
            },
            status: {
                type: String, //free, reserved
            },
            description: {
                type: String,
                default: ''
            }
        }
    ]
}, {timestamps: true});

const FreeSeatsSchema: IFreeSeatsModel = model<IFreeSeats, IFreeSeatsModel>('freeSeats', FreeSeats);

export {
    FreeSeatsSchema
}