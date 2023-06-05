const {City} = require("../dataBase");
module.exports = {
    allCities: async (req, res, next) => {
        try {
            const {city_like = ""} = req.query;

            const query = {};

            if (city_like !== "") {
                query.name = city_like
            }

            const searchObject = {};
            Object.assign(searchObject, {
                $or: [
                    {name: {$regex: city_like, $options: 'i'}}
                ]
            })

            const cities = await City
                .find(searchObject)
                .limit(50)
                .sort({['name']: 'asc'})
                .exec();

            res.status(200).json(cities ?? [])

        } catch (e) {
            next(e)
        }
    }
}