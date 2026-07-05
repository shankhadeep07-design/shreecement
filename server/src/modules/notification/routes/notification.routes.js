const express = require("express");


// const { appAuthMiddleware } = require("../../../middlewares/appAuthMiddleware");
const {  
    approvalTrackFun,
    notificationCount,
    pendingNotificationDetailsFun,
    get_notification_module_wise,
    get_all_notification_lists, 
    submitNotification ,
    sendForApprovalEventsNotificationFun,
    sendForApprovalNgoNotificationFun,
    pendingFromUsersEventsNotificationFun,
    submitBudgetNotification,
    submitProjectNotification,
    submitProjectClosureNotification,
} = require("../controllers/notification.controller");
const multer = require("multer");
// const { appAuthMiddleware } = require("../../../middlewares/appAuthMiddleware");
const upload = multer();
const router = express.Router();


router.post("/approval-track", approvalTrackFun);
router.get("/notification-count", notificationCount);
router.post("/pending-notification-details", pendingNotificationDetailsFun);
router.get("/get-notification-module-wise", get_notification_module_wise);
router.get("/notification-lists", get_all_notification_lists);
router.post("/submit-notification", submitNotification);
router.post("/send-for-approval-events-notification", sendForApprovalEventsNotificationFun);
router.post("/send-for-approval-ngo-notification", sendForApprovalNgoNotificationFun);
router.post("/pending-from-users-events-notification", pendingFromUsersEventsNotificationFun);
// router.post("/notification-lists-by-type", get_all_notification_lists_by_type);
// router.post("/update/notification-by-type", update_notifications_by_type);
router.post('/submit-budget-notification', submitBudgetNotification);
router.post('/submit-project-notification', submitProjectNotification);
router.post('/submit-project-closure-notification', submitProjectClosureNotification);
module.exports = router;
