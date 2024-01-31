import {ReactionsSchema} from "../dataBase/reaction.schema";

class ReactionService {
    getOne(params = {}) {
        return ReactionsSchema.findOne(params);
    }
    createOne(params = {}) {
        return ReactionsSchema.create(params)
    }
}

export {
    ReactionService
}