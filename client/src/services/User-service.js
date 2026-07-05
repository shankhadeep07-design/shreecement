import { myAxios, privateAxios } from "./Helper";

export const userSingup = (user) => {
  return myAxios.post("register").then((responce) => responce.data);
};

export const userLogin = (loginDetails) => {
  return myAxios
    .post("auth/web/login", loginDetails)
    .then((response) => response.data);
};
export const authEmail = (loginDetails) => {
  return myAxios
    .post("auth/web/email-auth", loginDetails)
    .then((response) => response.data);
};

export const otpCheck = (loginDetails) => {
  return myAxios
    .post("auth/web/otp-check", loginDetails)
    .then((response) => response.data);
}

export const userLoginUsingAzure = (loginDetails) => {
  return myAxios
    .post("auth/login/azure", loginDetails)
    .then((response) => response.data);
};

export const userOtpLogin = (loginDetails) => {
  return myAxios
    .post("otp_verify", loginDetails)
    .then((response) => response.data);
};

export const userUpdate = (updateData) => {
  return privateAxios
    .post("profile_update", updateData)
    .then((response) => response.data);
};

export const forgotPAssword = (updateData) => {

  return myAxios
    .post("forgot_password", updateData)
    .then((response) => response.data);
};

export const confirmUserPAssword = (updateData) => {

  return myAxios
    .post("confirm_password", updateData)
    .then((response) => response.data);
};

export const changeUserPassword = (updateData) => {

  return privateAxios
    .post("change_password", updateData)
    .then((response) => response.data);
};

export const addUserApi = (data) => {
  return privateAxios
    .post(`admin/users/create/`, data)
    .then((response) => response.data);
};

export const updateUser = (data, id) => {
  return privateAxios
    .post(`admin/users/update/${id}`, data)
    .then((response) => response.data);
};

export const deleteUserApi = (id) => {
  return privateAxios
    .post(`admin/users/delete/${id}`)
    .then((response) => response);
};



export const userListRoleIdWiseApi = async (id) => {
  return await privateAxios
    .get(`admin/users/list/role_wise/${id}`)
    .then((response) => response.data);
};


export const getSurveyerUserOnly = () => {
  return privateAxios
    .get(`admin/users/surveyrole`)
    .then((response) => response.data);
};

export const getAllUsersApi = (data) => {
  return privateAxios
    .get("admin/users/list/all", data)
    .then((response) => response.data);
};

export const getAllUserStateDistrictDetailsApi = (id, data) => {
  return privateAxios
    .post(`admin/users/state-district-details/${id}`, data)
    .then((response) => response.data);
};

export const validateProductKey = () => {
  return myAxios
    .post("admin/users/is-validate-product-key")
    .then((response) => response.data);
};

export const azureValidateProductKeyApi = (data) => {
  return myAxios
    .post("auth/azure_token", data)
    .then((response) => response.data);
};

export const azureUserCheckingApi = (data) => {
  return myAxios
    .post("auth/azure_user_checking", data)
    .then((response) => response.data);
};

export const changePasswordApi = async (data) => {
  try {
    const response = await privateAxios.post('admin/users/change_password', data);
    return response.data;
  } catch (error) {
    // Handle the error as needed
    console.error('Error creating user:', error);
    throw error; // Re-throw the error if you want to handle it further up the call chain
  }
};

// Forget Password
// export const sendOtpApi = async ({ email }) => {
//   const response = await myAxios.post("/forgot-password/send-otp", { email });
//   return response.data;
// };
// export const verifyOtpApi = async ({ email, otp, newPassword }) => {
//   const response = await myAxios.post("/forgot-password/verify-otp", { email, otp, newPassword });
//   return response.data;
// };
// export const resetPasswordApi = async (data) => {
//   const response = await myAxios.post("/forgot-password/reset-password", data);
//   return response.data;
// };

export const fetchAllUserList = async () => {
  return await privateAxios
    .post(`admin/users/excel-export-datatable`)
    .then((response) => response.data);
};

export const createUser = async (data) => {
  return await privateAxios
    .post(`admin/users/create`, data)
    .then((response) => response.data);
};

export const getUserDetails = async (id) => {
    try {
        const response = await privateAxios.post(`admin/users/details/${id}`);
        return response.data;
    } catch (error) {
        // Handle the error as needed
        console.error('Error creating user:', error);
        throw error; // Re-throw the error if you want to handle it further up the call chain
    }
};

export const userListRoleSlugWiseApi = async (slug) => {
  return await privateAxios
    .get(`admin/users/role_slug_wise/${slug}`)
    .then((response) => response.data);
};


