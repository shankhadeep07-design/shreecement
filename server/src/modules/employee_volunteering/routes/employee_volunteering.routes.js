const express = require('express');

const { evDatatable,employee_volunteer_listDatatable, 
    createEmpVolunteering ,
    create_update_user_fun

} = require('../controllers/employee_volunteering.controller');

const router = express.Router();
const multer = require("multer");
const upload = multer();


// Schedule Seven Routes Start

router.post('/ev_datatable', evDatatable);
router.post('/employee_volunteer_list_datatable', employee_volunteer_listDatatable);
router.post('/create',upload.any(), createEmpVolunteering)

router.post('/create_update_user',upload.any(), create_update_user_fun)
router.post('/update/:id',upload.any(), createEmpVolunteering)
// router.get('/all-list', getAllSdgMasterList)
// router.get('/excel-export-datatable', getExcelExportSdgMasterList)

// Schedule Seven Routes End


module.exports = router;
