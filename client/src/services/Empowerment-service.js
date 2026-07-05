import { myAxios, privateAxios } from "./Helper";
// Empowerment List with projectId api
export const getAllEmpowermentListWithIdApi = (id) => {
    return privateAxios
        .post("admin/master/empowerment/lists/" + id)
        .then((response) => response.data);
};

// Empowerment Update Api
export const updateEmpowermentYearlyList = (updateData) => {
    return privateAxios
        .post("admin/empowerment/yearly/update", updateData)
        .then((response) => response.data);
};
//  excel export Datatable Api yearly
export const getEmpowermentYearlyListDatatable = (id,data) => {
    return privateAxios
        .post(`admin/empowerment/yearly-list/datatable/${id}`,data)
        .then((response) => response.data);
    };

export const getAllEmpowermentMonthlyList = (id, ListData) => {
    return privateAxios
      .post(`admin/empowerment/vtc-monthly/list/${id}`, ListData)
      .then((response) => response.data);
  };

  export const updateEmpowermentVtcMonthlyList = (updateData) => {
    return privateAxios
        .post("admin/empowerment/vtc-monthly/update", updateData)
        .then((response) => response.data);
};

//  excel export Datatable Api VtcMonthly
export const getEmpowermentVtcMonthlyListDatatable = (data) => {
    return privateAxios
        .post(`admin/empowerment/vtc-monthly-list/datatable`,data)
        .then((response) => response.data);
    };


export const getAllEmpowermentVtcSoftSkillMonthlyList = (id, ListData) => {
    return privateAxios
      .post(`admin/empowerment/vtc-monthly-softskill/list/${id}`, ListData)
      .then((response) => response.data);
  };

  export const updateEmpowermentVtcSoftSkillMonthlyList = (updateData) => {
    return privateAxios
        .post("admin/empowerment/vtc-monthly-softskill/update", updateData)
        .then((response) => response.data);
};

//  excel export Datatable Api VtcMonthly
export const getEmpowermentVtcSoftSkillMonthlyListDatatable = (data) => {
    return privateAxios
        .post(`admin/empowerment/vtc-monthly-softskill-list/datatable`,data)
        .then((response) => response.data);
    };