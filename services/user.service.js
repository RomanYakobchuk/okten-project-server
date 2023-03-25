const { User } = require('../dataBase');
const {CustomError} = require("../errors");

module.exports = {
    findUsers: (params = {}) => {
        return User.find(params);
    },

    getUsersByQuery: async (model, query = {}, search_like) => {

        const filterQuery = _getFilterQuery({search_like});

        const count = await model.countDocuments({...filterQuery});

        const items = await model
            .find(filterQuery)
            .limit(20)
            .sort({["createdAt"]: -1})
            .exec();

        return {
            count,
            items
        }
    },

    findOneUser: (params = {}) => {

        return User.findOne(params);
    },

    createUser: (user) => {
        return User.create(user);
    },

    updateOneUser: (params, userData, options = { new: true }) => {
        return User.findOneAndUpdate(params, userData, options);

    },

    deleteOneUser: (params) => {
        return User.deleteOne(params);
    },
};

//Перевірка на введені пошукові поля

function _getFilterQuery(otherFilter) {

    const searchObject = {}

    if (otherFilter.search) {
        Object.assign(searchObject, {
            $or: [
                {name: {$regex: otherFilter.search, $options: 'i'}},
                {_id: {$regex: otherFilter.search, $options: 'i'}},
                {phone: {$regex: otherFilter.search, $options: "i"}},
                {email: {$regex: otherFilter.search, $options: 'i'}}
            ]
        })
    }

    // if (otherFilter.ageGte) {
    //     if (/^[a-zA-Z]+$/.test(otherFilter.ageGte)) {
    //         throw new CustomError('ageGte should be a number, and be greater than 0', 404);
    //     }
    //     Object.assign(searchObject, {
    //         age: {$gte: +otherFilter.ageGte}
    //     })
    // }
    //
    // if (otherFilter.ageLte) {
    //     if (/^[a-zA-Z]+$/.test(otherFilter.ageLte) || otherFilter.ageLte <= 0) {
    //         throw new CustomError('ageLte should be a number, and be greater than 0', 404);
    //     }
    //     Object.assign(searchObject, {
    //         age: {
    //             ...searchObject.age || {},
    //             $lte: +otherFilter.ageLte
    //         }
    //     })
    // }

    // console.log(JSON.stringify(searchObject, null, 2))

    return searchObject;
}

//Перевірка на вірність введення номеру сторінки і кількості елементів на сторінці

function _pageFilter(page, perPage) {
    if (page <= 0) {
        throw new CustomError('Page not found, page must be greater than 0', 404);
    }

    if (/^[a-zA-Z]+$/.test(page)) {
        throw new CustomError('Page should be a number', 404);
    }
    if (perPage <= 0) {
        throw new CustomError('PerPage must be greater than 0', 404);
    }

    if (/^[a-zA-Z]+$/.test(perPage)) {
        throw new CustomError('PerPage should be a number', 404);
    }

    return {
        page,
        perPage
    }
};