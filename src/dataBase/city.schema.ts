import {Schema, model} from "mongoose";
import {ICity} from "../interfaces/common";


const City = new Schema<ICity>(
    {
        name: String
    }, {
        timestamps: true
    });

const CitySchema = model('city', City);

export {
    CitySchema
}