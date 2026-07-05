// import { privateAxios } from "./Helper";
import { myAxios, privateAxios } from "./Helper";

export const getLoginLogoutReport = (params) => {
  return privateAxios.get("admin/audit-report/loginlogout", { params });
};

export const exportLoginLogoutReport = (params) => {
  return privateAxios.get("admin/audit-report/loginlogout-excelexport", {
    params: { ...params, format: "excel" }, // 👈 spreads your filters + adds format
    responseType: "blob",
  });
};

export const getMasterReport = (params) => {
  return privateAxios.get("admin/audit-report/master", { params });
};

export const exportMasterReport = (params) => {
  return privateAxios.get("admin/audit-report/master-excelexport", {
    params: { ...params, format: "excel" }, // 👈 spreads your filters + adds format
    responseType: "blob",
  });
};

export const getProposalReport = (params) => {
  return privateAxios.get("admin/audit-report/proposal", { params });
};

export const exportProposalReport = (params) => {
  return privateAxios.get("admin/audit-report/proposal-excelexport", {
    params: { ...params, format: "excel" }, // 👈 spreads your filters + adds format
    responseType: "blob",
  });
};

export const getProjectActivityReport = (params) => {
  return privateAxios.get("admin/audit-report/project-activity", { params });
};

export const exportProjectActivityReport = (params) => {
  return privateAxios.get("admin/audit-report/project-activity-excelexport", {
    params: { ...params, format: "excel" }, // 👈 spreads your filters + adds format
    responseType: "blob",
  });
};

export const getBudgetReport = (params) => {
  return privateAxios.get("admin/audit-report/budget", { params });
};

export const exportBudgetReport = (params) => {
  return privateAxios.get("admin/audit-report/budget-excelexport", {
    params: { ...params, format: "excel" }, // 👈 spreads your filters + adds format
    responseType: "blob",
  });
};

export const getDocumentReport = (params) => {
  return privateAxios.get("admin/audit-report/document", { params });
};

export const exportDocumentReport = (params) => {
  return privateAxios.get("admin/audit-report/document-excelexport", {
    params: { ...params, format: "excel" }, // 👈 spreads your filters + adds format
    responseType: "blob",
  });
};

export const getEventReport = (params) => {
  return privateAxios.get("admin/audit-report/event", { params });
};

export const exportEventReport = (params) => {
  return privateAxios.get("admin/audit-report/event-excelexport", {
    params: { ...params, format: "excel" }, // 👈 spreads your filters + adds format
    responseType: "blob",
  });
};
