import {createSlice} from '@reduxjs/toolkit'

const DocumentManagementSlice = createSlice({
    name : 'DocumentManagement',
    initialState: [],
    reducers : {
        addDocument : (state, actions) => {
            state.push(actions.payload)
        }
    }
})

export const {addDocument} = DocumentManagementSlice.actions;

export default DocumentManagementSlice.reducer;