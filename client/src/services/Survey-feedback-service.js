import { privateAxios } from "./Helper";

// Excel Export Api
export const getAslcFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/aslc/excel-export/list`).then(response=>response.data)
}

// View Page Api
export const getAslcFeedbackList=(id)=>{
    return privateAxios.post(`admin/survey/aslc/list/${id}`).then(response=>response.data)
}

// Excel Export Api
export const getEelcFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/eelc/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getNavodayaFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/navodaya/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getPratibhaFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/pratibha/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getCommunityLibraryFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/community/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getGovtSchoolSupportFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/govt-school/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getHealthClinicFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/health-clinic/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getMMUFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/mmu/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getCommunityToiletFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/community-toilet/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getFloriculterFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/flori/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getVegetableCultivationFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/vegcult/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getNutritionCenterFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/nutricen/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getIslFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/isl/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getWaterAtmFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/rwa/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getHealthCampFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/health-camp/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getGmrvfFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/gmrvf/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getFoggingOperationFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/fogging-operation/excel-export/list`).then(response=>response.data)
}

// Excel Export Api
export const getVtcFeedbackExcelExportList=()=>{
    return privateAxios.post(`admin/survey/vtc/excel-export/list`).then(response=>response.data)
}