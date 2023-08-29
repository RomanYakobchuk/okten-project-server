
import {emailService} from  './email.service';
// import s3Service from  './s3.service';
import {CloudService} from  './cloud.service';
import {SmsService} from  './sms.service';
import {UserService} from  './user.service';
import {TokenService} from  './token.service';
import {ManagerService} from  './manager.service';
import {PasswordService} from  './password.service';
import {InstitutionService} from  './institution.service';
import {NewsService} from  './news.service';
import {ReviewService} from  './review.service';
import {CommentService} from  './comment.service';
import {MessageService} from  './message.service';
import {ConversationService} from  './conversation.service';
import {CaplService} from './capl.service';
import {UserFavoritePlacesService} from './userFavoritePlaces.service';
import * as scheduler from './other/scheduler';
import * as reserve from './other/isActiveReserve';

import {SubscribeNotificationService} from "./subscribeNotification.service"

export {
    emailService,
    // s3Service,
    CloudService,
    SmsService,
    MessageService,
    CommentService,
    ReviewService,
    NewsService,
    InstitutionService,
    PasswordService,
    ManagerService,
    UserService,
    ConversationService,
    CaplService,
    TokenService,
    UserFavoritePlacesService,
    SubscribeNotificationService,
    scheduler,
    reserve
}