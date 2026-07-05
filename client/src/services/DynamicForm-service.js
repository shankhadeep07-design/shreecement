import { privateAxios } from "../Services/Helper";

export const dynamicFormDetailsApi = (id) => {
  return privateAxios
    .post(`admin/dynamicform/dynamic-form-details/${id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching dynamic form details:", error);
      throw error; // Rethrow the error so it can be handled by the calling code
    });
};

export const dynamicFormAddApi = (formdata) => {
  return privateAxios
    .post(`admin/dynamicform/dynamic-form-add/`, formdata, {
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error adding dynamic form details:", error);
      throw error; // Rethrow the error so it can be handled by the calling code
    });
};

export const dynamicFormEditApi = (form_short_name, form_id, item_id) => {
  return privateAxios
    .post(`admin/dynamicform/dynamic-form-edit/${form_short_name}/${form_id}/${item_id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error edit dynamic form details:", error);
      throw error; // Rethrow the error so it can be handled by the calling code
    });
};

export const dynamicFormEditTabApi = (table_name, column_name, item_id) => {
  return privateAxios
    .post(`admin/dynamicform/dynamic-tab-form-edit/${table_name}/${column_name}/${item_id}`)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error edit dynamic form details:", error);
      throw error; // Rethrow the error so it can be handled by the calling code
    });
};
