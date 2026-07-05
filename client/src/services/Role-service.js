import { privateAxios } from "./Helper";


export const allRoles = async (data) => {
    return await privateAxios
    .get(`admin/role/all`,data)
    .then((response) => response.data);
};



export const rolesList = async (data) => {
    return await privateAxios
    .get(`admin/role/`,data)
    .then((response) => response.data);
};


export const createRole = (data) => {
  return privateAxios
    .post(`admin/role/create/`, data)
    .then((response) => response.data);
};

export const getAllRoleApi = (data) => {
  return privateAxios
    .get("admin/role/", data)
    .then((response) => response.data);
};

export const getAllreadyHasRoleApi = (id) => {
  return privateAxios
    .get(`admin/role/:${id}`)
    .then((response) => response.data);
};

export const updateRole = (data, id) => {
  return privateAxios
    .put(`admin/role/update/${id}`, data)
    .then((response) => response.data);
};

export const deleteRole = (id) => {
  return privateAxios
    .delete(`admin/role/delete/${id}`)
    .then((response) => response.data);
};

export const userHasRole = (id) => {
  return privateAxios
    .post(`admin/role/userrole/${id}`)
    .then((response) => response.data);
};

export const roleHasPermission = (module, data) => {
  return privateAxios
    .get(`admin/role/permissions/${module}`, data)
    .then((response) => response.data);
};







export const createApprovalPath= async (data) => {
    return await privateAxios
    .post(`admin/approvals/create`,data)
    .then((response) => response.data);
};

export const updateApprovalPath= async (id,data) => {
    return await privateAxios
    .put(`admin/approvals/update/${id}`,data)
    .then((response) => response.data);
};


export const updateStatusApprovalPath= async (id,data) => {
    return await privateAxios
    .put(`admin/approvals/status_update/${id}`,data)
    .then((response) => response.data);
};

export const copyApprovalPath= async (id,data) => {
    return await privateAxios
    .put(`admin/approvals/copy_approval/${id}`,data)
    .then((response) => response.data);
};

export const myRoleDetailsApi = async (data) => {
    return await privateAxios
    .post(`admin/role/my-role`,data)
    .then((response) => response.data);
};
