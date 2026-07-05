const express = require("express");


const {  createEventForm, updateEventForm, event_list_datatable, eventDetails ,
    publish_event_fun, 
    my_event_datatable,
    join_new_volunteer_in_event_fun,
    event_accept_reject_fun,
    event_review_form_list_fun,
    event_review_form_submit_fun,
    comming_soon_events_datatable,
    copy_event_fun,
    excel_upload_user_event_notification_send_fun,
    event_review_form_excel_upload_fun,
    event_review_form_approve_fun,
    event_certificate_send_fun,
    exportEventExcel,


} = require("../controllers/event.controller");
const multer = require("multer");
const { event_list_datatableNotCsr, createEventFormNotCsr, updateEventFormNotCsr, eventDetailsNotCsr, exportNotCsrEventExcel } = require("../controllers/event_not_csr.controller");
const upload = multer();
const router = express.Router();

// Event CSR Routes Start
router.post("/event-list/datatable", event_list_datatable);
router.post("/create", upload.any(), createEventForm);
router.post("/update/:id", upload.any(), updateEventForm);
router.post("/details/:id", eventDetails);
router.get("/event-list/excel-export", exportEventExcel);

router.post("/publish_event", publish_event_fun);
router.post("/my-event/datatable", my_event_datatable);
router.post("/comming_soon_events/datatable", comming_soon_events_datatable);

router.post("/join_new_volunteer_in_event", join_new_volunteer_in_event_fun);
router.post("/copy_event", copy_event_fun);
router.post("/event_accept_reject", event_accept_reject_fun);
router.post("/event_review_form_list", event_review_form_list_fun);
router.post("/event_review_form_submit", upload.any(), event_review_form_submit_fun);
router.post("/excel_upload_user_event_notification_send", excel_upload_user_event_notification_send_fun);
router.post("/event_review_form_excel_upload", event_review_form_excel_upload_fun);
router.post("/event_review_form_approve", event_review_form_approve_fun);
router.post("/event_certificate_send", event_certificate_send_fun);

// Event Not CSR Routes Start
router.post("/not_csr/event-list/datatable", event_list_datatableNotCsr);
router.post("/not_csr/create", upload.any(), createEventFormNotCsr);
router.post("/not_csr/update/:id", upload.any(), updateEventFormNotCsr);
router.post("/not_csr/details/:id", eventDetailsNotCsr);
router.get("/not_csr/event-list/excel-export", exportNotCsrEventExcel);








module.exports = router;
