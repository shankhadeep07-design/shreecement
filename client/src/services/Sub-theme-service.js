import { myAxios, privateAxios } from "./Helper";


export const updateSubThemeApi = (data, id) => {
    return privateAxios.post(`admin/masters/sub-theme/update/${id}`, data).then((response) => response.data);
}

export const createSubThemeApi = (data) => {

    return privateAxios.post("admin/masters/sub-theme/create", data).then((response) => response.data)
}

export const getExcelExportSubThemeList = () => {
    return privateAxios.get("admin/masters/sub-theme/excel-export-datatable").then((response) => response.data)
}



export const allProjectTypes = async () => {
    return await privateAxios
        .get("admin/masters/project-type/all")
        .then((response) => response.data);
};

export const fetchSubSubProjectTypeByProjectId = (projectId) => {

    console.log("projectId---------------:", projectId);
    console.log("projectId type-------------:", typeof projectId);
    return privateAxios
        .get(`admin/masters/sub-theme/${projectId}`)
        .then((response) => response.data);
};




export const getExcelExportDomainList = () => {
    return privateAxios.get("admin/masters/domain/excel-export-datatable").then((response) => response.data)
}

