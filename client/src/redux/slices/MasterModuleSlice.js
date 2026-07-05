import {createSlice} from '@reduxjs/toolkit'

const MasterModuleSlice = createSlice({
    name : 'MasterModule',
    initialState: {
        advocateState: {},
        companyState: {},
        company_list:[],
        other_master : {},
        milestone_master: {},
        solarFormErrors: {},
    },
    reducers : {
        setAdvocateState : (state, action) => {
            state.advocateState = {...state.advocateState, [action.payload.field]: action.payload.value}
        },
        setAllAdvocate : (state, action) => {
            state.advocateState = action.payload;
        },
        clearAllAdvocate : (state, action) => {
            state.advocateState = {};
        },
        setCompanyState : (state, action) => {
            state.companyState = {...state.companyState, [action.payload.field]: action.payload.value}
        },
        setAllCompany : (state, action) => {
            state.companyState = action.payload;
        },
        clearAllCompany : (state, action) => {
            state.companyState = {};
        },
        setOtherMaster : (state, action) => {
            state.other_master = {...state.other_master, [action.payload.field]: action.payload.value}
        },
        setAllOtherMaster : (state, action) => {
            state.other_master = action.payload;
        },
        clearAllOtherMaster : (state, action) => {
            state.other_master = {};
        },
        setMilestoneState : (state, action) => {
            state.milestone_master = action.payload;
        },
        setAllMilestone : (state, action) => {
            state.milestone_master = action.payload;
        },
        clearAllMilestone : (state, action) => {
            state.milestone_master = {};
        },
        sendSolarFormErrors: (state, action)=> {
            state.solarFormErrors = action.payload;
        },
    }
})

export const {
    setAdvocateState,
    setCompanyState,
    setAllCompany,
    setAllAdvocate,
    clearAllAdvocate,
    clearAllCompany,
    setOtherMaster,
    setAllOtherMaster,
    clearAllOtherMaster,
    setMilestoneState,
    setAllMilestone,
    clearAllMilestone,
    sendSolarFormErrors
} = MasterModuleSlice.actions;

export default MasterModuleSlice.reducer;