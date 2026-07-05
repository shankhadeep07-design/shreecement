import { privateAxios } from "./Helper";

export const getAllFactoryApi = () => {
    return privateAxios.get('admin/masters-management/factory/all-list').then((response) =>response.data);
}

export const updateFactoryDetailsApi = (data,id) => {
    return privateAxios.post(`admin/masters-management/factory/update/${id}`,data).then((response) =>response.data);
}

export const createFactoryApi=(data)=>{

    return privateAxios.post("admin/masters-management/factory/create",data).then((response)=>response.data)
}
export const getExcelExportFactoryList=()=>{
    return privateAxios.get("admin/masters-management/factory/excel-export-datatable").then((response)=>response.data)
}

export const deleteFactoryApi=(id)=>{
    return privateAxios.delete(`admin/master/factory/delete/${id}`).then((response)=>response.data)
}


// Master List 

export const updateMasterListApi = (data,id) => {
    return privateAxios.post(`admin/masters-management/master-list/update/${id}`,data).then((response) =>response.data);
}

export const createMasterListApi=(data)=>{

    return privateAxios.post("admin/masters-management/master-list/create",data).then((response)=>response.data)
}

export const getExcelExportMasterList=()=>{
    return privateAxios.get("admin/masters-management/master-list/excel-export-datatable").then((response)=>response.data)
}


// ====================================Profit Center Start ===============================

export const updateProfitCenterDetailsApi = (data,id) => {
    return privateAxios.post(`admin/masters-management/profit-center-list/update/${id}`,data).then((response) =>response.data);
}

export const createProfitCenterApi=(data)=>{

    return privateAxios.post("admin/masters-management/profit-center-list/create",data).then((response)=>response.data)
}

export const getAllProfitCenterApi = () => {
    return privateAxios.get('admin/masters-management/profit-center-list/all-list').then((response) =>response.data);
}



export const getAllSubdistricWiseProfitCenterApi = () => {
    return privateAxios.get('admin/masters-management/profit-center-list-sub-district-wise/all-list').then((response) =>response.data);
}


// ====================================Profit Center End =================================