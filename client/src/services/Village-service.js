import { privateAxios } from "./Helper";


export const getAllVillagesApi = (data) => {
    return privateAxios.post('admin/villages/list',data).then((response) =>response.data);
}


// export const updateVillageDetailsApi = (data,id) => {
//     return privateAxios.post(`admin/villages/update/${id}`,data).then((response) =>response.data);
// }

// export const createVillageApi=(data,id)=>{
//     return privateAxios.post("admin/villages/create",data).then((response)=>response.data)
// }

// In Master-service.js
export const createVillageApi = (data) => {
    return privateAxios.post('admin/masters/villages/create', data).then((response) => response.data); 
}

export const updateVillageDetailsApi = (data, id) => {
    return privateAxios.post(`admin/masters/villages/update/${id}`, data).then((response) => response.data); 
}

export const deleteVillageApi=(id)=>{
    return privateAxios.delete(`admin/villages/delete/${id}`).then((response)=>response.data)
}
export const getVillagesAsPerUnitId=(id)=>{
    return privateAxios.get(`admin/villages/listid?unitId=${id}`).then((response)=>response.data)
}

export const getSingleVillageApi=(id)=>{
    return privateAxios.get(`admin/villages/list/${id}`).then((response)=>response.data)
}
export const getExcelExportVillageList=()=>{
    return privateAxios.get("admin/masters/villages/excel-export-datatable").then((response)=>response.data)
}