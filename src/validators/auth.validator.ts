import Joi from "joi";

import {emailValidator, passwordValidator, stringValidator} from "./common.validator";


const login = Joi.object({
    email: emailValidator,
    password: passwordValidator,
    registerBy: stringValidator
});
const googleLogin = Joi.object({
    access_token: stringValidator,
    registerBy: stringValidator
})
const facebookLogin = Joi.object({
    access_token: stringValidator,
    registerBy: stringValidator,
    userId: stringValidator,
    // email: emailValidator,
    // name: stringValidator,
    // avatar: stringValidator
})
const githubLogin = Joi.object({
    // access_token: stringValidator,
    // registerBy: stringValidator,
    // userId: stringValidator,
    // email: emailValidator,
    // name: stringValidator,
    // avatar: stringValidator
})
const forgotPassword = Joi.object({
    email: emailValidator.required(),
});

export {
    login,
    forgotPassword,
    googleLogin,
    facebookLogin,
    githubLogin
};