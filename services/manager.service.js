const { Manager} = require("../dataBase");
module.exports = {
    findManagers: (params = {}) => {
        return Manager.find(params);
    },
    findOneManager: (params) => {
        return Manager.findOne(params)
    }
}