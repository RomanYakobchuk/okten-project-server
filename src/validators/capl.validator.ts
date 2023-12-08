import Joi from "joi";
import {
    nameValidator,
    stringValidator,
    descriptionValidator,
    dateValidator,
    booleanValidator,
    numberValidator
} from "./common.validator";

const createReserve = Joi.object({
    fullName: nameValidator.required(),
    institutionId: stringValidator.required(),
    eventType: stringValidator,
    comment: stringValidator.allow(""),
    date: dateValidator.required(),
    writeMe: booleanValidator.required(),
    desiredAmount: numberValidator.required(),
    numberPeople: numberValidator.required(),
    whoPay: stringValidator.required(),
    userStatus: {
        value: stringValidator.required(),
        reasonRefusal: stringValidator.allow(""),
    },
    institutionStatus: {
        value: stringValidator.required(),
        freeDateFor: Joi.array().items(Joi.date().allow(null)),
        reasonRefusal: stringValidator.allow("")
    },
    isAllowedEdit: booleanValidator,
    userId: stringValidator.required(),
    managerId: stringValidator.required()
});

export {
    createReserve
}