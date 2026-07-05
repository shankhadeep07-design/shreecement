import { privateAxios } from "./Helper";

export const getAllUnitApi = (data) => {
  return privateAxios.get("admin/unit", data).then((response) => response.data);
};

export const getAllAssingnedUnitApi = (data) => {
  return privateAxios.get("admin/unit/assigned-units", data).then((response) => response.data);
};

export const getAllTalukaByStateAndDistrictAndTaluka = (
  state_id,
  district_id,
  taluka_id
) => {
  return privateAxios
    .get(`admin/unit/${state_id}/${district_id}/${taluka_id}`)
    .then((response) => response.data);
};

export const updateUnitDetailsApi = (data, id) => {
  console.log("updatable data", data);
  return privateAxios
    .post(`admin/unit/update/${id}`, data)
    .then((response) => response.data);
};

// export const createUnitApi = (data, id) => {
//   return privateAxios
//     .post("admin/unit/create", data)
//     .then((response) => response.data);
// };

export const deleteUnitApi = (id) => {
  return privateAxios
    .delete(`admin/unit/delete/${id}`)
    .then((response) => response.data);
};

export const updateUnitApi = (data,id) => {
    return privateAxios.post(`admin/masters/unit/update/${id}`,data).then((response) =>response.data);
}

export const createUnitApi=(data)=>{
    return privateAxios.post("admin/masters/unit/create",data).then((response)=>response.data)
}

export const getExcelExportUnitList=()=>{
    return privateAxios.get("admin/masters/unit/excel-export-datatable").then((response)=>response.data)
}
