import Joi from "joi";

import {emailValidator, passwordValidator} from "./common.validator";


const login = Joi.object({
    email: emailValidator.required(),
    password: passwordValidator.required(),
});
const forgotPassword = Joi.object({
    email: emailValidator.required(),
});

export {
    login,
    forgotPassword,
};