import { myAxios, privateAxios } from "./Helper";



export const updateGalleryApi = (data, id) => {
    return privateAxios.post(`admin/gallery/create_or_update/${id}`, data).then((response) => response.data);
}

export const createGalleryApi = (data) => {

    return privateAxios.post("admin/gallery/create_or_update", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }).then((response) => response.data)
}

export const getThemeWiseProjectsListsApi = (data) => {
    return privateAxios.post(`admin/gallery/theme-wise-projects-list`, data).then((response) => response.data)
}

export const getExcelExportGalleryList=()=>{
    return privateAxios.get("admin/gallery/excel-export-datatable").then((response)=>response.data)
}


export const deleteGalleryImageApi = async (tdoc_id) => {

    return privateAxios.delete(`admin/gallery/delete-image/${tdoc_id}`).then((response)=>response.data)
};
