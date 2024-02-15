import Joi from "joi";
import {
    booleanValidator,
    categoryValidator,
    dateEventValidator, dateValidator, locationValidator, picturesValidator, placeValidator,
    statusValidator,
    stringValidator
} from "./common.validator";

const createNews = Joi.object({
    title: stringValidator,
    description: stringValidator,
    createdBy: stringValidator,
    category: categoryValidator,
    status: statusValidator,
    isDatePublished: booleanValidator,
    dateEvent: dateEventValidator,
    datePublished: dateValidator,
    place: Joi.object({
        location: locationValidator,
        place: placeValidator,
        isPlace: booleanValidator
    }),
    establishmentId: stringValidator
})
const updateNews = Joi.object({
    title: stringValidator,
    description: stringValidator,
    createdBy: stringValidator,
    category: categoryValidator,
    status: statusValidator,
    isDatePublished: booleanValidator,
    dateEvent: dateEventValidator,
    datePublished: dateValidator,
    place: Joi.object({
        location: locationValidator,
        place: placeValidator,
        isPlace: booleanValidator
    }),
    pictures: picturesValidator,
    establishmentId: stringValidator
})
export {
    createNews,
    updateNews
}