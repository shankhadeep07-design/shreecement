import { privateAxios } from "./Helper";

export const fetchBudgetLists = async () => {
    return await privateAxios
    .post(`admin/budget/lists`,)
    .then((response) => response.data);
};

export const createBudget = async (data) => {
    return await privateAxios
    .post(`admin/budget/create`,data)
    .then((response) => response.data);
};



export const fetchBudgetDetailsLists = async (data) => {
    return await privateAxios
    .post("admin/budget/details",data)
    .then((response) => response.data);
};
export const fetchBudgetingDetailsByBudgetId = async (data) => {
    return await privateAxios
    .post("admin/budget/budgeting_details_by_budget_id",data)
    .then((response) => response.data);
};
export const fetchBudgetingAmountByLocationTheme = async (data) => {
    return await privateAxios
    .post("admin/budget/get_budget_amount_by_location_theme",data)
    .then((response) => response.data);
};

export const fetchActualBudgetDetailsLists = async (data) => {
    return await privateAxios
    .post("admin/budget/actual/lists",data)
    .then((response) => response.data);
};

export const createActualBudget = async (data) => {
    return await privateAxios
    .post("admin/budget/actual/create",data)
    .then((response) => response.data);
};

export const fetchBudgetAmendmentDetailsLists = async (data) => {
    return await privateAxios
    .post("admin/budget/amendment-lists",data)
    .then((response) => response.data);
};

export const createBudgetAmendment = async (data) => {
    return await privateAxios
    .post("admin/budget/create_ammendment_budgeting",data)
    .then((response) => response.data);
};

export const fetchNewBudgetAmendment = async (data) => {
    return await privateAxios
    .post("admin/budget/new-amendment-details",data)
    .then((response) => response.data);
};

export const fetchBudgetAmendmentDetails = async (data) => {
    return await privateAxios
    .post("admin/budget/amendment-details",data)
    .then((response) => response.data);
};


// Budget Master List Datatable
export const getBudgetMasterListDatatable = () => {
    return privateAxios
        .get(`admin/budget/list/datatable/`)
        .then((response) => response.data);
    };
export const getBudgetAmendmentListDatatable = () => {
    return privateAxios
        .get(`admin/budget/amendment-list/datatable/`)
        .then((response) => response.data);
};



///----------------------------- Budgeting ----------------------------------

    
export const createBudgeting = async (data) => {
    return await privateAxios
    .post(`admin/budget/create_budgeting`,data)
    .then((response) => response.data);
};

export const budgetingDetailsApi = async (data) => {
    return await privateAxios
    .post(`admin/budget/budgeting_details`,data)
    .then((response) => response.data);
};

export const deleteBudgetingRowApi = async (data) => {
    return await privateAxios
    .post(`admin/budget/delete_budgeting_row`,data)
    .then((response) => response.data);
};

export const sendBudgetingForApprovalApi = async (data) => {
    return await privateAxios
    .post(`admin/budget/send_budgeting_for_approval`,data)
    .then((response) => response.data);
};

export const getPendingUserApi = async(body) => {
    return await privateAxios.post(`admin/budget/get-pending-user`, body).then((response)=>response.data);
}




///----------------------------- Budgeting End ----------------------------------