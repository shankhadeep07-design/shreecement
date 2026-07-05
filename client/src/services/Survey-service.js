import { privateAxios } from "./Helper";

export const assignSurveyer=(data)=>{
    return privateAxios.post(`admin/survey/assignsurveyer`,data).then(response=>response.data)
}
export const getSurveyerAllList=()=>{
    return privateAxios.get(`admin/survey/getsurveyer`).then(response=>response.data)
}
export const getPendingSurvey = () => {
  return privateAxios
    .get(`admin/survey/getsurveyer/pending`)
    .then((response) => response.data);
};
export const surveyerDelete=(id)=>{
    return privateAxios.delete(`admin/survey/removesurveyer/${id}`).then(response=>response.data)
}
export const surveyerUpdate=(id)=>{
    return privateAxios.post(`admin/survey/updatesurveyer/${id}`).then(response=>response.data)
}
export const assignedUserUpdate = (id,data) =>{
    return privateAxios.post(`admin/survey/updateSurveyor/${id}`,data).then((response) => response.data);
}
export const viewSurveyDetails = (id,plot_id) => {
  return privateAxios
    .get(`admin/survey/list/${id}/${plot_id}`)
    .then((response) => response.data);
};
export const updateSurveyStatus = (id,body) => {
  return privateAxios
    .post(`admin/survey/updatesurveystatus/${id}`, body)
    .then((response) => response.data);
};