import { privateAxios } from "./Helper";

// export const updateStateDetailsApi = (data,id) => {
//     return privateAxios.post(`admin/masters/state/update/${id}`,data).then((response) =>response.data);
// }


export const createEventApi=(data)=>{
    return privateAxios.post("admin/events/create",data).then((response)=>response.data)
}
export const updateEventApi=(data,id)=>{
    return privateAxios.post(`admin/events/update/${id}`,data).then((response)=>response.data)
}

export const fetchEventDetailsApi=(id)=>{
    return privateAxios.post(`admin/events/details/${id}`).then((response)=>response.data)
}

export const publishEventApi=(data)=>{
    return privateAxios.post(`admin/events/publish_event`,data).then((response)=>response.data)
}

export const joinNewVolunteerInEventApi=(data)=>{
    return privateAxios.post(`admin/events/join_new_volunteer_in_event`,data).then((response)=>response.data)
}
export const copyEventApi=(data)=>{
    return privateAxios.post(`admin/events/copy_event`,data).then((response)=>response.data)
}
export const excelUploadUserEventNotificationSendApi=(data)=>{
    return privateAxios.post(`admin/events/excel_upload_user_event_notification_send`,data).then((response)=>response.data)
}

export const eventAcceptRejectStatusApi=(data)=>{
    return privateAxios.post(`admin/events/event_accept_reject`,data).then((response)=>response.data)
}

export const event_review_form_listApi=(data)=>{
    return privateAxios.post(`admin/events/event_review_form_list`,data).then((response)=>response.data)
}

export const event_review_form_submitApi=(data)=>{
    return privateAxios.post(`admin/events/event_review_form_submit`,data).then((response)=>response.data)
}

export const event_review_form_excel_uploadApi=(data)=>{
    return privateAxios.post(`admin/events/event_review_form_excel_upload`,data).then((response)=>response.data)
}

export const event_review_form_approveApi=(data)=>{
    return privateAxios.post(`admin/events/event_review_form_approve`,data).then((response)=>response.data)
}

export const event_certificate_sendApi=(data)=>{
    return privateAxios.post(`admin/events/event_certificate_send`,data).then((response)=>response.data)
}


// =======================================Event not csr Start===============================

export const createNotCsrEventApi=(data)=>{
    return privateAxios.post("admin/events/not_csr/create",data).then((response)=>response.data)
}
export const updateNotCsrEventApi=(data,id)=>{
    return privateAxios.post(`admin/events/not_csr/update/${id}`,data).then((response)=>response.data)
}

export const fetchNotCsrEventDetailsApi=(id)=>{
    return privateAxios.post(`admin/events/not_csr/details/${id}`).then((response)=>response.data)
}
// =======================================Event not csr End===============================