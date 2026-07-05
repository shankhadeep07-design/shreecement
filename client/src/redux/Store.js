import {configureStore} from '@reduxjs/toolkit'

import DocumentReducer from './slices/DocumentsManagementSlice';
import SurveyNumberMasterReducer from './slices/SurveyNumberMasterSlice'
import AreaUnitMasterMasterReducer from './slices/AreaUnitMasterSlice'
import ProjectMasterReducer from './slices/ProjectMasterSlice'
import ApprovalPathReducer from './slices/ApprovalPathSlice'
import MasterModuleSlice from './slices/MasterModuleSlice';
import GISMapSlice from './slices/GISMapSlice';
import villageGeneralProfileReducer from './slices/villageGeneralProfileSlice';


export const Store = configureStore({
    reducer : {
        "Documents" : DocumentReducer,
        "SurveyNumberMaster" : SurveyNumberMasterReducer,
        "AreaUnitMaster" : AreaUnitMasterMasterReducer,
        "ProjectMaster" : ProjectMasterReducer,
        "ApprovalPath" : ApprovalPathReducer,
        "MasterModuleSlice": MasterModuleSlice,
        "GISMapSlice" : GISMapSlice,
        "villages": villageGeneralProfileReducer,

    }
})