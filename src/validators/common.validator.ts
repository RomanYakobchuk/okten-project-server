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
const typeValidator = Joi.string<"cafe" | "bar" | "restaurant">();
const statusValidator = Joi.string<"draft" | "rejected" | "published">();
const locationValidator = Joi.object({
    lng: numberValidator,
    lat: numberValidator
});
const placeValidator = Joi.object({
    city: stringValidator,
    address: stringValidator,
});
const arrayObjectValuesValidator = Joi.array().items(Joi.object({
    value: stringValidator,
    _id: stringValidator
}));

const workScheduleValidator = Joi.object({
    workDays: Joi.array().items(Joi.object({
        days: Joi.object({
            from: numberValidator,
            to: numberValidator
        }),
        time: Joi.object({
            from: stringValidator,
            to: stringValidator
        })
    })),
    weekend: stringValidator
});
const picturesValidator = Joi.array().items(Joi.object({
    name: stringValidator,
    url: stringValidator,
    _id: stringValidator
}));

const categoryValidator = Joi.string<"general" | "promotions" | "events">();
const dateEventValidator = Joi.array().items(Joi.object({
    schedule: {
        from: dateValidator,
        to: dateValidator
    },
    time: {
        from: dateValidator,
        to: dateValidator
    }
}));

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
    booleanValidator,
    typeValidator,
    statusValidator,
    locationValidator,
    placeValidator,
    arrayObjectValuesValidator,
    workScheduleValidator,
    picturesValidator,
    categoryValidator,
    dateEventValidator
}