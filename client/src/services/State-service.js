import { myAxios, privateAxios } from "./Helper";

export const getAllStateApi = () => {
    return privateAxios.get('admin/masters/state/all-list').then((response) =>response.data);
}

export const updateStateDetailsApi = (data,id) => {
    return privateAxios.post(`admin/masters/state/update/${id}`,data).then((response) =>response.data);
}

export const createStateApi=(data)=>{

    return privateAxios.post("admin/masters/state/create",data).then((response)=>response.data)
}
export const getExcelExportStateList=()=>{
    return privateAxios.get("admin/masters/state/excel-export-datatable").then((response)=>response.data)
}

export const deleteStateApi=(id)=>{
    return privateAxios.delete(`admin/master/state/delete/${id}`).then((response)=>response.data)
}
export const getStateByRegionId = (id) => {
    return privateAxios.post(`admin/masters/state/states_by_region_id/${id}`).then((response) =>response.data);
}
export const getAllPublicStateApi = () => {
    return myAxios.get('auth/web/state_list').then((response) =>response.data);
}

