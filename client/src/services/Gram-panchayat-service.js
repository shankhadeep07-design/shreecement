import { privateAxios } from "./Helper";

export const getAllLocationApi = () => {
    return privateAxios.get('admin/masters/gram-panchayat/all-list').then((response) => response.data);
}

export const updateLocationApi = (data, id) => {
    return privateAxios.post(`admin/masters/gram-panchayat/update/${id}`, data).then((response) => response.data);
}

export const createLocationApi = (data) => {
    return privateAxios.post("admin/masters/gram-panchayat/create", data).then((response) => response.data)
}


export const getExcelExportLocationList = () => {
    return privateAxios.get("admin/masters/gram-panchayat/excel-export-datatable").then((response) => response.data)
}
// export const fetchLocationByBlockId=(id)=>{
//     return privateAxios.get(`admin/masters/gram-panchayat/gram-panchayat_by_block_id/${id}`).then((response)=>response.data)
// }
export const fetchLocationByDistrictId=(id)=>{
    return privateAxios.get(`admin/masters/gram-panchayat/locations_by_district_id/${id}`).then((response)=>response.data)
}