import { myAxios, privateAxios } from "./Helper";

export const ngoProfileCreateApi = (data) => {
    return privateAxios.post('admin/ngo-profile/create', data).then((response)=> response.data);
}

export const fetchNgoProifleDetailsApi = (data) => {
    return privateAxios.post('admin/ngo-profile/ngo_details', data).then((response)=> response.data);
}