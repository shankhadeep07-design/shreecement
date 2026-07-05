const express = require('express');
const router = express.Router();
const { login ,
    appLogOut ,
    forgot_password, 
    fetchDashboardApi,
    fetchDashboardDetails,
    fetchMastersList, 
    verify_otp_with_change_password_fun
} = require('../controllers/app.controller');

const multer = require('multer');
const { event_accept_reject_fun, 
    my_event_list, 
    comming_soon_events_list, 
    get_all_notification_lists, 
    final_event_accept_reject_fun, 
    event_review_form_submit_fun ,
    event_review_form_list_fun
} = require('../controllers/app_event.controller');
const { appAuthMiddleware } = require('../../../middlewares/appAuthMiddleware');
const { validateBody } = require('../../../middlewares/validate');
const { eventReviewSchema } = require('../validations/eventReview.validation');
const { project_lists_fun,project_kpi_targets_fun, beneficiary_lists_fun, create_beneficiary_fun,project_location_assign_fun } = require('../controllers/app.project.controller');
const { apiRateLimiter } = require('../../../middlewares/rateLimit');

const upload = multer();
router.post('/login', login);
router.post('/logout', appLogOut);
router.post('/forgot_password',apiRateLimiter, forgot_password);
router.post('/verify_otp_with_change_password', verify_otp_with_change_password_fun);



router.post("/dashboard_api",appAuthMiddleware, fetchDashboardApi);
router.post("/masters",appAuthMiddleware, fetchMastersList);
// router.post("/event/dashboard_details",appAuthMiddleware, fetchDashboardDetails);


router.post('/event/event_accept_reject',appAuthMiddleware, event_accept_reject_fun);
router.post("/event/my-event/list",appAuthMiddleware, my_event_list);
router.post("/event/comming_soon_events/list",appAuthMiddleware, comming_soon_events_list);
router.get("/event/notification-lists",appAuthMiddleware, get_all_notification_lists);
router.post('/event/final_event_accept_reject',appAuthMiddleware, final_event_accept_reject_fun);
router.post("/event/event_review_form_submit",appAuthMiddleware, upload.any(), validateBody(eventReviewSchema), event_review_form_submit_fun);
router.post("/event/event_review_form_list",appAuthMiddleware, event_review_form_list_fun);



router.post("/project/my_project_lists",appAuthMiddleware, project_lists_fun);
router.post("/project/project_kpi_targets",appAuthMiddleware, project_kpi_targets_fun);
router.post("/project/beneficiary_lists",appAuthMiddleware, beneficiary_lists_fun);
router.post("/project/create_beneficiary", upload.any(),appAuthMiddleware, create_beneficiary_fun);
router.post("/project/project_location_assign", upload.any(),appAuthMiddleware, project_location_assign_fun);


module.exports = router;
