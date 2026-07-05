import { privateAxios } from "./Helper";


export const updateNationalIndicatorApi = (data, id) => {
    return privateAxios.post(`admin/priority-alignment/national-indicator-list/update/${id}`, data,
    ).then((response) => response.data);
}

export const createNationalIndicatorApi = (data) => {

    return privateAxios.post("admin/priority-alignment/national-indicator-list/create", data,
    ).then((response) => response.data)
}
export const getExcelExportNationalIndicatorList = () => {
    return privateAxios.get("admin/priority-alignment/national-indicator-list/excel-export-datatable").then((response) => response.data)
}

export const allSdgs = async () => {
    return await privateAxios
        .get("admin/priority-alignment/sdg-master-list/all-list")
        .then((response) => response.data);
};



// Sdg Function End--------------------------------------------------------------------------------------------