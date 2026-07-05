import { privateAxios } from "./Helper";

export const getAllPermissionApi = (data) => {
  return privateAxios
    .get("admin/permission", data)
    .then((response) => response.data);
};

export const moduleParentPermissionApi = (data) => {
  return privateAxios
      .post(`admin/permission/get_parent_module_permission`, data)
      .then((response) => response.data);
  };
  
  export const modulePermissionApi = (data) => {
  return privateAxios
      .post(`admin/permission/get_my_module_permission`, data)
      .then((response) => response.data);
  };
