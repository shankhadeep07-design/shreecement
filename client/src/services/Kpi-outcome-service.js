import { privateAxios } from "./Helper";




export const createKpiOutcomeApi = (data) => {
    return privateAxios.post('admin/masters/kpi-outcome/create', data).then((response) => response.data);
}

export const updateKpiOutcomeApi = (data, id) => {
    return privateAxios.post(`admin/masters/kpi-outcome/update/${id}`, data).then((response) => response.data);
}


export const getExcelExportKpiOutcomeList = () => {
    return privateAxios.get("admin/masters/kpi-outcome/excel-export-datatable").then((response) => response.data)
}

// export const getExcelExportSubThemeList = () => {
//     return privateAxios.get("admin/masters/sub-theme/excel-export-datatable").then((response) => response.data)
// }