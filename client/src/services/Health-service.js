import { myAxios, privateAxios } from "./Helper";
// Health List with projectId api
export const getAllHealthListWithIdApi = (id) => {
    return privateAxios
        .post("admin/master/health/lists/" + id)
        .then((response) => response.data);
};
export const updateHealthYearlyList = (updateData) => {
    return privateAxios
        .post("admin/health/yearly/update", updateData)
        .then((response) => response.data);
};

// Health Clinic Start
export const createDailyClinic = (updateData) => {
    return privateAxios
      .post("admin/health/daily/clinic/create", updateData)
      .then((response) => response.data);
  };

  export const getAllDailyClinicList = (id, ListData) => {
    return privateAxios
      .post(`admin/health/daily/clinic/list/${id}`, ListData)
      .then((response) => response.data);
  };

  export const getHealthClinicDailyListDatatable = (data) => {
    return privateAxios
        .post(`admin/health/daily-clinic-list/datatable/`,data)
        .then((response) => response.data);
    };

// Health Clinic End


// Health Nutrition Start
  export const getAllDailyNutritionList = (id, ListData) => {
    return privateAxios
      .post(`admin/health/daily/nutrition/list/${id}`, ListData)
      .then((response) => response.data);
  };

  export const createDailyNutrition = (updateData) => {
    return privateAxios
      .post("admin/health/daily/nutrition/create", updateData)
      .then((response) => response.data);
  };

  export const getHealthNutritionDailyListDatatable = (data) => {
    return privateAxios
        .post(`admin/health/daily-nutrition-list/datatable/`,data)
        .then((response) => response.data);
    };

// Health Nutrition End

// Health Yearly Start
//  excel export Datatable Api
export const getHealthYearlyListDatatable = (id,data) => {
  return privateAxios
      .post(`admin/health/yearly-list/datatable/${id}`,data)
      .then((response) => response.data);
  };

// Health Yearly End


//  Start Best Practice  Education Api

export const updateBestPracticeEducation = (updateData) => {
  return privateAxios
      .post(`admin/best_practice/education/update/`, updateData)
      .then((response) => response.data);
};

export const getAllDetailsBestPracticeEducation = (id, ListData) => {
  return privateAxios
    .post(`admin/best_practice/education/view-details/${id}`, ListData)
    .then((response) => response.data);
};
export const deleteBestPracticeEducation = (id) => {
  return privateAxios
    .delete(`admin/best_practice/education/delete-record/${id}`)
    .then((response) => response.data);
};

//  End  Best Practice  Education Api



//  Start Best Practice  Health Api

export const updateBestPracticeHealth = (updateData) => {
  return privateAxios
      .post(`admin/best_practice/health/update/`, updateData)
      .then((response) => response.data);
};

export const getAllDetailsBestPracticeHealth = (id, ListData) => {
  return privateAxios
    .post(`admin/best_practice/health/view-details/${id}`, ListData)
    .then((response) => response.data);
};
export const deleteBestPracticeHealth = (id) => {
  return privateAxios
    .delete(`admin/best_practice/health/delete-record/${id}`)
    .then((response) => response.data);
};


//  End Best Practice  Health Api


//  Start Best Practice  Empowerment Api

export const updateBestPracticeEmpowerment = (updateData) => {
  return privateAxios
      .post(`admin/best_practice/empowerment/update/`, updateData)
      .then((response) => response.data);
};

export const getAllDetailsBestPracticeEmpowerment = (id, ListData) => {
  return privateAxios
    .post(`admin/best_practice/empowerment/view-details/${id}`, ListData)
    .then((response) => response.data);
};
export const deleteBestPracticeEmpowerment = (id) => {
  return privateAxios
    .delete(`admin/best_practice/empowerment/delete-record/${id}`)
    .then((response) => response.data);
};

//  End Best Practice  Empowerment Api

//  Start Best Practice Community Api

export const updateBestPracticeCommunityDev = (updateData) => {
  return privateAxios
      .post(`admin/best_practice/community_dev/update/`, updateData)
      .then((response) => response.data);
};

export const getAllDetailsBestPracticeCommunityDev = (id, ListData) => {
  return privateAxios
    .post(`admin/best_practice/community_dev/view-details/${id}`, ListData)
    .then((response) => response.data);
};
export const deleteBestPracticeCommunityDev = (id) => {
  return privateAxios
    .delete(`admin/best_practice/community_dev/delete-record/${id}`)
    .then((response) => response.data);
};

//  End Best Practice Community 

//  Start Svp 

export const updateSvp = (updateData) => {
  return privateAxios
      .post(`admin/best_practice/svp/update/`, updateData)
      .then((response) => response.data);
};

export const getAllDetailsSvp = (id, ListData) => {
  return privateAxios
    .post(`admin/best_practice/svp/view-details/${id}`, ListData)
    .then((response) => response.data);
};
export const deleteSvp = (id) => {
  return privateAxios
    .delete(`admin/best_practice/svp/delete-record/${id}`)
    .then((response) => response.data);
};

//  End Svp 



// Start Gallery

export const updateGallery = (updateData) => {
  return privateAxios
      .post(`admin/gallery/update/`, updateData)
      .then((response) => response.data);
};

export const getAllDetailsGallery = (id, ListData) => {
  return privateAxios
    .post(`admin/gallery/view-details/${id}`, ListData)
    .then((response) => response.data);
};

export const deleteGallery = (id) => {
  return privateAxios
    .delete(`admin/gallery/delete-record/${id}`)
    .then((response) => response.data);
};

// End Gallery


// Start Emp Engagement
export const updateEmpEngagement = (updateData) => {
  return privateAxios
      .post(`admin/employee_engagement/update/`, updateData)
      .then((response) => response.data);
};

export const getAllDetailsEmpEngagement = (id, ListData) => {
  return privateAxios
    .post(`admin/employee_engagement/view-details/${id}`, ListData)
    .then((response) => response.data);
};

export const deleteEmpEngagement = (id) => {
  return privateAxios
    .delete(`admin/employee_engagement/delete-record/${id}`)
    .then((response) => response.data);
};





