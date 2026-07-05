import { privateAxios } from "./Helper";




export const createCategoryApi = (data) => {
    return privateAxios.post('admin/masters/category/create', data).then((response) => response.data);
}

export const updateCategoryApi = (data, id) => {
    return privateAxios.post(`admin/masters/category/update/${id}`, data).then((response) => response.data);
}


export const getExcelExportCategoryList = () => {
    return privateAxios.get("admin/masters/category/excel-export-datatable").then((response) => response.data)
}

// export const getExcelExportSubThemeList = () => {
//     return privateAxios.get("admin/masters/sub-theme/excel-export-datatable").then((response) => response.data)
// }