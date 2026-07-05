import { privateAxios } from "./Helper";


export const getAllDistrictApi = () => {
    return privateAxios.get('admin/master/districts').then((response) =>response.data);
}

export const getDistrictByStateId = (id) => {
    return privateAxios.get(`admin/master/district_list/${id}`).then((response) =>response.data);
}


export const updateDistrictApi = (data,id) => {
    return privateAxios.post(`admin/masters/districts/update/${id}`,data).then((response) =>response.data);
}

export const createDistrictApi=(data)=>{
    return privateAxios.post("admin/masters/districts/create",data).then((response)=>response.data)
}

export const getExcelExportDistrictList=()=>{
    return privateAxios.get("admin/masters/districts/excel-export-datatable").then((response)=>response.data)
}

export const deleteDistrictApi=(id)=>{
    return privateAxios.delete(`admin/master/district/delete/${id}`).then((response)=>response.data)
}

