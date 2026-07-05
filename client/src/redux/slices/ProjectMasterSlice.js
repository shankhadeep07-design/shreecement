import {createSlice} from '@reduxjs/toolkit'

const ProjectMasterSlice = createSlice({
    name : 'ProjectMaster',
    initialState: {
        selectedVillage : [],
        updateRecord : [],
        proejctState : {},
    },
    reducers : {
        setSelectedVillage : (state, action) => {
            state.selectedVillage = action.payload
        },
        setUpdateRecord : (state, action) => {
            state.updateRecord = action.payload
        },
        clearAllState : (state, action) => {
            state.selectedVillage = []
            state.updateRecord = []
        },
        setProjectState : (state, action) => {
            console.log(action);
            state.proejctState = {...state.proejctState, [action.payload.field]: action.payload.value}
        },
        setProjectStateById : (state, action) => {
            console.log(action);
            state.proejctState = action.payload
        },
        clearAllProjectState : (state, action) => {
            state.proejctState = {};
           
        },
        
    }
})

export const {
    setSelectedVillage,
    setUpdateRecord,
    clearAllState,
    setProjectState,
    clearAllProjectState,
    setProjectStateById
} = ProjectMasterSlice.actions;

export default ProjectMasterSlice.reducer;