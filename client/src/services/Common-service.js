import { privateAxios } from "./Helper";

export const StateNames = () => {
    return privateAxios
      .get(`admin/common/state_details`)
      .then((response) => response.data);
};

export const SiteNames = (state_id = null) => {
    return privateAxios
      .get(`admin/common/site_details/${state_id}`)
      .then((response) => response.data);
};

export const DistrictNames = (state_id = null) => {
    return privateAxios
    .get(`admin/common/district_details/${state_id}`)
    .then((response) => response.data);
};

export const TalukasNAmes = (district_id = null) => {
      return privateAxios
        .get(`admin/common/taluka_details/${district_id}`)
        .then((response) => response.data);
};

export const UnitNames = (taluka_id = null) => {
      return privateAxios
        .get(
          `admin/common/unit_details/${taluka_id}`
        )
        .then((response) => response.data);
};

export const VillageNames = (unit_id = null) => {
      return privateAxios
        .get(
          `admin/common/village_details/${unit_id}`
        )
        .then((response) => response.data);
};

export const AllVillageNames = () => {
  return privateAxios
    .get(
      `admin/common/all_village_details/`
    )
    .then((response) => response.data);
};

export const VillageNamesByTalukaId = (taluka_id) => {
  return privateAxios
    .get(
      `admin/common/taluka_village_details/${taluka_id}`
    )
    .then((response) => response.data);
};

export const approvalUsersApi = (data) => {
    return privateAxios.post('/admin/approvals/approval-users',data).then((response)=>response.data);
}

export const approvalProjectClosureUsersApi = (data) => {
    return privateAxios.post('/admin/approvals/approval-project-closure-users',data).then((response)=>response.data);
}


  