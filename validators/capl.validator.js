const Joi = require('joi');
const {nameValidator, stringValidator, descriptionValidator, dateValidator, booleanValidator, numberValidator} = require("./common.validator");


module.exports = {
    createReserve: Joi.object({
        fullName: nameValidator.required(),
        institutionId: stringValidator.required(),
        eventType: stringValidator,
        comment: stringValidator.allow(""),
        date: dateValidator.required(),
        writeMe: booleanValidator.required(),
        desiredAmount: numberValidator.required(),
        numberPeople: numberValidator.required(),
        whoPay: stringValidator.required()
    })
}