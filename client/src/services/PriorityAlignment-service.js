import { privateAxios } from "./Helper";

// ScheduleSeven Function Start--------------------------------------------------------------------------------------------
export const getAllScheduleSevenApi = () => {
  return privateAxios
    .get("admin/priority-alignment/schedule-seven-master-list/all-list")
    .then((response) => response.data);
};

export const updateScheduleSevenDetailsApi = (data, id) => {
  return privateAxios
    .post(
      `admin/priority-alignment/schedule-seven-master-list/update/${id}`,
      data,
    )
    .then((response) => response.data);
};

export const createScheduleSevenApi = (data) => {
  return privateAxios
    .post("admin/priority-alignment/schedule-seven-master-list/create", data)
    .then((response) => response.data);
};
export const getExcelExportScheduleSevenList = () => {
  return privateAxios
    .get(
      "admin/priority-alignment/schedule-seven-master-list/excel-export-datatable",
    )
    .then((response) => response.data);
};

export const deleteScheduleSevenApi = (id) => {
  return privateAxios
    .delete(`admin/master/schedule-seven-master-list/delete/${id}`)
    .then((response) => response.data);
};

// ScheduleSeven Function End--------------------------------------------------------------------------------------------
export const getAllSubScheduleSevenApi = (schedule_id) => {
  return privateAxios
    .post(
      "admin/priority-alignment/sub-schedule-seven-master-list/all-list",
      schedule_id,
    )
    .then((response) => response.data);
};
export const getSubActivityByActivityId = (activity_id) => {
  return privateAxios
    .get(
      "admin/priority-alignment/sub-activity-master-list/sub_activity_by_activity_id",
      activity_id,
    )
    .then((response) => response.data);
};

export const updateSubScheduleSevenDetailsApi = (data, id) => {
  return privateAxios
    .post(
      `admin/priority-alignment/sub-schedule-seven-master-list/update/${id}`,
      data,
    )
    .then((response) => response.data);
};

export const createSubScheduleSevenApi = (data) => {
  return privateAxios
    .post(
      "admin/priority-alignment/sub-schedule-seven-master-list/create",
      data,
    )
    .then((response) => response.data);
};
export const getExcelExportSubScheduleSevenList = () => {
  return privateAxios
    .get(
      "admin/priority-alignment/sub-schedule-seven-master-list/excel-export-datatable",
    )
    .then((response) => response.data);
};

export const getSubScheduleSevenByScheduleSeven = (id) => {
  return privateAxios
    .get(
      `admin/priority-alignment/sub-schedule-seven-master-list/focus_area_by_schedule_seven_id/${id}`,
    )
    .then((response) => response.data);
};

// Focus Area Function Start--------------------------------------------------------------------------------------------

export const getAllFocusAreaApi = () => {
  return privateAxios
    .get("admin/priority-alignment/focus-area-master-list/all-list")
    .then((response) => response.data);
};

export const updateFocusAreaDetailsApi = (data, id) => {
  return privateAxios
    .post(`admin/priority-alignment/focus-area-master-list/update/${id}`, data)
    .then((response) => response.data);
};

export const createFocusAreaApi = (data) => {
  return privateAxios
    .post("admin/priority-alignment/focus-area-master-list/create", data)
    .then((response) => response.data);
};
export const getExcelExportFocusAreaList = () => {
  return privateAxios
    .get(
      "admin/priority-alignment/focus-area-master-list/excel-export-datatable",
    )
    .then((response) => response.data);
};

export const getFocusAreaByScheduleSeven = (id) => {
  return privateAxios
    .get(
      `admin/priority-alignment/focus-area-master-list/focus_area_by_schedule_seven_id/${id}`,
    )
    .then((response) => response.data);
};

export const getNationalIndicatorBySdg = (id) => {
  return privateAxios
    .get(
      `admin/priority-alignment/sdg-master-list/national_indicator_by_sdg/${id}`,
    )
    .then((response) => response.data);
};

// Focus Area Function End--------------------------------------------------------------------------------------------

// Activity Area Function Start--------------------------------------------------------------------------------------------

// export const getAllActivityApi = () => {
//     return privateAxios.get('admin/priority-alignment/activity-master-list/all-list').then((response) =>response.data);
// }

export const updateActivityDetailsApi = (data, id) => {
  return privateAxios
    .post(`admin/priority-alignment/activity-master-list/update/${id}`, data)
    .then((response) => response.data);
};

export const createActivityApi = (data) => {
  return privateAxios
    .post("admin/priority-alignment/activity-master-list/create", data)
    .then((response) => response.data);
};
export const getExcelExportActivityList = () => {
  return privateAxios
    .get("admin/priority-alignment/activity-master-list/excel-export-datatable")
    .then((response) => response.data);
};

export const getActivityByFocusAreaId = (id) => {
  return privateAxios
    .get(
      `admin/priority-alignment/activity-master-list/activity_by_focus_area_id/${id}`,
    )
    .then((response) => response.data);
};

// Activity Area Function End--------------------------------------------------------------------------------------------

// Sub Activity Function Start--------------------------------------------------------------------------------------------

// export const getAllActivityApi = () => {
//     return privateAxios.get('admin/priority-alignment/activity-master-list/all-list').then((response) =>response.data);
// }

export const updateSubActivityDetailsApi = (data, id) => {
  return privateAxios
    .post(
      `admin/priority-alignment/sub-activity-master-list/update/${id}`,
      data,
    )
    .then((response) => response.data);
};

export const createSubActivityApi = (data) => {
  return privateAxios
    .post("admin/priority-alignment/sub-activity-master-list/create", data)
    .then((response) => response.data);
};
export const getExcelExportSubActivityList = () => {
  return privateAxios
    .get(
      "admin/priority-alignment/sub-activity-master-list/excel-export-datatable",
    )
    .then((response) => response.data);
};

export const getSubActivityByFocusAreaId = (id) => {
  return privateAxios
    .get(
      `admin/priority-alignment/sub-activity-master-list/sub_activity_by_activity_id/${id}`,
    )
    .then((response) => response.data);
};

export const getAllSubActivityApi = () => {
  return privateAxios
    .get("admin/priority-alignment/sub-activity-master-list/all-list")
    .then((response) => response.data);
};

// export const getSubActivityByFocusAreaId = (id) => {
//     return privateAxios.get(`admin/priority-alignment/sub-activity-master-list/sub-activity_by_focus_area_id/${id}`).then((response) => response.data);
// }

// Sub Activity Function End--------------------------------------------------------------------------------------------

// Sdg Function Start--------------------------------------------------------------------------------------------

export const getAllSdgApi = () => {
  return privateAxios
    .get("admin/priority-alignment/sdg-master-list/all-list")
    .then((response) => response.data);
};

export const getAllThemeApi = () => {
  return privateAxios
    .get("admin/priority-alignment/theme-master-list/all-list")
    .then((response) => response.data);
};
export const getScheduleSevenByThemeIdApi = (theme_id) => {
  return privateAxios
    .get(`admin/priority-alignment/schedule-seven/${theme_id}`)
    .then((response) => response.data);
};

export const getSubScheduleSevenByScheduleSevenIdApi = (schedule_id) => {
  return privateAxios
    .get(`admin/priority-alignment/sub-schedule-by-schedule/${schedule_id}`)
    .then((response) => response.data);
};

export const updateSdgApi = (data, id) => {
  return privateAxios
    .post(`admin/priority-alignment/sdg-master-list/update/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data);
};

export const createSdgApi = (data) => {
  return privateAxios
    .post("admin/priority-alignment/sdg-master-list/create", data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((response) => response.data);
};
export const getExcelExportSdgList = () => {
  return privateAxios
    .get("admin/priority-alignment/sdg-master-list/excel-export-datatable")
    .then((response) => response.data);
};

// Sdg Function End--------------------------------------------------------------------------------------------
