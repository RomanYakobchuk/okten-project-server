const Joi = require("joi");

const { constants } = require("../configs");

module.exports = {
    nameValidator: Joi.string().min(2).max(100),
    emailValidator: Joi.string().regex(constants.EMAIL_REGEX).lowercase().trim(),
    passwordValidator: Joi.string().regex(constants.PASSWORD_REGEX).required().trim(),
    phoneValidator: Joi.string().regex(constants.PHONE_REGEX).required().trim(),
    dOBValidator: Joi.date(),
    dateValidator: Joi.date(),
    descriptionValidator: Joi.string(),
    stringValidator: Joi.string(),
    numberValidator: Joi.number(),
    booleanValidator: Joi.boolean()
};