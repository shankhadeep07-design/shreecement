import { privateAxios } from "./Helper";

export const getIssuesList = (data) => {
    return privateAxios.get('admin/issue-management/list').then((response)=> response.data);
}

export const changeIssueStatus = (data) => {
    return privateAxios
      .post(`admin/issue-management/changestat/`, data)
      .then((response) => response.data);
  };

  export const addIssueService = (data) => {
    return privateAxios
      .post(`admin/issue-management/addissue/`, data)
      .then((response) => response.data);
  }

  export const updateIssueService = (data) => {
    const apidata = {
      update_ti_id: data.update_ti_id,
      update_ti_unit: data.update_ti_unit?.value,
      update_ti_village: data.update_ti_village?.value,
      update_ti_plot: data.update_ti_plot?.value,
      update_ti_title: data?.update_ti_title,
      update_ti_description: data?.update_ti_description
    }
    return privateAxios
    .post(`admin/issue-management/updateissue/`, apidata)
    .then((response) => response.data);
  }

  export const deleteIssueService = (id) => {
    return privateAxios
      .get(`admin/issue-management/deleteissue/${id}`)
      .then((response)=> response.data);
  }