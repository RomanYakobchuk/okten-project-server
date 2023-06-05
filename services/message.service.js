const {Message} = require("../dataBase");
module.exports = {
    create: (params) => {
        return Message.MessageSchema.create(params)
    },
    findAll: (params) => {
        return Message.MessageSchema.find(params)
    },
    findOne: (params) => {
        return Message.MessageSchema.findOne(params)
    }
}