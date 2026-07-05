import { privateAxios,myAxios } from "./Helper";


export const getAllPublicRegionApi = () => {
    return myAxios.get('auth/web/region_list').then((response) =>response.data);
}

export const getAllRegionApi = () => {
    return privateAxios.get('admin/masters/region/all-list').then((response) =>response.data);
}

export const updateRegionDetailsApi = (data,id) => {
    return privateAxios.post(`admin/masters/region/update/${id}`,data).then((response) =>response.data);
}

export const createRegionApi=(data)=>{

    return privateAxios.post("admin/masters/region/create",data).then((response)=>response.data)
}
export const getExcelExportRegionList=()=>{
    return privateAxios.get("admin/masters/region/excel-export-datatable").then((response)=>response.data)
}


