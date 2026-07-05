import { privateAxios } from "../Services/Helper";

/********** Request Manage Form *******/
export const requestFormManageApi = (formdata) => {
  return privateAxios
    .post(`admin/request/manage`, formdata, {
      headers: {
        // "Content-Type": "application/json",
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding proposal form details:", error);
      throw error; // Rethrow the error so it can be handled by the calling code
    });
};

/********** Request View Form *******/
export const requestFormDetailsApi = (formdata) => {
  return (
    privateAxios
      .post(`admin/request/view`, formdata)
      // .post(`admin/contribution/contribution-form-details/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error("Error fetching contribution form details:", error);
        throw error; // Rethrow the error so it can be handled by the calling code
      })
  );
};
