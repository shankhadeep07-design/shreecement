import { privateAxios } from "./Helper";

// export const getNotificationCount = () => {
//     return privateAxios.get(`admin/notification-management/change-notification-count`).then((response)=> response.data);
// }

// export const getAllNotificationList = () => 
// {
//     return privateAxios.get(`admin/notification-management/get-notification-module-wise`).then((response)=> response.data);
// }


export const getNotificationCount = () => {
    return privateAxios.get(`admin/notification/notification-count`).then((response)=> response.data);
}

export const getAllNotificationListModuleWise = () => 
{
    return privateAxios.get(`admin/notification/get-notification-module-wise`).then((response)=> response.data);
}

export const getNotificationDetailsApi = (data) => {
    return privateAxios.post(`/admin/notification/pending-notification-details`, data).then((response) => response.data);
}

export const getApprovalTrackApi = (data) => {
    return privateAxios.post(`/admin/notification/approval-track`, data).then((response) => response.data);
}

export const approveNotificationApi = (data) => {
    return privateAxios.post(`/admin/notification/submit-notification`, data).then((response) => response.data);
}


export const getAllNotificationListApi = () => 
{
    return privateAxios.get(`admin/notification/notification-lists`).then((response)=> response.data);
}
export const getPendingNotificationDetailsApi = (data) => 
{
    return privateAxios.post(`admin/notification/pending-notification-details`,data).then((response)=> response.data);
}



///  Events Notification

export const sendForApprovalEventsNotificationApi = (data) => {
    return privateAxios.post(`/admin/notification/send-for-approval-events-notification`, data).then((response) => response.data);
}


///  Ngo Notification

export const sendForApprovalNgoNotificationApi = (data) => {
    return privateAxios.post(`/admin/notification/send-for-approval-ngo-notification`, data).then((response) => response.data);
}


// Penfing From Users Evnets Notification

export const getPendingFromUsersEventsNotificationApi = (data) => {
    return privateAxios.post(`/admin/notification/pending-from-users-events-notification`, data).then((response) => response.data);
}

export const approveBudgetNotificationApi = (data) => {
    return privateAxios.post(`/admin/notification/submit-budget-notification`, data).then((response) => response.data);
}

export const approveProjectNotificationApi = (data) => {
    return privateAxios.post(`/admin/notification/submit-project-notification`, data).then((response) => response.data);
}