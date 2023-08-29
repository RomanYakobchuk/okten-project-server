import { ManagerSchema} from "../dataBase";

class ManagerService {
    findManagers(params = {}) {
        return ManagerSchema.find(params);
    }
    findOneManager(params: any) {
        return ManagerSchema.findOne(params)
    }
}

export {
    ManagerService
}