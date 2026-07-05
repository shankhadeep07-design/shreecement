import {createSlice} from '@reduxjs/toolkit'

const AreaUnitMasterSlice = createSlice({
    name : 'AreaUnitMaster',
    initialState: {
        formData : {}
    },
    reducers : {
        setFormData : (state, action) => {
            state.formData[action.payload?.key] = action.payload?.value
        },
        setCompleteFormDataOnce : (state, action) => {
            state.formData = action.payload
        },
        clearState : (state, action) => {
            state.formData = {}
        }
    }
})

export const {setFormData, setCompleteFormDataOnce, clearState} = AreaUnitMasterSlice.actions;

export default AreaUnitMasterSlice.reducer;