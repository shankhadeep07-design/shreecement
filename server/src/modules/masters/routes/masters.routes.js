const express = require("express");
const router = express.Router();
const {
  fetch_districts_datatable,
  createDistrict,
  updateDistrict,
  getExcelExportDistrictList,
  getDistrictsByState,
  getDistrictsListByState,
} = require("../controllers/district.controller");
const {
  fetch_blocks_datatable,
  createBlock,
  updateBlock,
  getExcelExportBlockList,
  getBlocksByDistrict,
  getBlocksByDistrictForProposalCreation,
  getBlockByDistrictForProposalCreation,
  getBlocksByDistrictForProposalCreationWithOutLabelValuePair,
} = require("../controllers/block.controller");

// const {
//   fetch_locations_datatable,
//   getExcelExportLocationList,
//   createLocation,
//   updateLocation,
//   getLocationByBlock,
//   getLocationByFactory,
//   getAllLocationList,
//   getLocationByDistrictId,
//   getLocationBySubdistrictId,
// } = require("../controllers/location.controller");


const {
  fetch_gram_panchayat_datatable,
  getExcelExportGramPanchayatList,
  createGramPanchayat,
  updateGramPanchayat,
  // getLocationByBlock,
  // getLocationByFactory,
  // getAllLocationList,
  // getLocationByDistrictId,
  // getLocationBySubdistrictId,
} = require("../controllers/grampanchayat.controller");
const {
  fetch_states_datatable,
  createState,
  getAllStateList,
  getExcelExportStateList,
} = require("../controllers/state.controller");
const {
  getFinancialYears,
  statusChange,
} = require("../controllers/masters.controller");
const {
  fetch_region_datatable,
  getAllRegionList,
  getExcelExportRegionList,
  createRegion,
} = require("../controllers/region.controller");

const {
  fetch_vertical_datatable,
  getExcelExportVerticalList,
  createVertical,
  getAllVerticalList,
} = require("../controllers/vertical.controller");
const {
  fetch_company_datatable,
  createCompany,
  getAllCompanyList,
  getExcelExportCompanyList,
} = require("../controllers/company.controller");

const {
  createProjectType,
  fetch_project_types_datatable,
  getExcelExportProjectTypeList,
  getAllProjectTypeList,
} = require("../controllers/projecttype.controller");

const {
  fetch_sub_project_types_datatable,
  createSubProjectType,
  getExcelExportSubProjectTypeList,
  getAllSubprojectTypeListByprojectId,
} = require("../controllers/sub-projecttype.controller");

const {
  createOrUpdateTheme,
  fetch_themes_datatable,
  getExcelExportThemeList,
  getAllThemeList,
} = require("../controllers/theme.controller");
const {
  getAllCategoryList,
  fetch_category_datatable,
  getExcelExportCategoryList,
  createCategory,
  updateCategory

} = require("../controllers/category.controller");
const { getAllEducationList } = require("../controllers/education.controller");
const {
  getGrampanchayatByBlockId,
} = require("../controllers/grampanchayat.controller");
const {
  getRevenueVillageByGrampanchayatId,
  fetch_revenue_datatable,
  createRevenueVillage,
  updateRevenueVillage,
  getExcelExportRevenueVillageList,
} = require("../controllers/revenue_village.controller");
const {
  getAllTypeOfVillageList,
} = require("../controllers/type_of_village.controller");
const {
  getAllUnitList,
  getUnitLocationDetails,
  getApprovedBudgetUnitLocations,
  fetch_unit_datatable,
  updateUnit,
  createUnit,
  getExcelExportUnitList,
} = require("../controllers/unit.controller");
// const {
//   getVillageByRevenueVillageId,
//   fetch_village_datatable,
//   getExcelExportVillageList,
//   createVillage,
//   updateVillage
// } = require("../controllers/village.controlle");

const {
  getVillageByRevenueVillageId,
  fetch_village_datatable,
  getExcelExportVillageList,
  createVillage,
  updateVillage,
  getVillageByType,
  getVillagesByRevenueVillageIds
} = require("../controllers/village.controlle");


const {

  fetch_distance_datatable,
  getExcelExportDistanceList,
  createDistance,
  updateDistance,
  getDistanceByStateDistrictList
} = require("../controllers/distance.controller");



const {
  fetch_type_of_beneficiary_datatable,
  getExcelExportTypeOfBeneficiaryList,
  createTypeOfBeneficiary,
  updateTypeOfBeneficiary,

} = require("../controllers/type_of_beneficiary.controller");

const { getAllSdgList } = require("../controllers/sdg.controller");
const { getAllNgoList } = require("../controllers/ngo.controller");
const {
  getAllKpiList,
  getThemewiseAllKpiList,
  fetch_kpi_datatable,
  createKpi,
  updateKpi,
  getExcelExportKpiList,
  getKpiListByThemeId,
  getKpiListByScheduleSevenId
} = require("../controllers/kpi.controller");




const {
  fetch_sub_theme_datatable,
  getExcelExportSubThemeList,
  createSubTheme,
  updateSubTheme,
} = require("../controllers/sub-theme.controller");



const {
  fetch_kpi_outcome_datatable,
  getExcelExportKpiOutcomeList,
  createKpiOutcome,
  updateKpiOutcome,

} = require("../controllers/kpi_outcome.controller");






const {
  fetch_kpi_variable_datatable,
  getExcelExportKpiVariableList,
  createKpiVariable,
  updateKpiVariable,

} = require("../controllers/kpi_variable.controller");







// company routes
router.post("/company/datatable", fetch_company_datatable);
router.post("/company/create", createCompany);
router.post("/company/update/:id", createCompany);
router.get("/company/all-list", getAllCompanyList);
router.get("/company/excel-export-datatable", getExcelExportCompanyList);

// Region
router.post("/region/datatable", fetch_region_datatable);
router.post("/region/create", createRegion);
router.post("/region/update/:id", createRegion);
router.get("/region/all-list", getAllRegionList);
router.get("/region/excel-export-datatable", getExcelExportRegionList);

// vertical routes
router.post("/vertical/datatable", fetch_vertical_datatable);
router.post("/vertical/create", createVertical);
router.post("/vertical/update/:id", createVertical);
router.get("/vertical/all-list", getAllVerticalList);
router.get("/vertical/excel-export-datatable", getExcelExportVerticalList);

router.post("/states/datatable", fetch_states_datatable);
router.post("/state/create", createState);
router.post("/state/update/:id", createState);
router.get("/state/all-list", getAllStateList);
router.get("/state/excel-export-datatable", getExcelExportStateList);

router.post("/districts/datatable", fetch_districts_datatable);
router.post("/districts/create", createDistrict);
router.post("/districts/update/:tdl_district_id", updateDistrict);
router.get("/districts/excel-export-datatable", getExcelExportDistrictList);
router.post(
  "/districts/districts_by_state_id/:tdl_state_id",
  getDistrictsByState,
);
router.post("/districts/districts_list_by_state_id", getDistrictsListByState);

router.post("/blocks/datatable", fetch_blocks_datatable);
router.post("/blocks/create", createBlock);
router.post("/blocks/update/:tbl_block_id", updateBlock);
router.get("/blocks/excel-export-datatable", getExcelExportBlockList);

router.get(
  "/blocks/blocks_by_district_id_with_out_label_value/:tbl_district_id",
  getBlocksByDistrictForProposalCreationWithOutLabelValuePair,
);
router.get(
  "/blocks/blocks_by_district_id/:tbl_district_id",
  getBlocksByDistrictForProposalCreation,
);
router.get(
  "/blocks/single_block_by_district_id/:tbl_district_id",
  getBlockByDistrictForProposalCreation,
);
router.post("/blocks/blocks_by_district_id", getBlocksByDistrict);

// revenue-village
router.post("/revenue/datatable", fetch_revenue_datatable);
router.post("/revenue/create", createRevenueVillage);
router.post(
  "/revenue/update/:trevvlg_revenue_village_id",
  updateRevenueVillage,
);
router.get("/revenue/excel-export-datatable", getExcelExportRevenueVillageList);

// Grampanchayat routes
router.get(
  "/grampanchayat/grampanchayat_by_block_id/:tgrm_block_id",
  getGrampanchayatByBlockId,
);

// revenue village routes
router.get(
  "/revenue-village/revenue_village_by_grampanchayat_id/:trevvlg_grampanchayat_id",
  getRevenueVillageByGrampanchayatId,
);

// village routes
router.get(
  "/village/village_by_revenue_village_id/:tvl_revenue_village_id",
  getVillageByRevenueVillageId,
);
router.post(
  "/village/villages_by_revenue_village_ids",
  getVillagesByRevenueVillageIds,
);

// type of village routes
router.get("/type_of_village/all-list", getAllTypeOfVillageList);

// unit routes
router.get("/unit/all-list", getAllUnitList);
router.get("/unit/unit-location/:unit_id", getUnitLocationDetails);
router.get(
  "/unit/approved-budget-unit-location/:unit_id",
  getApprovedBudgetUnitLocations
);
router.post("/unit/datatable", fetch_unit_datatable);
router.post("/unit/create", createUnit);
router.post("/unit/update/:tun_id", updateUnit);
router.get("/unit/excel-export-datatable", getExcelExportUnitList);







// router.post("/locations/datatable", fetch_locations_datatable);
// router.get("/locations/excel-export-datatable", getExcelExportLocationList);
// router.post("/locations/create", createLocation);
// router.post("/locations/update/:tloc_location_id", updateLocation);
// router.get(
//   "/locations/locations_by_block_id/:tloc_block_id",
//   getLocationByBlock,
// );
// router.get(
//   "/locations/locations_by_factory_id/:tloc_factory_id",
//   getLocationByFactory,
// );
// router.get("/locations/all-list", getAllLocationList);
// router.get(
//   "/locations/locations_by_district_id/:tloc_district_id",
//   getLocationByDistrictId,
// );
// router.post(
//   "/locations/locations_by_sub_district_id",
//   getLocationBySubdistrictId,
// );



// start of grampanchayet route

router.post("/gram-panchayat/datatable", fetch_gram_panchayat_datatable);
router.get("/gram-panchayat/excel-export-datatable", getExcelExportGramPanchayatList);
router.post("/gram-panchayat/create", createGramPanchayat);
router.post("/gram-panchayat/update/:tgrm_grampanchayat_id", updateGramPanchayat);




// router.get(
//   "/gram-panchayet/locations_by_block_id/:tloc_block_id",
//   getLocationByBlock,
// );
// router.get(
//   "/gram-panchayet/locations_by_factory_id/:tloc_factory_id",
//   getLocationByFactory,
// );
// router.get("/gram-panchayet/all-list", getAllLocationList);
// router.get(
//   "/gram-panchayet/locations_by_district_id/:tloc_district_id",
//   getLocationByDistrictId,
// );
// router.post(
//   "/gram-panchayet/locations_by_sub_district_id",
//   getLocationBySubdistrictId,
// );
// end of gram pancyayet route






// start of village route
router.post("/villages/datatable", fetch_village_datatable);
router.get("/villages/excel-export-datatable", getExcelExportVillageList);
router.post("/villages/create", createVillage);
router.post("/villages/update/:tgrm_grampanchayat_id", updateVillage);


// router.get(
//   "/villages/village_by_type/:tvl_revenue_village_id",
//   getVillageByType,
// );
router.post('/villages/village_by_type', getVillageByType);  // ✅ POST, no param in URL
// end of village route




// SUB Theme  start
router.post("/sub-theme/datatable", fetch_sub_theme_datatable);
router.post("/sub-theme/create", createSubTheme);
router.post("/sub-theme/update/:id", updateSubTheme);
router.get("/sub-theme/excel-export-datatable", getExcelExportSubThemeList);
// router.get("/sub-theme/all-list", getAllThemeList);
// router.get('/project-type/all', getAllProjectTypeList)

// Sub Theme end






// start of beneficiary type route
router.post("/type-of-beneficiary/datatable", fetch_type_of_beneficiary_datatable);
router.get("/type-of-beneficiary/excel-export-datatable", getExcelExportTypeOfBeneficiaryList);
router.post("/type-of-beneficiary/create", createTypeOfBeneficiary);
router.post("/type-of-beneficiary/update/:tben_beneficiary_type_id", updateTypeOfBeneficiary);



// end of beneficiary type route




// start of beneficiary type route
router.post("/kpi-outcome/datatable", fetch_kpi_outcome_datatable);
router.get("/kpi-outcome/excel-export-datatable", getExcelExportKpiOutcomeList);
router.post("/kpi-outcome/create", createKpiOutcome);
router.post("/kpi-outcome/update/:tben_beneficiary_type_id", updateKpiOutcome);



// end of beneficiary type route


// start of beneficiary type route
router.post("/kpi-variable/datatable", fetch_kpi_variable_datatable);
router.get("/kpi-variable/excel-export-datatable", getExcelExportKpiVariableList);
router.post("/kpi-variable/create", createKpiVariable);
router.post("/kpi-variable/update/:tben_beneficiary_type_id", updateKpiVariable);



// end of beneficiary type route



// start of category route
router.post("/category/datatable", fetch_category_datatable);
router.get("/category/excel-export-datatable", getExcelExportCategoryList);
router.post("/category/create", createCategory);
router.post("/category/update/:tcat_id", updateCategory);



// end of category route




// start of village route
router.post("/distance/datatable", fetch_distance_datatable);
router.get("/distance/excel-export-datatable", getExcelExportDistanceList);
router.post("/distance/create", createDistance);
router.post("/distance/update", updateDistance);
router.post("/distance/get_distance_by_state_district", getDistanceByStateDistrictList);
// end of village route



// financial year Routes Start

router.post("/financial-year-list", getFinancialYears);

// financial year Routes End

// category routes start
router.get("/category/all-list", getAllCategoryList);

// education routes start
router.get("/education/all-list", getAllEducationList);

// sdg routes start
router.get("/sdg/all-list", getAllSdgList);

// ngo routes start
router.get("/ngo/all-list", getAllNgoList);

// kpi routes start
router.get("/kpi/all-list", getAllKpiList);

router.get("/kpi/themewise-all-list", getThemewiseAllKpiList);
router.post("/kpi/datatable", fetch_kpi_datatable);
router.post("/kpi/create", createKpi);
router.post("/kpi/update/:tkpi_id", updateKpi);
router.get("/kpi/excel-export-datatable", getExcelExportKpiList);
router.get("/kpi-list-by-theme/:theme_id", getKpiListByThemeId);
router.get("/kpi-list-by-schedule/:schedule_seven_id", getKpiListByScheduleSevenId);


// Project Type start
router.post("/project-type/datatable", fetch_project_types_datatable);
router.post("/project-type/create", createProjectType);
router.post("/project-type/update/:id", createProjectType);
// router.get('/project-type/all-list', getAllStateList)
router.get("/project-type/all", getAllProjectTypeList);
router.get(
  "/project-type/excel-export-datatable",
  getExcelExportProjectTypeList,
);
// project type end

// sub Project Type start
router.post("/sub-project-type/datatable", fetch_sub_project_types_datatable);
router.post("/sub-project-type/create", createSubProjectType);
router.post("/sub-project-type/update/:id", createSubProjectType);
router.get(
  "/sub-project-type/excel-export-datatable",
  getExcelExportSubProjectTypeList,
);
router.get(
  "/sub-project-type/:project_id",
  getAllSubprojectTypeListByprojectId,
);
// Sub project type end

// Theme  start
router.post("/theme/datatable", fetch_themes_datatable);
router.post("/theme/create", createOrUpdateTheme);
router.post("/theme/update/:id", createOrUpdateTheme);
router.get("/theme/excel-export-datatable", getExcelExportThemeList);
router.get("/theme/all-list", getAllThemeList);
// router.get('/project-type/all', getAllProjectTypeList)

// Theme end

///common change status route
router.post("/status-change", statusChange);
///common change status route
module.exports = router;
