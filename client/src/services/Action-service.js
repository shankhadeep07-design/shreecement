import { privateAxios } from "./Helper";


export const createAction = (data) => {
    return privateAxios.post('admin/actions/create',data).then((response)=>response.data);
}

export const deleteAction = (data) => {
    return privateAxios.post('admin/actions/delete',data).then((response)=>response.data);
}
export const allAction = (data) => {
    return privateAxios.get('admin/actions/list').then((response)=>response.data);
}
