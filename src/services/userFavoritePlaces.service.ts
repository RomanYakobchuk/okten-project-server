import {UserFavPlaces} from "../dataBase";

class UserFavoritePlacesService {
    findOne(params: any) {
        return UserFavPlaces.findOne(params)
    }
    create(params: {userId: string}) {
        return UserFavPlaces.create({userId: params.userId, places: []});
    }
    deleteOne(params: {userId: string}) {
        return UserFavPlaces.deleteOne(params);
    }
}

export {
    UserFavoritePlacesService
}