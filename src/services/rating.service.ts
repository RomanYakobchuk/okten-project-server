import {Rating} from "../dataBase";

class RatingService {
    findOneRating(params = {}) {
        return Rating.findOne(params);
    }
    createRating(rating: {createdBy: string, grade: number, institutionId: string}) {
        return Rating.create(rating);
    }
    findAllByInstitutionId(institutionId: string) {
        return Rating.find({institutionId})
    }
}

export {
    RatingService
}