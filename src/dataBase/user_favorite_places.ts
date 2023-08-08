import {model, Schema} from "mongoose";
import {IUserFavoritePlaces} from "../interfaces/common";
import {IUserFavoritePlacesModel} from "../interfaces/model";



const UserFavoritePlaces = new Schema<IUserFavoritePlaces>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    places: [{
        type: Schema.Types.ObjectId,
        ref: 'institution'
    }]
}, {
    timestamps: true,
});
const UserFavPlaces: IUserFavoritePlacesModel = model<IUserFavoritePlaces, IUserFavoritePlacesModel>("userFavoritePlaces", UserFavoritePlaces);

export {
    UserFavPlaces
}