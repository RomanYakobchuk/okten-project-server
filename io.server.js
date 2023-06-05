global.onlineUsers = new Map();
global.onlineInstitution = new Map();

let users = [];
let institutions = new Map();

const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) &&
    users.push({userId, socketId});
};

const addInstitution = (institutionId = '', socketId) => {
    const institutionSockets = institutions.get(institutionId) || [];
    institutionSockets.push(socketId);
    institutions.set(institutionId, institutionSockets);
};

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
};


const getUser = (userId) => {
    return users.find(user => user.userId === userId)
}

module.exports = {
    addInstitution,
    addUser,
    getUser,
    removeUser,
    institutions,
    users
}