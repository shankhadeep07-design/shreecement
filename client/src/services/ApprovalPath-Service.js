import { privateAxios } from "./Helper";


export const submitApprovalPath = (data) => {
    return privateAxios.post('admin/approval-path/submit',data).then((response)=>response.data);
}

export const deleteApprovalPath = (id) => {
    return privateAxios.post(`admin/approval-path/delete/${id}`).then((response)=>response.data);
}

export const getLandMenuApi = () => {
    return privateAxios.get(`admin/approval-path/land-menu`).then((response)=>response.data);
}


export const getAllApprovalMenuApi = () => {
    return privateAxios.post(`admin/approval-path/all_approval_list`).then((response)=>response.data);
}

export const getAllApprovalListDetails = (id) => {
    return privateAxios.post(`admin/approvals/details/${id}`).then((response)=>response.data);
}

