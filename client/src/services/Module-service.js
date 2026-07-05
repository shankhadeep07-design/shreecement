import { privateAxios } from "./Helper";

export const createMenu=(data)=>{
    return privateAxios.post(`admin/module/create/`,data).then((response)=>response.data)
}

export const getAllMenuApi = (data) => {
    return privateAxios.get('admin/module/',data).then((response) =>response.data);
}

export const updateMenu=(data,id)=>{
    return privateAxios.put(`admin/module/update/${id}`,data).then((response)=>response.data)
}
export const deleteMenu=(id)=>{
    return privateAxios.delete(`admin/module/delete/${id}`).then((response)=>response.data)
}