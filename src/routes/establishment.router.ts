import {Router} from "express";
import {
    authMiddleware,
    establishmentMiddleware,
    fileMiddleware,
    userMiddleware,
    subscribeNotificationMiddleware, commonMiddleware
} from "../middlewares";
import {establishmentController, viewsController} from "../controllers";
import {establishmentValidator} from "../validators";


const router = Router();
// all published Establishment
router.get(
    `/all`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus("check"),
    establishmentController.allEstablishmentByVerify
);

// create Establishment
router.post(
    `/create`,
    authMiddleware.checkAccessToken,
    commonMiddleware.parseJsonStrings,
    commonMiddleware.isDateValid(establishmentValidator.createEstablishment, 'body'),
    authMiddleware.checkStatus('check'),
    establishmentController.createEstablishment
)

// all Establishment info with field
router.get(
    `/infoById/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('all_info'),
    establishmentMiddleware.getAllInfoById,
    subscribeNotificationMiddleware.checkSubscribe,
    viewsController.addViewForEstablishment
)

// establishment info
// router.get(
//     `/infoById/:id`,
//     authMiddleware.checkAccessToken,
//     establishmentMiddleware.checkEstablishment('info'),
//     establishmentController.getById
// )

// update establishment info
router.patch(
    `/infoById/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    commonMiddleware.parseJsonStrings,
    commonMiddleware.isDateValid(establishmentValidator.updateEstablishment, 'body'),
    fileMiddleware.checkImagesForUpdated('establishment'),
    establishmentController.updateEstablishmentById
)

// user`s establishment
router.get(
    `/userEstablishments`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    establishmentController.userEstablishmentsByQuery
)

// count cities
router.get(
    `/countByCity`,
    authMiddleware.checkAccessToken,
    establishmentController.countByCity
)

// count Establishments type
router.get(
    `/countByType`,
    authMiddleware.checkAccessToken,
    establishmentController.countByType
)

// count establishment with more views
router.get(
    `/countMoreViews`,
    authMiddleware.checkAccessToken,
    establishmentController.countMoreViews
)

// unique places
router.get(
    `/uniquePlaces`,
    authMiddleware.checkAccessToken,
    establishmentController.uniquePlaces
)


// delete establishment
router.delete(
    `/deleteOne/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    establishmentMiddleware.checkEstablishment('info'),
    establishmentController.deleteEstablishments
)

router.patch(
    `/updateStatus/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    establishmentMiddleware.checkEstablishment('info'),
    establishmentController.updateStatus
)

router.get(
    `/updateStatus/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    establishmentMiddleware.checkEstablishment('info'),
    establishmentController.getStatus
)

router.get(
    `/allByUserId/:id`,
    authMiddleware.checkAccessToken,
    authMiddleware.checkStatus('check'),
    userMiddleware.isUserPresent('userId'),
    establishmentController.allByUserId
)

router.get(
    `/similar/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    establishmentController.similarEstablishment
)

router.get(
    `/nearby`,
    authMiddleware.checkAccessToken,
    establishmentController.establishmentNearby
)

router.get(
    `/getNumberOfEstablishmentProperties/:id`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkEstablishment('info'),
    establishmentController.getNumberOfEstablishmentProperties
)

router.get(
    `/getAverageCheck`,
    authMiddleware.checkAccessToken,
    establishmentMiddleware.checkAverageCheckMinMax,
    establishmentController.getAverageCheckMinMax
)
export default router;