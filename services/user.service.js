const { User } = require('../dataBase');
const {CustomError} = require("../errors");

module.exports = {
    findUsers: (params = {}) => {
        return User.find(params);
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
    getUsersWithPagination: async (model, forPresenter, query = {}, id) => {
        const {page = 1, perPage = 20, ...otherFilter} = query;

        const filterPage = _pageFilter(page, perPage)
        // console.log(filterPage)

        const filterQuery = _getUsersFilterQuery(otherFilter);
        // console.log(filterQuery)

        const skip = (filterPage.page - 1) * filterPage.perPage;
        // console.log(`skip: `, skip)

        // console.log(filterQuery)

        if (id) {
            const users = await model.find({userId: id}, filterQuery).limit(filterPage.perPage).skip(skip).exec();
            const usersForResponse = users.map(u => forPresenter(u))
            const usersCount = await model.countDocuments(filterQuery);
            if (usersCount - skip < 1 || usersCount === 0) {
                return {
                    page,
                    perPage,
                    count: usersCount,
                    data: null
                }
            }

            return {
                page,
                perPage,
                count: usersForResponse.length,
                data: usersForResponse
            }
        }

        // {
        // console.log(`${id}`)
        // console.log(`${u.userId}`)
        // `${u.userId}` === `${id}` ? forPresenter(u) : null
        // }
        // if(id){
        //     id === u._id && forPresenter(u)
        // }
        // else {
        //     forPresenter(u)
        // }
        const users = await model.find(filterQuery).limit(filterPage.perPage).skip(skip).exec();
        const usersForResponse = users.map(u => forPresenter(u))
        const usersCount = await model.countDocuments(filterQuery);
        if (usersCount - skip < 1 || usersCount === 0) {
            return {
                page,
                perPage,
                count: usersCount,
                data: null
            }
        }

        return {
            page,
            perPage,
            count: usersForResponse.length,
            data: usersForResponse
        }
    }
};

//Перевірка на введені пошукові поля

function _getUsersFilterQuery(otherFilter) {

    const searchObject = {}

    if (otherFilter.search) {
        Object.assign(searchObject, {
            $or: [
                {name: {$regex: otherFilter.search, $options: 'i'}},
                {username: {$regex: otherFilter.search, $options: 'i'}},
                {desc: {$regex: otherFilter.search, $options: "i"}}
                // {email: {$regex: otherFilter.search, $options: 'i'}}
            ]
        })
    }

    if (otherFilter.ageGte) {
        if (/^[a-zA-Z]+$/.test(otherFilter.ageGte)) {
            throw new CustomError('ageGte should be a number, and be greater than 0', 404);
        }
        Object.assign(searchObject, {
            age: {$gte: +otherFilter.ageGte}
        })
    }

    if (otherFilter.ageLte) {
        if (/^[a-zA-Z]+$/.test(otherFilter.ageLte) || otherFilter.ageLte <= 0) {
            throw new CustomError('ageLte should be a number, and be greater than 0', 404);
        }
        Object.assign(searchObject, {
            age: {
                ...searchObject.age || {},
                $lte: +otherFilter.ageLte
            }
        })
    }

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