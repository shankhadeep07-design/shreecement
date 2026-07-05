import { privateAxios } from "./Helper";



// ===== CARDS (OVERALL DATA) STARTS =====
export const dashBoardTotalCountPillar = (filters) => {
  let url = "admin/dashboard/get-total-count";
  
  return privateAxios
    .post(url, filters)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching total count of pillar:", error);
      throw error;
    });
};

export const dashBoardBudgetActualData = () => {
  let url = "admin/dashboard/get/budget-actual/chart-data";
  
  return privateAxios
    .post(url)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching total count of pillar:", error);
      throw error;
    });
};

export const dashBoardBudgetExpenseData = () => {
  let url = "admin/dashboard/get/budget-expense/chart-data";
  
  return privateAxios
    .post(url)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching total count of pillar:", error);
      throw error;
    });
};

export const dashBoardPillarData = () => {
  let url = "admin/dashboard/get/pillar-wise/chart-data";
  
  return privateAxios
    .post(url)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching total count of pillar:", error);
      throw error;
    });
};

export const dashBoardActivityData = (queryParams) => {
  let url = `admin/dashboard/get/activity-wise/chart-data?${queryParams}`;
  
  return privateAxios
    .post(url)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching total count of pillar:", error);
      throw error;
    });
};

export const dashBoardPillarDataByID = (selectedId) => {
  let url = `admin/dashboard/get/pillar-wise/chart-data/id`;
  
  return privateAxios
    .post(url, selectedId)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error fetching total count of pillar:", error);
      throw error;
    });
};




export const dashboardDetailsApi = () => {
  return privateAxios
    .post("admin/dashboard/")
    .then((response) => response.data);
};

export const dashboardVillageDetailsApi = (data) => {
  return privateAxios
    .post("admin/dashboard/village_details", data)
    .then((response) => response.data);
};


export const dashboardStateNames = () => {
  return privateAxios
    .get(`admin/dashboard/state_details`)
    .then((response) => response.data);
};

export const dashboardDistrictNAmes = (state_id = null) => {
  if (state_id) {
    return privateAxios
      .get(`admin/dashboard/district_details/${state_id}`)
      .then((response) => response.data);
  } else {
    return privateAxios
      .get(`admin/dashboard/district_details`)
      .then((response) => response.data);
  }
};

export const getDistrictByStateId = (state_id) => {
  return privateAxios
      .get(`admin/dashboard/district_details/${state_id}`)
      .then((response) => response.data);
}


export const dashboardVillageNAmes = (
  state_id = null,
  district_id = null,
  taluka_id = null,
  unit_id = null
) => {

  if (state_id || district_id || taluka_id || unit_id) {
    return privateAxios
      .get(
        `admin/dashboard/village_name_details/${state_id}/${district_id}/${taluka_id}/${unit_id}`
      )
      .then((response) => response.data);
  } else {
    return privateAxios
      .get(`admin/dashboard/village_name_details`)
      .then((response) => response.data);
  }
};


//--------------------------------------------- My Code Start  --------------------------------------------------
export const EducationChildChartApi = (data) => {
  return privateAxios
    .post("admin/dashboard/education-child-dashboard-data",data)
    .then((response) => response.data);
};

export const EducationChildChartDailyApi = (data) => {
  return privateAxios
    .post("admin/dashboard/education-child-dashboard-data-daily",data)
    .then((response) => response.data);
};

export const HealthChildChartApi = (data) => {
  return privateAxios
    .post("admin/dashboard/health-child-dashboard-data",data)
    .then((response) => response.data);
};

export const HealthChildChartDailyApi = (data) => {
  return privateAxios
    .post("admin/dashboard/health-child-dashboard-data-daily",data)
    .then((response) => response.data);
};

export const EmpowermentChildChartApi = (data) => {
  return privateAxios
    .post("admin/dashboard/empowerment-child-dashboard-data",data)
    .then((response) => response.data);
};

export const EmpowermentChildChartDailyApi = (data) => {
  return privateAxios
    .post("admin/dashboard/empowerment-child-dashboard-data-daily",data)
    .then((response) => response.data);
};

export const dashBoardBudgetChartData = (filters) => {
  let url = "admin/dashboard/budget-chart";
  return privateAxios.post(url, filters).then((response) => response.data);
};

export const dashBoardProposalChartData = (filters) => {
  let url = "admin/dashboard/proposal-chart";
  return privateAxios.post(url, filters).then((response) => response.data);
};

export const dashBoardRecentProjects = (filters) => {
  let url = "admin/dashboard/recent-projects";
  return privateAxios.post(url, filters).then((response) => response.data);
};

export const dashBoardMonthWiseData = (filters) => {
  let url = "admin/dashboard/month-wise";
  return privateAxios.post(url, filters).then((response) => response.data);
};

export const dashBoardFactoryProposalData = (filters) => {
  let url = "admin/dashboard/factory-proposals";
  return privateAxios.post(url, filters).then((response) => response.data);
};

export const dashBoardHistoricalData = () => {
  let url = "admin/dashboard/historical-data";
  return privateAxios.get(url).then((response) => response.data);
};

export const dashBoardEventCategoryData = (filters) => {
  let url = "admin/dashboard/event-analytics";
  return privateAxios.post(url, filters).then((response) => response.data);
};

export const dashBoardGalleryChartData = () => {
  let url = "admin/dashboard/gallery-chart";
  return privateAxios.get(url).then((response) => response.data);
};

export const dashBoardCaseStudyChartData = () => {
  let url = "admin/dashboard/case-study-chart";
  return privateAxios.get(url).then((response) => response.data);
};

//--------------------------------------------- My Code End  ----------------------------------------------------
