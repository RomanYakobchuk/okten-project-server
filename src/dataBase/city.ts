import {Schema, model} from "mongoose";
import {ICity} from "../interfaces/common";


const CitySchema = new Schema<ICity>(
    {
        name: String
    }, {
        timestamps: true
    });

const City = model('city', CitySchema);

export {
    City
}