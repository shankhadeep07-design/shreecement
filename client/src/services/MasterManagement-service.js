import { privateAxios } from "./Helper";

export const getAllFactoryList = () => {
return privateAxios
    .get(`admin/masters-management/factory/all-list`)
    .then((response) => response.data);
};

