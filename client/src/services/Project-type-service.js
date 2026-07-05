import { myAxios, privateAxios } from "./Helper";


export const updateProjectTypeDetailsApi = (data, id) => {
    return privateAxios.post(`admin/masters/project-type/update/${id}`, data).then((response) => response.data);
}

export const createProjectTypeApi = (data) => {

    return privateAxios.post("admin/masters/project-type/create", data).then((response) => response.data)
}

export const getExcelExportProjectTypeList = () => {
    return privateAxios.get("admin/masters/project-type/excel-export-datatable").then((response) => response.data)
}



export const allProjectTypes = async () => {
    return await privateAxios
        .get("admin/masters/project-type/all")
        .then((response) => response.data);
};




