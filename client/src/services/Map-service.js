import { privateAxios } from "./Helper";


export const stateMapList = () => {
return privateAxios
    .get(`map/state-list`)
    .then((response) => response.data);
};

export const districtListApi = (state_id) => {
return privateAxios
    .post(`map/district-list`,state_id)
    .then((response) => response.data);
};

export const districtMapDetails = (data) => {
return privateAxios
    .post(`map/district-map-details`,data)
    .then((response) => response.data);
};



export const singleDistrictMap = (district_id) => {
    return privateAxios
    .get(`map/single-district-map/${district_id}`)
    .then((response) => response.data);
};

export const blockMapList = (district_id) => {
return privateAxios
    .post(`map/block-list`,district_id)
    .then((response) => response.data);
};

export const blockMapDetailsApi = (district_id) => {
return privateAxios
    .post(`map/block-map-details`,district_id)
    .then((response) => response.data);
};

export const villageMapListApi = (data) => {
return privateAxios
    .post(`map/village-list`,data)
    .then((response) => response.data);
};

export const getVillageDetailsForMapByBlock = (district_id) => {
return privateAxios
    .post(`map/village_details_for_map_by_block`,district_id)
    .then((response) => response.data);
};

export const map_fetch_popover_details_api = (data) => {
return privateAxios
    .post(`map/map_fetch_popover`,data)
    .then((response) => response.data);
};


