import Joi from "joi";

import {
    emailValidator,
    passwordValidator,
    dOBValidator,
    nameValidator,
    phoneValidator,
    stringValidator
} from "./common.validator";


const newUserValidator = Joi.object({
    name: nameValidator.required(),
    email: emailValidator.required(),
    password: passwordValidator.required(),
    phone: phoneValidator.required(),
    status: stringValidator.required(),
    dOB: dOBValidator.required(),
});

const updateUserValidator = Joi.object({
    name: nameValidator,
});

export {
    newUserValidator,
    updateUserValidator
};