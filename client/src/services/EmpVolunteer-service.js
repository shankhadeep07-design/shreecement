import { privateAxios,myAxios } from "./Helper";

export const updateEmpVolunteerApi = (data,id) => {
    return privateAxios.post(`admin/employee-volunteering/update/${id}`,data).then((response) =>response.data);
}

export const createEmpVolunteerApi=(data)=>{
    return privateAxios.post("admin/employee-volunteering/create",data).then((response)=>response.data)
}


export const createUpdateEmpVolunteerApi=(data)=>{
    return privateAxios.post("admin/employee-volunteering/create_update_user",data).then((response)=>response.data)
}


export const createVolunteerUser = async (data) => {
  return await myAxios
    .post(`auth/web/volunteer_create`, data)
    .then((response) => response.data);
};