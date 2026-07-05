import { privateAxios } from "./Helper";


// export const getAllVillagesApi = (data) => {
//     return privateAxios.post('admin/villages/list',data).then((response) =>response.data);
// }



export const createDistanceApi = (data) => {
    return privateAxios.post('admin/masters/distance/create', data).then((response) => response.data); 
}

export const updateDistanceApi = (data) => {
    return privateAxios.post(`admin/masters/distance/update`, data).then((response) => response.data); 
}
// export const updateDistanceApi = (data, id) => {
//     return privateAxios.post(`admin/masters/distance/update/${id}`, data).then((response) => response.data); 
// }

// export const deleteVillageApi=(id)=>{
//     return privateAxios.delete(`admin/distance/delete/${id}`).then((response)=>response.data)
// }
// export const getVillagesAsPerUnitId=(id)=>{
//     return privateAxios.get(`admin/distance/listid?unitId=${id}`).then((response)=>response.data)
// }

// export const getSingleVillageApi=(id)=>{
//     return privateAxios.get(`admin/distance/list/${id}`).then((response)=>response.data)
// }
export const getExcelExportDistanceList=()=>{
    return privateAxios.get("admin/masters/distance/excel-export-datatable").then((response)=>response.data)
}

export const getDistancesByStateDistrictApi = (data) => {
    return privateAxios.post('admin/masters/distance/get_distance_by_state_district', data).then((response) => response.data); 
}