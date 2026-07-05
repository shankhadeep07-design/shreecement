import { myAxios, privateAxios } from "./Helper";



export const updateBestPracticeApi = (data, id) => {
    return privateAxios.post(`admin/best-practices/create_or_update/${id}`, data).then((response) => response.data);
}

export const createBestPracticeApi = (data) => {

    return privateAxios.post("admin/best-practices/create_or_update", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    }).then((response) => response.data)
}




// export const createOrUpdateProposalApi = (data) => {
//     return privateAxios.post("admin/proposals/create_or_update_proposal", data, {
//         headers: {
//             "Content-Type": "multipart/form-data",
//         },
//     });
// };


export const getExcelExportThemeList = () => {
    return privateAxios.get("admin/masters/theme/excel-export-datatable").then((response) => response.data)
}


export const getExcelExportBestPracticeList=()=>{
    return privateAxios.get("admin/best-practices/excel-export-datatable").then((response)=>response.data)
}
