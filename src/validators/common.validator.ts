import Joi from "joi";

import { constants } from "../configs";

const nameValidator = Joi.string().min(2).max(100);
const emailValidator = Joi.string().regex(constants.EMAIL_REGEX).lowercase().trim();
const passwordValidator = Joi.string().regex(constants.PASSWORD_REGEX).required().trim();
const phoneValidator = Joi.string().regex(constants.PHONE_REGEX).required().trim();
const dOBValidator = Joi.date();
const dateValidator = Joi.date();
const descriptionValidator = Joi.string();
const stringValidator = Joi.string();
const numberValidator = Joi.number();
const booleanValidator = Joi.boolean();

export {
    nameValidator,
    emailValidator,
    passwordValidator,
    phoneValidator,
    dOBValidator,
    dateValidator,
    stringValidator,
    descriptionValidator,
    numberValidator,
    booleanValidator
}