import Joi from "joi";
import {
    arrayObjectValuesValidator, booleanValidator,
    locationValidator,
    numberValidator, picturesValidator,
    placeValidator,
    statusValidator,
    stringValidator,
    typeValidator, workScheduleValidator
} from "./common.validator";

const createEstablishment = Joi.object({
    createdBy: stringValidator,
    verify: statusValidator,
    title: stringValidator,
    description: stringValidator,
    type: typeValidator,
    location: locationValidator,
    place: placeValidator,
    contacts: arrayObjectValuesValidator,
    tags: arrayObjectValuesValidator,
    features: arrayObjectValuesValidator,
    workSchedule: workScheduleValidator,
    averageCheck: numberValidator,
    sendNotifications: booleanValidator
})
const updateEstablishment = Joi.object({
    createdBy: stringValidator,
    verify: statusValidator,
    title: stringValidator,
    description: stringValidator,
    type: typeValidator,
    location: locationValidator,
    place: placeValidator,
    contacts: arrayObjectValuesValidator,
    tags: arrayObjectValuesValidator,
    features: arrayObjectValuesValidator,
    workSchedule: workScheduleValidator,
    averageCheck: numberValidator,
    pictures: picturesValidator,
    sendNotifications: booleanValidator
})


export {
    createEstablishment,
    updateEstablishment
}