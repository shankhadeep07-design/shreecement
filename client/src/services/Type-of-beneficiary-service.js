import { privateAxios } from "./Helper";


// export const getAllVillagesApi = (data) => {
//     return privateAxios.post('admin/villages/list',data).then((response) =>response.data);
// }

export const createTypeOfBeneficiaryApi = (data) => {
    return privateAxios.post('admin/masters/type-of-beneficiary/create', data).then((response) => response.data); 
}

export const updateTypeOfBeneficiaryApi = (data, id) => {
    return privateAxios.post(`admin/masters/type-of-beneficiary/update/${id}`, data).then((response) => response.data); 
}


export const getExcelExportTypeOfBeneficiaryList=()=>{
    return privateAxios.get("admin/masters/type-of-beneficiary/excel-export-datatable").then((response)=>response.data)
}

export const getExcelExportSubThemeList = () => {
    return privateAxios.get("admin/masters/sub-theme/excel-export-datatable").then((response) => response.data)
}