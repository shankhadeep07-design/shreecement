import { myAxios, privateAxios } from "./Helper";

//Yearly Wise Education Route Start

export const getAllAnganwadiList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/anganwadi/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createAnganwadi = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/anganwadi/create", updateData)
    .then((response) => response.data);
};

export const getAllASLCList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/aslc/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createASLC = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/aslc/create", updateData)
    .then((response) => response.data);
};

export const getAllECenterList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/e-center/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createECenter = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/e-center/create", updateData)
    .then((response) => response.data);
};

export const getAllGovtSSList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/govt-ss/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createGovtSS = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/govt-ss/create", updateData)
    .then((response) => response.data);
};

export const getAllKidsmartList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/kidsmart/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createKidsmart = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/kidsmart/create", updateData)
    .then((response) => response.data);
};

export const getAllNavodayaList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/navodaya/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createNavodaya = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/navodaya/create", updateData)
    .then((response) => response.data);
};

export const getAllPratibhaList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/pratibha/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createPratibha = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/pratibha/create", updateData)
    .then((response) => response.data);
};

export const getAllSchoolBusList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/school-bus/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createSchoolBus = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/school-bus/create", updateData)
    .then((response) => response.data);
};

export const getAllVillageLibraryList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/village-library/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createVillageLibrary = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/village-library/create", updateData)
    .then((response) => response.data);
};

export const getAllVillageResourceCenterList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/village-resource-center/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createVillageResourceCenter = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/village-resource-center/create", updateData)
    .then((response) => response.data);
};

export const getAllNavigatorGooruList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/navigator-gooru/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createNavigatorGooru = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/navigator-gooru/create", updateData)
    .then((response) => response.data);
};

export const getAllCodingClassList = (ListData) => {
  return privateAxios
    .post("admin/education/yearly/coding-class/initiated-datatable", ListData)
    .then((response) => response.data);
};

export const createCodingClass = (updateData) => {
  return privateAxios
    .post("admin/education/yearly/coding-class/create", updateData)
    .then((response) => response.data);
};

//Yearly Wise Education Route End

//Daily Wise Education Route Start

export const getAllDailyASLCList = (id, ListData) => {
  return privateAxios
    .post(`admin/education/daily/aslc/list/${id}`, ListData)
    .then((response) => response.data);
};
// export const getAllDailyASLCList = (ListData) => {
//   return privateAxios
//     .post("admin/education/daily/aslc/initiated-datatable", ListData)
//     .then((response) => response.data);
// };

export const createDailyASLC = (updateData) => {
  return privateAxios
    .post("admin/education/daily/aslc/create", updateData)
    .then((response) => response.data);
};

export const getAllDailyECenterList = (id, ListData) => {
  return privateAxios
    .post(`admin/education/daily/e-center/list/${id}`, ListData)
    .then((response) => response.data);
};

// export const getAllDailyECenterList = (ListData) => {
//   return privateAxios
//     .post("admin/education/daily/e-center/initiated-datatable", ListData)
//     .then((response) => response.data);
// };

export const createDailyECenter = (updateData) => {
  return privateAxios
    .post("admin/education/daily/e-center/create", updateData)
    .then((response) => response.data);
};

export const getAllDailyNavodayaList = (id, ListData) => {
  return privateAxios
    .post(`admin/education/daily/navodaya/list/${id}`, ListData)
    .then((response) => response.data);
};
// export const getAllDailyNavodayaList = (ListData) => {
//   return privateAxios
//     .post("admin/education/daily/navodaya/initiated-datatable", ListData)
//     .then((response) => response.data);
// };

export const createDailyNavodaya = (updateData) => {
  return privateAxios
    .post("admin/education/daily/navodaya/create", updateData)
    .then((response) => response.data);
};

export const getAllDailyPratibhaList = (id, ListData) => {
  return privateAxios
    .post(`admin/education/daily/pratibha/list/${id}`, ListData)
    .then((response) => response.data);
};

export const createDailyPratibha = (updateData) => {
  return privateAxios
    .post("admin/education/daily/pratibha/create", updateData)
    .then((response) => response.data);
};

//Daily Wise Education Route End


// Excel Export Datatable
export const getDailyASLCListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/daily-aslc-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getDailyECenterListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/daily-ecenter-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getDailyNavodayaListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/daily-navodaya-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getDailyPratibhaListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/daily-pratibha-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getYearlyAnganwadiListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/yearly-anganwadi-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getYearlyASLCListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/yearly-aslc-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getYearlyECenterListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/yearly-ecenter-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getYearlyGovtSSListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/yearly-govt-ss-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getYearlyKidsmartDatatable = () => {
  return privateAxios
      .get(`admin/education/yearly-kidsmart/datatable/`)
      .then((response) => response.data);
  };
export const getYearlyVillageLibraryListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/yearly-village-library/datatable/`,data)
      .then((response) => response.data);
  };
export const getYearlyNavigatorGooruListDatatable = () => {
  return privateAxios
      .get(`admin/education/yearly-navigator-gooru/datatable/`)
      .then((response) => response.data);
  };
export const getYearlyNavodayaListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/yearly-navodaya-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getYearlyPratibhaListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/yearly-pratibha-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getYearlySchoolBusListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/yearly-school-bus-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getYearlyVillageResourceCenterListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/yearly-village-resource-center-list/datatable/`,data)
      .then((response) => response.data);
  };
export const getYearlyCodingClassListDatatable = (data) => {
  return privateAxios
      .post(`admin/education/yearly-coding-class-list/datatable/`,data)
      .then((response) => response.data);
  };