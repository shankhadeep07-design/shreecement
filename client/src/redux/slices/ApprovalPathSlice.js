import {createSlice} from '@reduxjs/toolkit'
var singlObj = {
    id: Date.now(),
    option: null,
};
const ApprovalPathSlice = createSlice({
    name : 'ApprovalPath',
    initialState: {
        formData : {},
        singleObj : singlObj,
        approvers : [singlObj],
        intemators : [singlObj],
        roles : [],
        modules : [],
        states : [],
    },
    reducers : {
        setFormData : (state, action) => {
            state.formData[action.payload?.key] = action.payload?.value
        },
        setCompleteFormDataOnce : (state, action) => {
            state.formData = action.payload
        },
        setApprovers : (state, action) => {
            state.approvers.push(action.payload);
        },
        setAllApprovers : (state, action) => {
            state.approvers = action.payload;
        },
        setIntemators : (state, action) => {
            state.intemators.push(action.payload);
        },
        setAllIntemators : (state, action) => {
            state.intemators = action.payload;
        },
        setApproverOption : (state, action) => {
            state.approvers[action.payload.index]['option'] = action.payload.option;
        },
        setIntematorOption : (state, action) => {
            state.intemators[action.payload.index]['option'] = action.payload.option;
        },
        setRoles : (state, action) => {
            state.roles = action.payload;
        },
        setModule : (state, action) => {
            state.modules = action.payload;
        },
        setState : (state, action) => {
            state.states = action.payload;
        },
        deleteApprover : (state, action) => {
            if(action.payload){
                var newObj = state.approvers?.filter((obj, index) => {
                    return (index != action.payload);
                })
                state.approvers = newObj;
            }
        },
        deleteIntemator : (state, action) => {
            if(action.payload){
                var newObj = state.intemators?.filter((obj, index) => {
                    return (index != action.payload);
                })
                state.intemators = newObj;
            }
        },
        clearAllState : (state, action) => {
            state.formData = {}
            state.approvers = [singlObj]
            state.intemators = [singlObj]
            state.roles = [];
            state.modules = [];
            state.states = [];
        },

        handleEnableDisabledRole : (state , action) => {
            var mergeOptions = [...state.intemators, ...state.approvers]
            var roles = [...state.roles];
            var newRoles = [];
            for(var i = 0; i < roles.length; i++) {
                var flag = false;
                newRoles[i] = {...roles[i]};
                for(var j = 0; j < mergeOptions.length; j++){
                    if(mergeOptions[j]?.option?.slug == roles[i]?.slug){
                        flag = true;
                        break;
                    }else{
                        flag = false;
                    }
                }
                newRoles[i].isDisabled = flag;
            }
            state.roles = newRoles;
        }
    }
})

export const {
    setFormData, 
    setCompleteFormDataOnce, 
    setApprovers, 
    setIntemators, 
    clearAllState, 
    setRoles,
    deleteApprover,
    deleteIntemator,
    setModule,
    setState,
    setApproverOption,
    setIntematorOption,
    setAllApprovers,
    setAllIntemators,
    handleEnableDisabledRole
} = ApprovalPathSlice.actions;

export default ApprovalPathSlice.reducer;