import { privateAxios } from "./Helper";

export const getAllLandTypes=()=>{
    return privateAxios.get(`admin/module-master/get_land_types`).then((response)=>response.data)
}

export const getAllCasteTypes=()=>{
    return privateAxios.get(`admin/module-master/get_caste_types`).then((response)=>response.data)
}

export const getAllAreaUnitDetails=(data)=>{
    return privateAxios.post(`admin/module-master/get_area_unit_details`, data).then((response)=>response.data)
}

export const getAllBanks = ()=>{
    return privateAxios.get(`admin/module-master/get_bank_details`).then((response)=>response.data)
}

export const getAllOptions = (data)=>{
    return privateAxios.post(`admin/module-master/get-bulk-options`, data).then((response)=>response.data)
}

export const createModule = (data)=>{
    return privateAxios.post(`admin/module-master/create`, data).then((response)=>response.data)
}
export const getModuleById = (data)=>{
    return privateAxios.post(`admin/module-master/get-module-by-id`, data).then((response)=>response.data)
}

export const documentListApi = (data)=> {
    return privateAxios.post(`admin/module-master/document-list`, data).then((response)=>response.data)
}
export const ListApi = (data)=> {
    console.log("data",data)
    return privateAxios.post(`admin/module-master/list`, data).then((response)=>response.data)
}

// Religion module service
export const fetchReligionLists = async () => {
    return await privateAxios
    .post(`admin/module-master/religion/lists`,)
    .then((response) => response.data);
};

export const createReligion = async (data) => {
    return await privateAxios
    .post(`admin/module-master/religion/create`,data)
    .then((response) => response.data);
}

// Bank Account module service
export const fetchBankAccountLists = async () => {
    return await privateAxios
    .post(`admin/module-master/bank-account/lists`,)
    .then((response) => response.data);
};

export const createBankAccount = async (data) => {
    return await privateAxios
    .post(`admin/module-master/bank-account/create`,data)
    .then((response) => response.data);
}

// Insurance Scheme module service
export const fetchInsuranceSchemeLists = async () => {
    return await privateAxios
    .post(`admin/module-master/insurance-scheme/lists`,)
    .then((response) => response.data);
};

export const createInsuranceScheme = async (data) => {
    return await privateAxios
    .post(`admin/module-master/insurance-scheme/create`,data)
    .then((response) => response.data);
}

// Loan module service
export const fetchLoanLists = async () => {
    return await privateAxios
    .post(`admin/module-master/loan/lists`,)
    .then((response) => response.data);
};

export const createLoan = async (data) => {
    return await privateAxios
    .post(`admin/module-master/loan/create`,data)
    .then((response) => response.data);
}

// House Type module service
export const fetchHoueTypeLists = async () => {
    return await privateAxios
    .post(`admin/module-master/house-type/lists`,)
    .then((response) => response.data);
};

export const createHoueType = async (data) => {
    return await privateAxios
    .post(`admin/module-master/house-type/create`,data)
    .then((response) => response.data);
}

// Cook Food module service
export const fetchCookFoodLists = async () => {
    return await privateAxios
    .post(`admin/module-master/cook-food/lists`,)
    .then((response) => response.data);
};

export const createCookFood = async (data) => {
    return await privateAxios
    .post(`admin/module-master/cook-food/create`,data)
    .then((response) => response.data);
}

// Cook Food module service
export const fetchHomeItemLists = async () => {
    return await privateAxios
    .post(`admin/module-master/home-item/lists`,)
    .then((response) => response.data);
};

export const createHomeItem = async (data) => {
    return await privateAxios
    .post(`admin/module-master/home-item/create`,data)
    .then((response) => response.data);
}