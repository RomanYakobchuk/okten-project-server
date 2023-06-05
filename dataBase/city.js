const {Schema, model} = require("mongoose");

const CitySchema = new Schema({
    name: String
}, {
    timestamps: true
});

module.exports = model('city', CitySchema);