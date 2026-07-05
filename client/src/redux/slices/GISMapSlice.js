import {createSlice, createAsyncThunk} from '@reduxjs/toolkit'
import { privateAxios } from '../../services/Helper';

// Import images
import aerialImage from '../../assets/images/aerial-view.png';
import aerialWithLabelsImage from '../../assets/images/aerial-label-view.png';
import roadOnDemandImage from '../../assets/images/road-view.png';
import canvasDarkImage from '../../assets/images/road-dark-view.png';


export const fetchWMSLayers = createAsyncThunk(
    'GISMap/fetchWMSLayers',
    async (callback) => {
        const response = await privateAxios.get(`admin/shpfile-management/layers`);
        callback(response?.data)
        return response.data?.data;
    }
);

const GISMapSlice = createSlice({
    name : 'GISMap',
    initialState: {
        map : null,
        sideBarElements : {
            layer_legend : false,
            base_map_imagery : false,
            measurement : false,
            filter : false
        },
        staticLayers : {
            base_map : true,
            plot_map : true,
            tsr_done : false,
            lease_sale_done : false,
            na_conversion_done : false,
            mutation_done : false,
            demarcation_done : false,
            capitalization_done : false,
        },
        wmsLayers : [],
        imagery : [
            {
                key : "aerial",
                value : 'Aerial',
                image : aerialImage,
                visible : true
            },
            {
                key : "aerial_with_labels",
                value : 'AerialWithLabels',
                image : aerialWithLabelsImage,
                visible : false
            },
            {
                key : "road_on_demand",
                value : 'RoadOnDemand',
                image : roadOnDemandImage,
                visible : false
            },
            {
                key : "canvas_dark",
                value : 'CanvasDark',
                image : canvasDarkImage,
                visible : false
            }
        ],
        zoom : 4,
        maxZoom : 17,
        center : [76.12958273075, 15.50512175395],
        extent : [76.1139560411, 15.4932602206, 76.1452094204, 15.5169832873]
        // BOX()
    },
    extraReducers: (builder) => {
        builder.addCase(fetchWMSLayers.fulfilled, (state, action) => {
            state.wmsLayers = action.payload?.map(obj => {
                obj.visible = false
                return obj;
            });
        });
    },
    reducers : {
        setMap : (state, action) => {
            state.map = action.payload;
        },
        activeSideBarElement : (state, action) => {
            var _elem = {...state.sideBarElements};
            for(let key in _elem){
                if(key == action?.payload?.key)
                    _elem[key] = _elem[key] ? false : true;
                else
                    _elem[key] = false;
            }
            state.sideBarElements = _elem;
        },
        toggleStaticLayer: (state, action) => {
            state.staticLayers[action?.payload] = state?.staticLayers[action?.payload] ? false : true;
        },
        toggleWMSLayer: (state, action) => {
            state.wmsLayers[action?.payload].visible = state?.wmsLayers[action?.payload]?.visible ? false : true;
        },
        toggleImagery: (state, action) => {
            var newImagery = state.imagery?.map(obj => {
                if(obj?.value == action.payload) {
                    obj.visible = true;
                }else{
                    obj.visible = false;
                }
                return obj;
            })
            state.imagery = newImagery;
            //state.wmsLayers[action?.payload].visible = state?.wmsLayers[action?.payload]?.visible ? false : true;
        },
        setWMSLayers : (state, action) => {
            state.wmsLayers = action?.payload
        },
        clearState : (state, action) => {
            state.formData = {}
        },
    }
})

export const {
    activeSideBarElement,
    setWMSLayers,
    clearState,
    toggleStaticLayer,
    toggleWMSLayer,
    toggleImagery
} = GISMapSlice.actions;

export default GISMapSlice.reducer;