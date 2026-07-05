// import { privateAxios } from "./Config-service";
import { privateAxios } from "./Helper";



export const fetchStates = async () => {
  return await privateAxios
    .post(`admin/master/states`)
    .then((response) => response.data);
};

export const fetchDistricts = async (stateId) => {
  return await privateAxios
  .get(`admin/master/districts/${stateId}`)
  .then((response) => response.data);
};

export const fetchBlocks = async (districtId) => {
  return await privateAxios
  .get(`admin/master/blocks/${districtId}`)
  .then((response) => response.data);
};

export const fetchGrampanchyats = async (blockId) => {
  return await privateAxios
  .get(`admin/master/grampanchyats/${blockId}`)
  .then((response) => response.data);
};

export const villageCreate = async (data) => {
  return await privateAxios
  .post(`admin/villageprofile/village_create/`,data)
  .then((response) => response.data);
};

export const villageProfileSubmit = async (data) => {
  return await privateAxios
  .post(`admin/villageprofile/village_profile_submit/`,data)
  .then((response) => response.data);
};

export const fetchVillageProfileDetails = async (id) => {
  return await privateAxios
    .post(`admin/villageprofile/village_profile_details/${id}`)
    .then((response) => response.data);
};

export const villageBasicDeatils = async (id) => {
  return await privateAxios
  .post(`admin/villageprofile/village_basic_details/${id}`)
  .then((response) => response.data);
};

export const villageBasicSubmit = async (data) => {
  return await privateAxios
  .post(`admin/villageprofile/village_basic_submit/`,data)
  .then((response) => response.data);
};

export const villagePupulationSubmit = async (data) => {
  return await privateAxios
  .post(`admin/villageprofile/village_population_submit/`,data)
  .then((response) => response.data);
};

export const villagePopulationDeatils = async (id) => {
  return await privateAxios
  .post(`admin/villageprofile/village_population_details/${id}`)
  .then((response) => response.data);
};