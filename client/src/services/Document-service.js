import { privateAxios } from "./Helper";


export const getAllDocumentsApi = () => {
    return privateAxios.get('admin/document/list').then((response) =>response.data);
}

export const getAllDocTypesApi = () => {
    return privateAxios.get('admin/document/type-list').then((response)=> response.data);
}

export const getSubTypesApi = (type) => {
    return privateAxios.get(`admin/document/subtype-list/${type}`).then((response)=> response.data);
}