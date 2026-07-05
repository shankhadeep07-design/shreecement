import { privateAxios } from "./Helper";

export const blocks_by_district_id_api = (id) => {
    return privateAxios.get(`admin/masters/blocks/blocks_by_district_id/${id}`).then((response) =>response.data);
}

export const single_block_by_district_id_api = (id) => {
    return privateAxios.get(`admin/masters/blocks/single_block_by_district_id/${id}`).then((response) =>response.data);
}

export const updateBlockApi = (data,id) => {
    return privateAxios.post(`admin/masters/blocks/update/${id}`,data).then((response) =>response.data);
}

export const createBlockApi=(data)=>{
    return privateAxios.post("admin/masters/blocks/create",data).then((response)=>response.data)
}

export const getExcelExportBlockList=()=>{
    return privateAxios.get("admin/masters/blocks/excel-export-datatable").then((response)=>response.data)
}