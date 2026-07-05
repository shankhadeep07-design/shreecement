import { privateAxios } from "./Helper";


export const getAllTalukaApi = (data) => {
    return privateAxios.get('admin/master/taluka_list',data).then((response) =>response.data);
}

export const getAllTalukaByStateAndDistrict = (state_id,district_id) => {
    return privateAxios.get(`admin/master/taluka_list/${state_id}/${district_id}`).then((response) =>response.data);
}



export const updateTalukaDetailsApi = (data,id) => {
    console.log("updatable data", data)
    return privateAxios.post(`admin/master/taluka/update/${id}`,data).then((response) =>response.data);
}

export const createTalukaApi=(data,id)=>{
    return privateAxios.post("admin/master/taluka/create",data).then((response)=>response.data)
}

export const deleteTalukaApi=(id)=>{
    return privateAxios.delete(`admin/master/taluka/delete/${id}`).then((response)=>response.data)
}

