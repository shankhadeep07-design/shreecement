import { myAxios, privateAxios, publicAxios } from "./Helper";

// Ngo Register for public
export const fetchAllThemeList = () => {
    return publicAxios.get("theme/all-list").then((response) => response.data)
}

export const getAllEducation = (data) => {
    return publicAxios
        .get(`education/all-list`, data)
        .then((response) => response.data);
};

export const getAllState = (data) => {
    return publicAxios
        .get(`state/all-list`, data)
        .then((response) => response.data);
};

export const fetchAllCategoryList = () => {
    return publicAxios.get("category/all-list").then((response) => response.data)
}

export const ngoCreatePublicApi = (data) => {
    return publicAxios.post('ngo/create', data).then((response)=> response.data);
}


export const ngoExcelDownloadListApi = (data) => {
    return privateAxios.post('admin/ngo/excel-download', data).then((response)=> response.data);
}
export const ngoListApi = (data) => {
    return privateAxios.post('admin/ngo/list', data).then((response)=> response.data);
}

export const ngoDatatableApi = (data) => {
    return privateAxios.post('admin/ngo/datatable', data).then((response)=> response.data);
}

export const ngoCreateApi = (data) => {
    return privateAxios.post('admin/ngo/create', data).then((response)=> response.data);
}

export const fetchNgoListApi = (data) => {
    return privateAxios.get('admin/ngo/all-list', data).then((response)=> response.data);
}

export const fetchNgoDetailsApi = (data) => {
    return privateAxios.post('admin/ngo/ngo_details', data).then((response)=> response.data);
}
export const fetchNgoUserIDApi = (data) => {
    return privateAxios.post('admin/ngo/ngo_userId', data).then((response)=> response.data);
}

export const fetchNgoListByVerticalId = (id) => {
    return privateAxios.post(`admin/ngo/ngo_by_vertical_id/${id}`).then((response)=> response.data);
}



export const createNgoUser = async (data) => {
  return await privateAxios
    .post(`admin/ngo/users/create`, data)
    .then((response) => response.data);
};


//---------------------------------- in ngo project section start ----------------------------

export const fetchNgoOwnersUserListApi = (data) => {
  return privateAxios.post(`admin/ngo/ngo_owners_users_list`, data).then((response) => response.data);
}

export const fetchProjectAssignListApi = (data) => {
  return privateAxios.post(`admin/ngo/project_assign_list`, data).then((response) => response.data);
}

export const projectAssignCreateApi = (data) => {
  return privateAxios.post(`admin/ngo/project_assign_create`, data).then((response) => response.data);
}

//---------------------------------- in ngo project section end ------------------------------


//---------------------------------- in ngo project budget section ---------------------------------

export const ngoProjectActualBudgetListApi = (data) => {
  return privateAxios.post(`admin/ngo/ngo_project_actual_budget_list`, data).then((response) => response.data);
}

export const ngoProjectActualTotalBudgetApi = (data) => {
  return privateAxios.post(`admin/ngo/ngo_project_actual_total_budget`, data).then((response) => response.data);
}

export const ngoProjectActualBudgetCreateApi = (data) => {
  return privateAxios.post(`admin/ngo/ngo_project_actual_budget_create`, data).then((response) => response.data);
}

export const ngoProjectProposalBudgetListApi = (data) => {
  return privateAxios.post(`admin/ngo/ngo_project_proposal_budget_list`, data).then((response) => response.data);
}

export const ngoProjectBudgetCreateApi = (data) => {
  return privateAxios.post(`admin/ngo/ngo_project_budget_create`, data).then((response) => response.data);
}

export const ngoProjectBudgetDetailsApi = (data) => {
  return privateAxios.post(`admin/ngo/ngo_project_budget_details`, data).then((response) => response.data);
}

export const ngoProjectActualAndProposedBudgetDetailsApi = (data) => {
  return privateAxios.post(`admin/ngo/ngo_project_actual_and_proposed_budget_details`, data).then((response) => response.data);
}

export const deleteProposedBudgetRowApi = (data) => privateAxios.post(`admin/ngo/ngo_project_proposal_budget_delete`, data).then((response) => response.data); //deleteProposedBudgetRowApi

//---------------------------------- in ngo project budget section end ------------------------------


// Ngo Register User

export const createNgoRegisterUser = async (data) => {
  return await myAxios
    .post(`auth/web/ngo_register_user_create`, data)
    .then((response) => response.data);
};