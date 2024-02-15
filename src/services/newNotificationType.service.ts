import {INotification, TTypeNotification} from "../interfaces/common";
import {CaplService, EstablishmentService, NewsService, UserService, MessageService} from "./index";

const caplService = new CaplService();
const userService = new UserService();
const establishmentService = new EstablishmentService();
const newsService = new NewsService();
const messageService = new MessageService();
export const newNotificationType = {
    getInfoNotificationType: async ({type, id}: {type: INotification['type'], id: string}): Promise<TTypeNotification> => {
        const notificationType = {
            newReservation: await caplService.findOneReserve({_id: id}),
            newNews: await newsService.getOneNews({_id: id}),
            newEstablishment: await establishmentService.getOneEstablishment({_id: id}),
            newUser: await userService.findOneUser({_id: id}),
            newMessage: await messageService.findOne({_id: id}),
        }
        return notificationType[type];
    }
}
