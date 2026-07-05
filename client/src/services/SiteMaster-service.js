import { privateAxios } from "./Helper";

export const submitSiteMaster = (data) => {
    return privateAxios.post('admin/site-master/submit', data).then((response)=> response.data);
}

export const deleteSite = (id) => {
    return privateAxios.post(`admin/site-master/delete/${id}`).then((response)=> response.data);
}

