import {createSlice} from '@reduxjs/toolkit'
const defaultStatus = {
    label : "Yes",
    value : "yes"
}

const status = [{
    label : "Yes",
    value : "yes"
},{
    label : "No",
    value : "no"
}]

const status_compliance = {
    id : Date.now(),
    title : '',
    status : defaultStatus,
    remarks : '',
}

const ProjectStatusComplianceMatrixSlice = createSlice({
    name : 'ProjectStatusComplianceMatrix',
    initialState: {
        status_compliances : [status_compliance],
        singleStatusCompliance : status_compliance,
        status : status
    },
    reducers : {
        addComplianceRow : (state, action) => {
            state.status_compliances = [...state.status_compliances, {...action.payload}];
        },
        deleteComplianceRow : (state, action) => {
            var newRows = state.status_compliances?.filter(obj => obj?.id != action.payload?.id);
            state.status_compliances = newRows;
        },
        setCompliances : (state, action) => {
            state.status_compliances = action?.payload;
        }
    }
})

export const {
    addComplianceRow,
    deleteComplianceRow,
    setCompliances
} = ProjectStatusComplianceMatrixSlice.actions;

export default ProjectStatusComplianceMatrixSlice.reducer;