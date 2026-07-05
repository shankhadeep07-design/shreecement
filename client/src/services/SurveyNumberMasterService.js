import { privateAxios } from "./Helper";

export const submitSurveyNumber=(data)=>{
    return privateAxios.post(`admin/master/survey-number/submit`,data).then(response=>response.data)
}

export const deleteSurveyNumber=(id)=>{
    return privateAxios.post(`admin/master/survey-number/delete/${id}`).then(response=>response.data)
}