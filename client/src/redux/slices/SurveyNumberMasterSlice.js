import {createSlice} from '@reduxjs/toolkit'

const SurveyNumberMasterSlice = createSlice({
    name : 'SurveyNumberMaster',
    initialState: {
        formData : {},
        landTypes : [],
        areaUnits : [],
        casteCategories : {},
        stateList : [],
        districtList : [],
        talukaList : [],
        unitList : [],
        villageList : [],
        casteCategoryVisibility : false
    },
    reducers : {
        setFormData : (state, action) => {
            state.formData[action.payload?.key] = action.payload?.value
        },
        setCompleteFormDataOnce : (state, action) => {
            state.formData = action.payload
        },
        clearAllState : (state, action) => {
            state.formData = {};
            state.districtList = [];
            state.talukaList = [];
            state.unitList = [];
            state.villageList = [];
            state.areaUnits = [];
            state.casteCategoryVisibility = false;
        },
        setStateList : (state, action) => {
            state.stateList = action.payload
        },
        clearStateList : (state, action) => {
            state.stateList = []
        },
        setDistrictList : (state, action) => {
            state.districtList = action.payload
        },
        clearDistrictList : (state, action) => {
            state.districtList = []
        },
        setTalukaList : (state, action) => {
            state.talukaList = action.payload
        },
        clearTalukaList : (state, action) => {
            state.talukaList = []
        },
        setUnitList : (state, action) => {
            state.unitList = action.payload
        },
        clearUnitList : (state, action) => {
            state.unitList = []
        },
        setVillageList : (state, action) => {
            state.villageList = action.payload
        },
        clearVillageList : (state, action) => {
            state.villageList = []
        },
        setLandTypes : (state, action) => {
            state.landTypes = action.payload
        },
        clearLandTypes : (state, action) => {
            state.landTypes = []
        },
        setCasteCategories : (state, action) => {
            state.casteCategories = action.payload
        },
        clearCasteCategories : (state, action) => {
            state.casteCategories = []
        },
        setAreaUnits : (state, action) => {
            state.areaUnits = action.payload
        },
        clearAreaUnits : (state, action) => {
            state.areaUnits = []
        },
        setCasteCategoryVisibility : (state, action) => {
            state.casteCategoryVisibility = action.payload
        }

    }
})

export const {
    setFormData, 
    setCompleteFormDataOnce, 
    clearAllState,
    setStateList,
    clearStateList,
    setDistrictList,
    clearDistrictList,
    setTalukaList,
    clearTalukaList,
    setUnitList,
    clearUnitList,
    setVillageList,
    clearVillageList,

    setLandTypes,
    clearLandTypes,
    setCasteCategories,
    clearCasteCategories,
    setAreaUnits,
    clearAreaUnits,

    setCasteCategoryVisibility
} = SurveyNumberMasterSlice.actions;

export default SurveyNumberMasterSlice.reducer;