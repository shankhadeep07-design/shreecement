import { privateAxios } from "./Helper";

export const getProjectList = (data) => {
  return privateAxios
    .post("admin/project-management/list", data)
    .then((response) => response.data);
};
export const createProject = (data) => {
  return privateAxios
    .post("admin/projects/upsert", data)
    .then((response) => response.data);
};

export const submitProjectService = (data) => {
  return privateAxios
    .post("admin/project-management/submit", data)
    .then((response) => response.data);
};

// ----------------------- Project payments -----------------------
export const projectPaymentApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/milestone-payment`, data)
    .then((response) => response.data);
};
export const projectPaymentsListApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/milestone-payment-list`, data)
    .then((response) => response.data);
};

export const projectPaymentDeleteApi = async (id) => {
  return await privateAxios
    .delete(`admin/projects/milestone-payment-delete/${id}`)
    .then((response) => response.data);
};

export const projectPaymentStatusUpdateApi = async (id) => {
  return await privateAxios
    .post(`admin/projects/milestone-payment-status-update/${id}`)
    .then((response) => response.data);
};
// ----------------------- Project payments End-----------------------

// ----------------------- Project Task/Timeline --------------------------
export const projectTaskSubTaskListApi = async (id) => {
  return await privateAxios
    .get(`admin/projects/project_task_sub_task_list/${id}`)
    .then((response) => response.data);
};
export const projectTaskSubTaskCreateUpdatetApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/project_task_sub_task_create_update`, data)
    .then((response) => response.data);
};
export const projectTaskSubTaskOrderChangedtApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/project_task_sub_task_order_changed`, data)
    .then((response) => response.data);
};

export const projectParentTaskStartApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/project_parent_task_start`, data)
    .then((response) => response.data);
};

export const projectParentTaskEndApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/project_parent_task_end`, data)
    .then((response) => response.data);
};

export const projectChildTaskStartApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/project_child_task_start`, data)
    .then((response) => response.data);
};

export const projectActivitySubmitApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/project_activity_submit`, data)
    .then((response) => response.data);
};

export const projectActivityListApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/project_activity_list`, data)
    .then((response) => response.data);
};
// ----------------------- Project Task/Timeline End-----------------------

export const projectDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/project_details`, data)
    .then((response) => response.data);
};

// Project Monitoring
export const projectMonitoringCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/monitoring/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};

export const projectMonitoringDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/monitoring/details`, data)
    .then((response) => response.data);
};

// Project Closure
export const projectClosureCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/closure/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};

export const projectClosureAllDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/all-closure/details`, data)
    .then((response) => response.data);
};
export const getProjectClosureDetailsApi = async (body) => {
    return await privateAxios.post(`admin/projects/closure/details`, body).then((response) => response.data);
};

export const projectClosureDetailsApi = getProjectClosureDetailsApi;

export const sendProjectClosureForApprovalApi = async (body) => {
    return await privateAxios.post(`admin/projects/closure/send-for-approval`, body).then((response) => response.data);
};

export const getProjectClosurePendingUserApi = async (body) => {
    return await privateAxios.post(`admin/projects/closure/get-pending-user`, body).then((response) => response.data);
};

export const approveProjectClosureNotificationApi = async (body) => {
    return await privateAxios.post(`admin/notification/submit-project-closure-notification`, body).then((response) => response.data);
};

// Project Impact Assessment

export const projectImpactAssessmentCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/impact-assessment/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};

export const projectImpactAssessmentDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/impact-assessment/details`, data)
    .then((response) => response.data);
};

// Project Po Upload
export const projectPoUploadCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/po-upload/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};

export const projectPoUploadDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/po-upload/details`, data)
    .then((response) => response.data);
};

// ----------------------- Project MOU Upload Start-----------------------
export const projectMouUploadCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/mou-upload/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};

export const projectMouUploadDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/mou-upload/details`, data)
    .then((response) => response.data);
};
// ----------------------- Project MOU Upload End-----------------------

// ----------------------- Project Beneficiary Start-----------------------
export const projectBeneficiaryCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/beneficiary/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};

export const projectBeneficiaryAllListApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/beneficiary/all-list`, data)
    .then((response) => response.data);
};
// ----------------------- Project Beneficiary End-----------------------

export const projectPaymentCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/payment/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};
export const projectPaymentDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/payment/details`, data)
    .then((response) => response.data);
};

export const targetBeneficiariesApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/target_beneficiaries`, data)
    .then((response) => response.data);
};

export const getAllProjectApi = () => {
  return privateAxios
    .get("admin/projects/all-list")
    .then((response) => response.data);
};

export const projectDeviationCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/deviation/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};

export const projectDeviationDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/deviation/details`, data)
    .then((response) => response.data);
};
export const projectPaymentTermsCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/payment-terms/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};
export const projectPaymentTermsDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/payment-terms/details`, data)
    .then((response) => response.data);
};

export const projectFinancialReportCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/financial-report/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};
export const projectFinancialReportDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/financial-report/details`, data)
    .then((response) => response.data);
};

export const projectAnnualReportCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/annual-report/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};
export const projectAnnualReportDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/annual-report/details`, data)
    .then((response) => response.data);
};

export const projectCollateralCreateUpdateApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/collateral/createUpdate`, data, {
      headers: { "Content-Type": "multipart/form-data" }, // important
    })
    .then((response) => response.data);
};
export const projectCollateralDetailsApi = async (data) => {
  return await privateAxios
    .post(`admin/projects/collateral/details`, data)
    .then((response) => response.data);
};
export const deleteDocumentApi = async (data) => {
    return await privateAxios
        .post(`admin/proposals/delete`, data)
        .then((response) => response.data);
};