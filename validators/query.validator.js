const Joi = require('joi');

const { emailValidator, nameValidator} = require("./common.validator");

module.exports = {
    findAll: Joi.object({
        name: nameValidator,
        email: emailValidator,
    }),
};