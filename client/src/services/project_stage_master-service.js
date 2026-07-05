import { privateAxios } from "./Helper";

// export const createMenu=(data)=>{
//     return privateAxios.post(`admin/module/create/`,data).then((response)=>response.data)
// }

// export const getAllMenuApi = (data) => {
//     return privateAxios.get('admin/module/',data).then((response) =>response.data);
// }

// export const updateMenu=(data,id)=>{
//     return privateAxios.put(`admin/module/update/${id}`,data).then((response)=>response.data)
// }
// export const deleteMenu=(id)=>{
//     return privateAxios.delete(`admin/module/delete/${id}`).then((response)=>response.data)
// }

export const getAllProjectStageMaster = () => {
    return privateAxios.get('admin/master/project-acquisition-stages').then((response)=>response.data);
}

export const getAllUserBasedOnRole = (data) => {
    return privateAxios.post('admin/users/fetch-User-As-Per-Role',data).then((response)=>response.data);
}

export const submitStage = (data) => {
    return privateAxios.post('admin/acquisition/submit-stage',data).then((response)=>response.data)
    .catch((err)=> console.log(err));
}

export const getAcquisitionStages = (pid) => {
    return privateAxios.get(`admin/acquisition/acquisition-list/${pid}`,).then((response)=>response.data)
    .catch((err)=> console.log(err));
}

export const getStageDetails = (sid) => {
    return privateAxios.get(`admin/acquisition/stage-detail/${sid}`,).then((response)=>response.data)
    .catch((err)=> console.log(err));
}

export const submitStartDate = (data) => {
    return privateAxios.post(`admin/acquisition/start-stage`, data).then((response)=>response.data);
}

export const submitEndDate = (data) => {
    return privateAxios.post(`admin/acquisition/end-stage`, data).then((response)=>response.data);
}

export const getPlotDetails = (data) => {
    return privateAxios.post(`admin/acquisition/plot-details`, data).then((response)=>response.data);
}

export const submitCommonActivityApi = (data) => {
    return privateAxios.post(`admin/acquisition/submit-common`, data).then((response)=>response.data);
}

export const getDocumentTypes = () => {
    return privateAxios.get('admin/acquisition/doctypes').then((response)=>response.data);
}

export const submitDocumentsApi = (data) => {
    return privateAxios.post('admin/acquisition/submitdocs', data).then((response)=>response.data);
}

export const getActivityDocumentList = (tcaId) => {
    return privateAxios.get(`admin/acquisition/activity-doc-list/${tcaId}`).then((response)=>response.data);
}

export const deleteActivityDocumentApi = (del_id) => {
    return privateAxios.get(`admin/acquisition/delete-activity-doc/${del_id}`).then((response)=>response.data);
}

export const getProjectOwnersApi = (pid) => {
    return privateAxios.get(`admin/acquisition/projectwise-owners/${pid}`).then((response)=>response.data);
}

export const getPlotsbyOwnerId = (data) => {
    return privateAxios.post(`admin/acquisition/plotsby-ownerid/`, data).then((response)=>response.data);
}

export const submitAtlDataApi = (data) => {
    return privateAxios.post(`admin/acquisition/submit-atl/`, data).then((response)=>response.data);
}

export const getAtlsDetails = (pid) => {
    return privateAxios.get(`admin/acquisition/atl-byprojectid/${pid}`).then((response)=>response.data);
}