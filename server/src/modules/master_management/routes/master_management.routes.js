const express = require('express');
const { factory_master_datatable, getAllFactoryList, createFactoryMaster, getExcelExportFactoryMasterList, updateFactoryMaster, getFactoryByLocation,getFactoryByDistrictId } = require('../controllers/factory.controller');
const { theme_master_datatable } = require('../controllers/theme.controller');
const { masterlist_datatable, fetch_master_list_datatable, createMasterList } = require('../controllers/masterlist.controller');
const { fetch_sub_master_list_datatable, createSubMasterList, subMasterListByMasterSlug } = require('../controllers/sub_master_list.controller');
const { profit_center_master_list_datatable, createProfitCenterMaster, updateProfitCenterMaster, getAllProfitCenterList,getAllProfitCenterListSubDistrictWise } = require('../controllers/profit_center.controller');
// const { activity_master_datatable } = require('../../priority_alignment/controllers/activity.controller');
const router = express.Router();


router.post('/factory-master-list/datatable', factory_master_datatable);
router.get('/factory/all-list', getAllFactoryList)
router.post('/factory/create', createFactoryMaster)
router.post('/factory/update/:tfact_factory_id', updateFactoryMaster)
router.get('/factory/excel-export-datatable', getExcelExportFactoryMasterList)
router.get("/factory/factory_by_location_id/:tfact_location_id", getFactoryByLocation);


router.post("/factory/factory_by_sub_district_id", getFactoryByDistrictId);


router.post('/theme-master-list/datatable', theme_master_datatable);

// master_list
router.post("/master-list/datatable", fetch_master_list_datatable);
router.post("/master-list/create", createMasterList);
router.post("/master-list/update/:id", createMasterList);

// Profit center routes
router.post("/profit-center-list/datatable", profit_center_master_list_datatable);
router.post('/profit-center-list/create', createProfitCenterMaster)
router.post('/profit-center-list/update/:tprofc_id', updateProfitCenterMaster)
router.get('/profit-center-list/all-list', getAllProfitCenterList)


router.get('/profit-center-list-sub-district-wise/all-list', getAllProfitCenterListSubDistrictWise)



// sub_master-list routes
router.post("/sub-master-list/datatable/:id", fetch_sub_master_list_datatable);
router.post("/sub-master-list/create", createSubMasterList);
router.post("/sub-master-list/update/:id", createSubMasterList);
router.post("/sub-master-list/sub-master-list-by-master-slug", subMasterListByMasterSlug);

// router.post('/activity-master-list/datatable',  activity_master_datatable);


module.exports = router;
