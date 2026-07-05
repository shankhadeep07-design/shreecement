import { myAxios, privateAxios } from "./Helper";


export const updateThemeApi = (data, id) => {
    return privateAxios.post(`admin/masters/theme/update/${id}`, data).then((response) => response.data);
}

export const createThemeApi = (data) => {

    return privateAxios.post("admin/masters/theme/create", data).then((response) => response.data)
}

export const getExcelExportThemeList = () => {
    return privateAxios.get("admin/masters/theme/excel-export-datatable").then((response) => response.data)
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
        .get(`admin/masters/theme/${projectId}`)
        .then((response) => response.data);
};


export const getAllThemeApi = () => {
    return privateAxios.get('admin/masters/theme/all-list').then((response) => response.data);
}
