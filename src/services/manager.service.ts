import { Manager} from "../dataBase";

class ManagerService {
    findManagers(params = {}) {
        return Manager.find(params);
    }
    findOneManager(params: any) {
        return Manager.findOne(params)
    }
}

export {
    ManagerService
}