import { myAxios, privateAxios } from "./Helper";



export const updateCaseStudiesApi = (data, id) => {
    return privateAxios.post(`admin/case-studies/create_or_update/${id}`, data).then((response) => response.data);
}

export const createCaseStudiesApi = (data) => {

    return privateAxios.post("admin/case-studies/create_or_update", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }).then((response) => response.data)
}

export const getThemeWiseProjectsListsApi = (data) => {
    return privateAxios.post(`admin/case-studies/theme-wise-projects-list`, data).then((response) => response.data)
}

export const getExcelExportCaseStudiesList=()=>{
    return privateAxios.get("admin/case-studies/excel-export-datatable").then((response)=>response.data)
}



export const deleteCaseStudiesDocApi = async (tdoc_id) => {

    return privateAxios.delete(`admin/case-studies/delete-document/${tdoc_id}`).then((response)=>response.data)
};

