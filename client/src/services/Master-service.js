// import { publicAxios,privateAxios } from "./Config-service";
import { myAxios, privateAxios } from "./Helper";

export const masterList = () => {
  return privateAxios
    .post(`admin/master/lists`)
    .then((response) => response.data);
};

export const currentFinancialYear = () => {
  return privateAxios
    .post(`admin/masters/financial-year-list`)
    .then((response) => response.data);
};

export const getUnitList = () => {
  return privateAxios
    .get(`admin/masters/unit/all-list`)
    .then((response) => response.data);
};

export const getBlocksByDistrictIds = async (districtId) => {
  return await privateAxios
    .get(`admin/masters/blocks/single_block_by_district_id/${districtId}`)
    .then((response) => response.data)
    .catch((error) => error);
};
export const getGramPanchayatsByBlockIds = async (blockId) => {
  return await privateAxios
    .get(`admin/masters/grampanchayat/grampanchayat_by_block_id/${blockId}`)
    .then((response) => response.data)
    .catch((error) => error);
};
export const getRevenueVillageByGramPanchayatIds = async (gramPanchayatId) => {
  return await privateAxios
    .get(
      `admin/masters/revenue-village/revenue_village_by_grampanchayat_id/${gramPanchayatId}`,
    )
    .then((response) => response.data)
    .catch((error) => error);
};
export const getVillageByRevenueVillageIds = async (revenueVillageId) => {
  return await privateAxios
    .get(
      `admin/masters/village/village_by_revenue_village_id/${revenueVillageId}`,
    )
    .then((response) => response.data)
    .catch((error) => error);
};
export const fetchVillagesByRevenueVillageIds = async (
    revenue_village_ids,
    unit_id,
) => {
    return await privateAxios
        .post(`admin/masters/village/villages_by_revenue_village_ids`, {
            revenue_village_ids,
            unit_id,
        })
        .then((response) => response.data)
        .catch((error) => error);
};



export const getTypeOfVillageList = async () => {
  return await privateAxios
    .get(`admin/masters/type_of_village/all-list`)
    .then((response) => response.data)
    .catch((error) => error);
};

export const getLocationByUnitId = async (unitId) => {
  return await privateAxios.get(`admin/masters/unit/unit-location/${unitId}`);
};

export const getLocationByUnitIdForApprovedBudget = async (unitId, fyId) => {
  return await privateAxios.get(
    `admin/masters/unit/approved-budget-unit-location/${unitId}`,
    {
      params: { fy_id: fyId }, // ✅ query param
    }
  );
};
export const getSdgList = async () => {
  return await privateAxios.get(`admin/masters/sdg/all-list`);
};
export const getNgoList = async () => {
  return await privateAxios.get(`admin/masters/ngo/all-list`);
};
export const getKpiList = async () => {
  return await privateAxios.get(`admin/masters/kpi/all-list`);
};

export const getThemeWiseKpiList = async (themeId) => {
  return await privateAxios.get(`admin/masters/kpi/themewise-all-list`, {
    params: { thematic_area_id: themeId },
  });
};

export const updateKpiApi = (data, id) => {
  return privateAxios
    .post(`admin/masters/kpi/update/${id}`, data)
    .then((response) => response.data);
};

export const createKpiApi = (data) => {
  return privateAxios
    .post("admin/masters/kpi/create", data)
    .then((response) => response.data);
};

export const getExcelExportKpiList = () => {
  return privateAxios
    .get("admin/masters/kpi/excel-export-datatable")
    .then((response) => response.data);
};

export const fetchKpiByThemeId = async (theme_id) => {
  return await privateAxios
    .get(`admin/masters/kpi-list-by-theme/${theme_id}`)
    .then((response) => response.data)
    .catch((error) => error);
};

export const fetchKpiByScheduleViiId = async (schedule_seven_id) => {
  return await privateAxios
    .get(`admin/masters/kpi-list-by-schedule/${schedule_seven_id}`)
    .then((response) => response.data)
    .catch((error) => error);
};
export const fetchBlocksByDistrictIdsWithOutLabelValue = async (districtId) => {
  return await privateAxios
    .get(
      `admin/masters/blocks/blocks_by_district_id_with_out_label_value/${districtId}`,
    )
    .then((response) => response.data)
    .catch((error) => error);
};
export const fetchBlocksByDistrictIds = async (districtId) => {
  return await privateAxios
    .get(`admin/masters/blocks/blocks_by_district_id/${districtId}`)
    .then((response) => response.data)
    .catch((error) => error);
};

// Revenue Village Master Api
export const updateRevenueVillageApi = (data, id) => {
  return privateAxios
    .post(`admin/masters/revenue/update/${id}`, data)
    .then((response) => response.data);
};

export const createRevenueVillageApi = (data) => {
  return privateAxios
    .post("admin/masters/revenue/create", data)
    .then((response) => response.data);
};

export const getExcelExportRevenueVillageList = () => {
  return privateAxios
    .get("admin/masters/revenue/excel-export-datatable")
    .then((response) => response.data);
};

export const scheduleSeven = () => {
  return privateAxios
    .post(`admin/master/schedule-seven-list`)
    .then((response) => response.data);
};

export const natureOfMedical = () => {
  return privateAxios
    .post(`admin/master/nature-medical-list`)
    .then((response) => response.data);
};

export const projectMaster = () => {
  return privateAxios
    .post(`admin/master/project-master-list`)
    .then((response) => response.data);
};

export const getState = (data) => {
  return privateAxios
    .post(`admin/master/states`, data)
    .then((response) => response.data);
};
export const getAllState = (data) => {
  return privateAxios
    .get(`admin/masters/state/all-list`, data)
    .then((response) => response.data);
};
export const getAllEducation = (data) => {
  return privateAxios
    .get(`admin/masters/education/all-list`, data)
    .then((response) => response.data);
};

export const getBlockApi = (data) => {
  return privateAxios
    .post(`admin/master/blocks`, data)
    .then((response) => response.data);
};

// export const createBlockApi = (data) => {

//     return privateAxios
//         .post(`admin/master/blocks/create/`, data)
//         .then((response) => response.data);
// };

export const updateBlock = (data, id) => {
  return privateAxios
    .post(`admin/master/blocks/create/${id}`, data)
    .then((response) => response.data);
};

export const getVillageByProjectId = (id) => {
  return privateAxios
    .post(`admin/master/village-by-project-id/${id}`)
    .then((response) => response.data);
};

export const fetchStateByFoundationIds = async (stateIds) => {
  return await privateAxios
    .post(`admin/master/states/state_by_foundationids`, stateIds)
    .then((response) => response.data);
};

export const fetchDistrictsByStateIds = async (stateId) => {
  return await privateAxios
    .post(`admin/masters/districts/districts_by_state_id/${stateId}`)
    .then((response) => response.data)
    .catch((error) => error);
};

export const fetchLocationsByBlockIds = async (blockId) => {
  return await privateAxios
    .get(`admin/masters/locations/locations_by_block_id/${blockId}`)
    .then((response) => response.data)
    .catch((error) => error);
};

export const getAllLocationByFactory = (factId) => {
  return privateAxios
    .get(`admin/masters/locations/locations_by_factory_id/${factId}`)
    .then((response) => response.data)
    .catch((error) => error);
};

export const getAllFactoryByLocation = (locaId) => {
  return privateAxios
    .get(`admin/masters-management/factory/factory_by_location_id/${locaId}`)
    .then((response) => response.data)
    .catch((error) => error);
};

export const fetchVillagesByBlockIds = async (blockIds) => {
  return await privateAxios
    .post(`admin/master/villages/villages_by_block_ids`, blockIds)
    .then((response) => response.data);
};

export const fetchVillagesLists = async () => {
  return await privateAxios
    .post(`admin/master/villages/lists`)
    .then((response) => response.data);
};

export const createVillageApi = async (data) => {
  return await privateAxios
    .post(`admin/master/villages/create`, data)
    .then((response) => response.data);
};

export const fetchTickToAppropriateLists = async () => {
  return await privateAxios
    .post(`admin/master/tick-to-appropriate/lists`)
    .then((response) => response.data);
};

export const createTickToAppropriate = async (data) => {
  return await privateAxios
    .post(`admin/master/tick-to-appropriate/create`, data)
    .then((response) => response.data);
};

export const fetchProjectStageLists = async () => {
  return await privateAxios
    .post(`admin/master/project_stage/lists`)
    .then((response) => response.data);
};

export const createProjectStage = async (data) => {
  return await privateAxios
    .post(`admin/master/project_stage/create`, data)
    .then((response) => response.data);
};

export const fetchFoundationLists = async () => {
  return await privateAxios
    .post(`admin/master/foundation/lists`)
    .then((response) => response.data);
};

export const fetchFoundationByStateId = async (data) => {
  return await privateAxios
    .post(`admin/master/foundation/foundation_by_state_ids`, data)
    .then((response) => response.data);
};

export const createFoundation = async (data) => {
  return await privateAxios
    .post(`admin/master/foundation/create`, data)
    .then((response) => response.data);
};
export const createVtcFaculty = async (data) => {
  return await privateAxios
    .post(`admin/master/vtcfaculty/create`, data)
    .then((response) => response.data);
};

export const fetchEventLists = async () => {
  return await privateAxios
    .post(`admin/master/event/lists`)
    .then((response) => response.data);
};

export const createEvent = async (data) => {
  return await privateAxios
    .post(`admin/master/event/create`, data)
    .then((response) => response.data);
};

export const fetchGenderLists = async () => {
  return await privateAxios
    .post(`admin/master/gender/lists`)
    .then((response) => response.data);
};

export const createGender = async (data) => {
  return await privateAxios
    .post(`admin/master/gender/create`, data)
    .then((response) => response.data);
};

export const fetchCenterLists = async () => {
  return await privateAxios
    .post(`admin/master/center/lists`)
    .then((response) => response.data);
};

export const createCenter = async (data) => {
  return await privateAxios
    .post(`admin/master/center/create`, data)
    .then((response) => response.data);
};

export const fetchSocioEconomicLists = async () => {
  return await privateAxios
    .post(`admin/master/socio-economic/lists`)
    .then((response) => response.data);
};

export const createSocioEconomic = async (data) => {
  return await privateAxios
    .post(`admin/master/socio-economic/create`, data)
    .then((response) => response.data);
};

export const fetchCasteLists = async () => {
  return await privateAxios
    .post(`admin/master/caste/lists`)
    .then((response) => response.data);
};

export const createCaste = async (data) => {
  return await privateAxios
    .post(`admin/master/caste/create`, data)
    .then((response) => response.data);
};

// Course Api

export const fetchCourseLists = async () => {
  return await privateAxios
    .post(`admin/master/course/lists`)
    .then((response) => response.data);
};
export const createCourse = async (data) => {
  return await privateAxios
    .post(`admin/master/course/create`, data)
    .then((response) => response.data);
};

// IncomeGen Api

export const fetchIncomeGenLists = async () => {
  return await privateAxios
    .post(`admin/master/incomegen/lists`)
    .then((response) => response.data);
};
export const createIncomeGen = async (data) => {
  return await privateAxios
    .post(`admin/master/incomegen/create`, data)
    .then((response) => response.data);
};

// Health Fogging Center Master

export const fetchHealthFoggingCenterMasterLists = async () => {
  return await privateAxios
    .post(`admin/master/health-fogging-center-master/lists`)
    .then((response) => response.data);
};
export const createHealthFoggingCenterMaster = async (data) => {
  return await privateAxios
    .post(`admin/master/health-fogging-center-master/create`, data)
    .then((response) => response.data);
};

// Health Center Master Api

export const fetchHealthCenterMasterLists = async () => {
  return await privateAxios
    .post(`admin/master/health-center-master/lists`)
    .then((response) => response.data);
};
export const createHealthCenterMaster = async (data) => {
  return await privateAxios
    .post(`admin/master/health-center-master/create`, data)
    .then((response) => response.data);
};

export const fetchVulnerabilityLists = async () => {
  return await privateAxios
    .post(`admin/master/vulnerability/lists`)
    .then((response) => response.data);
};

export const createVulnerability = async (data) => {
  return await privateAxios
    .post(`admin/master/vulnerability/create`, data)
    .then((response) => response.data);
};

export const getAllTypeApi = (data) => {
  return privateAxios
    .post("admin/master/type-master", data)
    .then((response) => response.data);
};

export const getAllRoleByTypeIdApi = (data) => {
  return privateAxios
    .post("admin/master/role-by-typeids", data)
    .then((response) => response.data);
};

export const getAllEducationMasterApi = (data) => {
  return privateAxios
    .post("admin/master/education/lists", data)
    .then((response) => response.data);
};

// VTC Faculty List

export const fetchVTCFacultyLists = async () => {
  return await privateAxios
    .post(`admin/master/vtcfaculty/list`)
    .then((response) => response.data);
};

export const getMasterDetailsApi = (data, id) => {
  return privateAxios
    .post(`admin/master_backup/${id}`, data)
    .then((response) => response.data);
};

// export const getDepartmentsApi = (data, id) => {
//   return privateAxios
//     .post(`admin/master/department_list`, data)
//     .then((response) => response.data);
// };

// Approval Api

export const fetchAllApprovalMasterList = async () => {
  return await privateAxios
    .get(`admin/approvals/all_approval_master_list`)
    .then((response) => response.data)
    .catch((error) => error);
};
export const getDepartmentsApi = (data, id) => {
  return privateAxios
    .post(`admin/approvals/department_list`, data)
    .then((response) => response.data);
};

export const getLocationsApi = (data, id) => {
  return privateAxios
    .post(`admin/approvals/locations_list`, data)
    .then((response) => response.data);
};

// Master List
export const updateMasterListApi = (data, id) => {
  return privateAxios
    .post(`admin/masters-management/master-list/update/${id}`, data)
    .then((response) => response.data);
};

export const createMasterListApi = (data) => {
  return privateAxios
    .post("admin/masters-management/master-list/create", data)
    .then((response) => response.data);
};

// Sub Master List
export const updateSubMasterListApi = (data, id) => {
  return privateAxios
    .post(`admin/masters-management/sub-master-list/update/${id}`, data)
    .then((response) => response.data);
};

export const createSubMasterListApi = (data) => {
  return privateAxios
    .post("admin/masters-management/sub-master-list/create", data)
    .then((response) => response.data);
};

export const getExcelExportSubMasterList = () => {
  return privateAxios
    .get("admin/masters-management/sub-master-list/excel-export-datatable")
    .then((response) => response.data);
};

export const getSubMasterListByMasterSlugApi = (data) => {
  return privateAxios
    .post(
      "admin/masters-management/sub-master-list/sub-master-list-by-master-slug",
      data,
    )
    .then((response) => response.data);
};
export const fetchAllCategoryList = () => {
  return privateAxios
    .get("admin/masters/category/all-list")
    .then((response) => response.data);
};
export const fetchAllThemeList = () => {
  return privateAxios
    .get("admin/masters/theme/all-list")
    .then((response) => response.data);
};

export const getSubMasterListByMasterSlugApiForUser = (data) => {
  return myAxios
    .post("auth/web/sub-master-list/sub-master-list-by-master-slug", data)
    .then((response) => response.data);
};

export const fetchAllSdgsList = () => {
  return privateAxios
    .get("admin/masters/sdgs/all-list")
    .then((response) => response.data);
};
export const fetchAllVerticalApi = (data) => {
  return privateAxios
    .get("admin/masters/vertical/all-list", data)
    .then((response) => response.data);
};
export const getExcelExportVerticalList = () => {
  return privateAxios
    .get("admin/masters/vertical/excel-export-datatable")
    .then((response) => response.data);
};
export const fetchAllPublicCompanyApi = (data) => {
  return privateAxios
    .get("auth/web/company_list", data)
    .then((response) => response.data);
};
export const fetchPublicDistrictsListByStateIds = async (stateId) => {
  return await myAxios
    .post(`auth/web/districts/districts_list_by_state_id`, stateId)
    .then((response) => response.data)
    .catch((error) => error);
};
export const getCompanyMasterListApi = (data) => {
  return privateAxios
    .post("admin/masters/company-master-list", data)
    .then((response) => response.data);
};
export const fetchAllCompanyApi = (data) => {
  return privateAxios
    .get("admin/masters/company/all-list", data)
    .then((response) => response.data);
};
export const fetchDistrictsListByStateIds = async (stateId) => {
  return await privateAxios
    .post(`admin/masters/districts/districts_list_by_state_id`, stateId)
    .then((response) => response.data)
    .catch((error) => error);
};

export const fetchSubdistrictListByDistrictIds = async (district_ids) => {
  return await privateAxios
    .post(`admin/masters/blocks/blocks_by_district_id`, {
      district_ids: district_ids,
    })
    .then((response) => response.data)
    .catch((error) => error);
};

// export const fetchSubdistrictListByDistrictIds = async (district_ids) => {
//     console.log("Is array:", Array.isArray(district_ids));

//     return await privateAxios.get(
//         "admin/masters/blocks/blocks_by_district_id",
//         {
//             params: {
//                 district_ids: district_ids
//             }
//         }
//     )
//     .then(res => res.data)
//     .catch(err => err);
// };
export const statusChange = async ({ table, pk, status }) => {
  try {
    const response = await privateAxios.post("admin/masters/status-change", {
      table_name: table,
      primary_key: pk,
      status: status,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const fetchSubDistrictsListByDistrictIdsForProposalCreation = async (
  districtIds,
) => {
  console.log("fetchSubDistrictsListByDistrictIds called with:", districtIds); // log the array
  console.log("Is array--------:", Array.isArray(districtIds));

  if (!districtIds || districtIds.length === 0) return [];
  // For single ID API
  const id = districtIds[0]; // take first ID
  console.log("Using district ID:", id); // log the ID being sent in request

  return privateAxios
    .get(`admin/masters/blocks/blocks_by_district_id/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("Error fetching sub districts:", err);
      throw err;
    });
};

export const fetchSubDistrictsListByDistrictIds = async (districtIds) => {
  if (!Array.isArray(districtIds) || districtIds.length === 0) return [];
  return privateAxios
    .get("admin/masters/blocks/blocks_by_district_id", {
      params: {
        district_ids: districtIds,
      },
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error("Error fetching sub districts:", err);
      throw err;
    });
};
export const fetchLocationsListBySubdistrictIds = async (subdistrictIds) => {
  if (!Array.isArray(subdistrictIds) || subdistrictIds.length === 0) return [];

  return privateAxios
    .post("admin/masters/locations/locations_by_sub_district_id", {
      sub_district_ids: subdistrictIds, // ✅ DIRECT BODY
    })
    .then((res) => res.data)
    .catch((err) => {
      console.error("Error fetching locations:", err);
      throw err;
    });
};

export const fetchFactoriesBySubDistrictIds = async (districtId) => {
  return await privateAxios
    .post(
      `admin/masters-management/factory/factory_by_sub_district_id`,
      districtId,
    )
    .then((response) => response.data)
    .catch((error) => error);
};

export const getVillageByTypes = async (
  tvl_village_type,
  tvl_revenue_village_id,
) => {
  return await privateAxios
    .post(`admin/masters/villages/village_by_type`, {
      tvl_village_type, // ✅ send type in body
      tvl_revenue_village_id, // ✅ send revenue village id in body
    })
    .then((response) => response.data)
    .catch((error) => error);
};
