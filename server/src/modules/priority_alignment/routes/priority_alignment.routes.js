const express = require('express');

const router = express.Router();
const multer = require("multer");
const upload = multer();

const { scheduleSevenMasterDatatable, createScheduleSevenMaster, getExcelExportScheduleSevenMasterList, getAllScheduleSevenMasterList, getScheduleSevenByTheme, getSubScheduleBySchedule } = require('../controllers/schedule_seven.controller');
const { focusAreaMasterDatatable,getFocusAreaMasterList, createFocusAreaMaster, updateFocusAreaMaster, getExcelExportFocusAreaMasterList, getFocusAreasByScheduleSeven } = require('../controllers/focus_area.controller');
const { sdg_master_datatable, sdgsMasterDatatable, createSdgMaster, getAllSdgMasterList, getExcelExportSdgMasterList } = require('../controllers/sdg.controller');
const { activityMasterDatatable, createActivityMaster, updateActivityMaster, getExcelExportActivityMasterList, getActivityByFocusArea } = require('../controllers/activity.controller');
const { subActivityMasterDatatable, createSubActivityMaster, updateSubActivityMaster, getExcelExportSubActivityMasterList, getSubActivityByActivity, getAllSubActivityMasterList } = require('../controllers/sub_activity.controller');

const { getAllSubScheduleMasterList, SubScheduleMasterDatatable, createSubScheduleMaster, getExcelExportSubScheduleMasterList } = require('../controllers/sub_schedule_seven.controller');

const {createNationalIndicatorMaster,nationalIndicatorMasterDatatable,getExcelExportNationalIndicatorMasterList, getNationalIndicatorBySdg } = require('../controllers/national_indicator.controller');
const { getAllThemeMasterList } = require('../controllers/theme.controller');

// Schedule Seven Routes Start

router.post('/schedule-seven-master-list/datatable', scheduleSevenMasterDatatable);
router.post('/schedule-seven-master-list/create', createScheduleSevenMaster)
router.post('/schedule-seven-master-list/update/:id', createScheduleSevenMaster)
router.get('/schedule-seven-master-list/all-list', getAllScheduleSevenMasterList)
router.get('/schedule-seven-master-list/excel-export-datatable', getExcelExportScheduleSevenMasterList)
router.get("/schedule-seven/:theme_id", getScheduleSevenByTheme);
// Sub Schedule Seven Routes End

router.post('/sub-schedule-seven-master-list/datatable', SubScheduleMasterDatatable);
router.post('/sub-schedule-seven-master-list/create', createSubScheduleMaster)
router.post('/sub-schedule-seven-master-list/update/:id', createSubScheduleMaster)
router.post('/sub-schedule-seven-master-list/all-list', getAllSubScheduleMasterList)
router.get('/sub-schedule-seven-master-list/excel-export-datatable', getExcelExportSubScheduleMasterList)
router.get(
  "/sub-schedule-by-schedule/:schedule_id",
  getSubScheduleBySchedule
);


//Focus Area Routes Start
router.get('/focus-area-master-list/all-list', getFocusAreaMasterList);
router.post('/focus-area-master-list/datatable', focusAreaMasterDatatable);
router.post('/focus-area-master-list/create', createFocusAreaMaster)
router.post('/focus-area-master-list/update/:tfam_focus_area_id', updateFocusAreaMaster)
router.get('/focus-area-master-list/excel-export-datatable', getExcelExportFocusAreaMasterList)
router.get("/focus-area-master-list/focus_area_by_schedule_seven_id/:tfam_schedule_id", getFocusAreasByScheduleSeven);
//Focus Area Routes End


//Activity Routes Start
router.post('/activity-master-list/datatable', activityMasterDatatable);
router.post('/activity-master-list/create', createActivityMaster)
router.post('/activity-master-list/update/:tactm_activity_id', updateActivityMaster)
router.get('/activity-master-list/excel-export-datatable', getExcelExportActivityMasterList)
router.get("/activity-master-list/activity_by_focus_area_id/:tactm_focus_area_id", getActivityByFocusArea);
//Activity Routes End

//Sub Activity Routes Start
router.post('/sub-activity-master-list/datatable', subActivityMasterDatatable);
router.post('/sub-activity-master-list/create', createSubActivityMaster)
router.post('/sub-activity-master-list/update/:tsactm_sub_activity_id', updateSubActivityMaster)
router.get('/sub-activity-master-list/excel-export-datatable', getExcelExportSubActivityMasterList)
router.get('/sub-activity-master-list/all-list', getAllSubActivityMasterList)
router.get("/sub-activity-master-list/sub_activity_by_activity_id/:tsactm_activity_id", getSubActivityByActivity);
//Sub Activity Routes End

// Schedule Seven Routes Start

router.post('/sdg-master-list/datatable', sdgsMasterDatatable);
router.post('/sdg-master-list/create',upload.any(), createSdgMaster)
router.post('/sdg-master-list/update/:id',upload.any(), createSdgMaster)
router.get('/sdg-master-list/all-list', getAllSdgMasterList)
router.get('/sdg-master-list/excel-export-datatable', getExcelExportSdgMasterList)
router.get("/sdg-master-list/national_indicator_by_sdg/:tnif_sdg_id", getNationalIndicatorBySdg);

// Schedule Seven Routes End

//Theme Master
router.get('/theme-master-list/all-list', getAllThemeMasterList)



// National Indicator Routes Start

router.post('/national-indicator-list/datatable', nationalIndicatorMasterDatatable);
router.post('/national-indicator-list/create',createNationalIndicatorMaster);

// router.post('/national-indicator-list/create',upload.none(),createNationalIndicatorMaster);
// router.put("/national-indicator/:id",upload.none(),createNationalIndicatorMaster);

router.post('/national-indicator-list/update/:id',createNationalIndicatorMaster)
router.get('/national-indicator-list/excel-export-datatable', getExcelExportNationalIndicatorMasterList)

// National Indicator Routes End


module.exports = router;
