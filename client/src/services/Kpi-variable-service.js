import { privateAxios } from "./Helper";




export const createKpiVariableApi = (data) => {
    return privateAxios.post('admin/masters/kpi-variable/create', data).then((response) => response.data);
}

export const updateKpiVariableApi = (data, id) => {
    return privateAxios.post(`admin/masters/kpi-variable/update/${id}`, data).then((response) => response.data);
}


export const getExcelExportKpiVariableList = () => {
    return privateAxios.get("admin/masters/kpi-variable/excel-export-datatable").then((response) => response.data)
}

// export const getExcelExportSubThemeList = () => {
//     return privateAxios.get("admin/masters/sub-theme/excel-export-datatable").then((response) => response.data)
// }