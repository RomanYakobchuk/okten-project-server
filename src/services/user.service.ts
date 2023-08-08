import {User} from '../dataBase';
import {CustomError} from "../errors";
import {IUser} from "../interfaces/common";

class UserService {

    async getUsersByQuery(_end: number, _order: any, _start: number, _sort: any, search_like: string, status: string, isActivated: boolean, phoneVerify: boolean, isBlocked: boolean) {

        const filterQuery = _getFilterQuery({search_like, status, isActivated, phoneVerify, isBlocked});

        const count = await User.countDocuments({...filterQuery});

        if (!_sort || !_order) {
            _sort = "createdAt"
            _order = -1
        }
        if (!_start) {
            _start = 0
        }
        if (!_end) {
            _end = 10
        }

        const newSort = _sort?.split('_')[0];

        const items = await User
            .find(filterQuery)
            .select('_id name email phone dOB isActivated phoneVerify blocked status')
            .limit(_end - _start)
            .skip(_start)
            .sort({[newSort]: _order})
            .exec();

        return {
            count,
            items
        }
    }
    findOneUser(params = {}) {

        return User.findOne(params);
    }
    createUser(user: any){
        return User.create(user);
    }

    updateOneUser(params: any, userData: any, options = {new: true}) {
        return User.findOneAndUpdate(params, userData, options);

    }
    deleteOneUser(params: any) {
        return User.deleteOne(params);
    }
};

//Перевірка на введені пошукові поля

function _getFilterQuery(otherFilter: any) {

    const searchObject = {};
    const filters: any[] = [];

    if (otherFilter.search_like) {
        filters.push({
            $or: [
                {name: {$regex: otherFilter.search_like, $options: 'i'}},
                {phone: {$regex: otherFilter.search_like, $options: "i"}},
                {email: {$regex: otherFilter.search_like, $options: 'i'}}
            ]
        })
    }
    if (otherFilter.isActivated === 'true' || otherFilter.isActivated === 'false') {
        filters.push({
            isActivated: otherFilter.isActivated === 'true'
        })
    }
    if (otherFilter.phoneVerify === 'true' || otherFilter.phoneVerify === 'false') {
        filters.push({
            phoneVerify: otherFilter.phoneVerify === 'true'
        })
    }
    if (otherFilter.status) {
        filters.push({
            status: {$regex: otherFilter.status, $options: 'i'}
        })
    }
    if (otherFilter.isBlocked === true || otherFilter.isBlocked === false) {
        filters.push({
            "blocked.isActivated": otherFilter.isBlocked
        })
    }

    if (filters.length > 0) {
        Object.assign(searchObject, {$and: filters})
    }
    return searchObject;
}

export {
    UserService
}