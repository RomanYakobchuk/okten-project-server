import {model, Schema} from "mongoose";
import {IUserFavoritePlaces} from "../interfaces/common";
import {IUserFavoritePlacesModel} from "../interfaces/model";



const UserFavoritePlaces = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        unique: true
    },
    places: [{
        type: {
            type: String,
            enum: ['institution', 'institutionNews']
        },
        item: {
            type: Schema.Types.ObjectId,
            refPath: 'places.type'
        }
    }]
}, {
    timestamps: true,
});
const UserFavPlaces: IUserFavoritePlacesModel = model<IUserFavoritePlaces, IUserFavoritePlacesModel>("userFavoritePlaces", UserFavoritePlaces);

export {
    UserFavPlaces
}