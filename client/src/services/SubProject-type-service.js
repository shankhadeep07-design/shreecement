import { myAxios, privateAxios } from "./Helper";


export const updateSubProjectTypeDetailsApi = (data, id) => {
    return privateAxios.post(`admin/masters/sub-project-type/update/${id}`, data).then((response) => response.data);
}

export const createSubProjectTypeApi = (data) => {

    return privateAxios.post("admin/masters/sub-project-type/create", data).then((response) => response.data)
}

export const getExcelExportSubProjectTypeList = () => {
    return privateAxios.get("admin/masters/sub-project-type/excel-export-datatable").then((response) => response.data)
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
        .get(`admin/masters/sub-project-type/${projectId}`)
        .then((response) => response.data);
};



