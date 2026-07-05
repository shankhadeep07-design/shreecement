import { privateAxios } from "./Helper";

export const getBudgetingAmountFetchByFocusAreaActivityId = (data) => {
    return privateAxios.post('admin/proposals/budgeting_amount_fetch_by_focus_area_activity_id', data).then((response) => response.data);
}

// export const createOrUpdateProposalApi = (data) => {
//     return privateAxios.post(`admin/proposals/create_or_update_proposal`, data).then((response) => response.data)
// }
export const createOrUpdateProposalApi = (data) => {
    return privateAxios.post("admin/proposals/create_or_update_proposal", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};


export const proposalDetailsApi = async (data) => {
    return await privateAxios
        .post(`admin/proposals/proposal_details`, data)
        .then((response) => response.data);
};


export const sendProposalForApprovalApi = async (data) => {
    return await privateAxios
        .post(`admin/proposals/send_proposal_for_approval`, data)
        .then((response) => response.data);
};


export const getExcelExportProposalList = () => {
    return privateAxios.get("admin/proposals/excel-export-datatable").then((response) => response.data)
}