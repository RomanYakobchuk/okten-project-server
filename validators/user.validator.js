const Joi = require('joi');

const { emailValidator, passwordValidator, dOBValidator, nameValidator, phoneValidator} = require("./common.validator");

module.exports = {
    newUserValidator: Joi.object({
        name: nameValidator.required(),
        email: emailValidator.required(),
        password: passwordValidator.required(),
        phone: phoneValidator.required(),
        dOB: dOBValidator.required()
    }),

    updateUserValidator: Joi.object({
        name: nameValidator,
    }),
};