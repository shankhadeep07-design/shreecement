import { myAxios, privateAxios } from "./Helper";


//  Start New Best Practice  Education Api

export const updateNewBestPracticeEducation = (updateData) => {
  return privateAxios
      .post(`admin/new_best_practice/education/update/`, updateData)
      .then((response) => response.data);
};

export const getAllDetailsNewBestPracticeEducation = (id, ListData) => {
  return privateAxios
    .post(`admin/new_best_practice/education/view-details/${id}`, ListData)
    .then((response) => response.data);
};
export const deleteNewBestPracticeEducation = (id) => {
  return privateAxios
    .delete(`admin/new_best_practice/education/delete-record/${id}`)
    .then((response) => response.data);
};

//  End  New Best Practice  Education Api


//  Start New Best Practice  Health Api

export const updateNewBestPracticeHealth = (updateData) => {
  return privateAxios
      .post(`admin/new_best_practice/health/update/`, updateData)
      .then((response) => response.data);
};

export const getAllDetailsNewBestPracticeHealth = (id, ListData) => {
  return privateAxios
    .post(`admin/new_best_practice/health/view-details/${id}`, ListData)
    .then((response) => response.data);
};
export const deleteNewBestPracticeHealth = (id) => {
  return privateAxios
    .delete(`admin/new_best_practice/health/delete-record/${id}`)
    .then((response) => response.data);
};
//  Start New Best Practice  Health Api


//  Start New Best Practice  Empowerment Api

export const updateNewBestPracticeEmpowerment = (updateData) => {
  return privateAxios
      .post(`admin/new_best_practice/empowerment/update/`, updateData)
      .then((response) => response.data);
};

export const getAllDetailsNewBestPracticeEmpowerment = (id, ListData) => {
  return privateAxios
    .post(`admin/new_best_practice/empowerment/view-details/${id}`, ListData)
    .then((response) => response.data);
};
export const deleteNewBestPracticeEmpowerment = (id) => {
  return privateAxios
    .delete(`admin/new_best_practice/empowerment/delete-record/${id}`)
    .then((response) => response.data);
};
//  Start New Best Practice  Empowerment Api


//  Start New Best Practice  Community Dev

export const updateNewBestPracticeCommDev = (updateData) => {
  return privateAxios
      .post(`admin/new_best_practice/community_dev/update/`, updateData)
      .then((response) => response.data);
};

export const getAllDetailsNewBestPracticeCommDev = (id, ListData) => {
  return privateAxios
    .post(`admin/new_best_practice/community_dev/view-details/${id}`, ListData)
    .then((response) => response.data);
};
export const deleteNewBestPracticeCommDev = (id) => {
  return privateAxios
    .delete(`admin/new_best_practice/community_dev/delete-record/${id}`)
    .then((response) => response.data);
};
//  End New Best Practice  Community Dev