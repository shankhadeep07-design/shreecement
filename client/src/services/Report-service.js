import { privateAxios } from "./Helper";

export const getReportFromPLotIdApi =async (data) => {
    return privateAxios.post(`admin/reports/plots/`, data).then((response) => response.data);
}   








//////////////////////payment Report///////////////////////////////////////////////

export const getPlotPaymentReportApi=async()=>{
    return privateAxios.post(`admin/reports/payment-reports`).then((response)=>response.data)
}

export const  serverSideSearchPaymentReport=async(word,limit,offset)=>{
    return privateAxios.get(`admin/reports/payment-report/search?word=${word}&limit=${limit}&offset=${offset}`).then((response)=>response.data)
}

export const  filterPaymentReportByStateId=async(stateid,limit,offset)=>{
    return privateAxios.get(`admin/reports/payment-report/search?stateid=${stateid}&limit=${limit}&offset=${offset}`).then((response)=>response.data)
}
export const  filterPaymentReportByPaymentMode=async(mode)=>{
    return privateAxios.get(`admin/reports/payment-report/search?mode=${mode}`).then((response)=>response.data)
}
export const  filterPaymentReportByPaymentType=async(type)=>{
    return privateAxios.get(`admin/reports/payment-report/search?type=${type}`).then((response)=>response.data)
}
export const  filterPaymentReportByChequeDateRange=async(start,end)=>{
    return privateAxios.get(`admin/reports/payment-report/search?start=${start}&&end=${end}`).then((response)=>response.data)
}
export const  filterPaymentReportWithColumnNameAndValue=async(column,value)=>{
    return privateAxios.get(`admin/reports/payment-report/search?column=${column}&value=${value}`).then((response)=>response.data)
}

export const  filterPaymentReportWithColumnLocationAndQuery=async(location,query)=>{
    return privateAxios.get(`admin/reports/payment-report/search?location=${location}&query=${query}`).then((response)=>response.data)
}

//////////////////////////owners Report////////////////////

export const getOwnersReport=async()=>{
    return privateAxios.get(`admin/reports/owner-report`).then((response)=>response.data)
}  

export const  serverSideSearchOwnerReport=async(word,limit,offset)=>{
    return privateAxios.get(`admin/reports/owner-report/search?word=${word}&limit=${limit}&offset=${offset}`).then((response)=>response.data)
}

export const  filterOwnerReportByLocationAndQuery=async(location,query)=>{
    return privateAxios.get(`admin/reports/owner-report/search?location=${location}&query=${query}`).then((response)=>response.data)
}