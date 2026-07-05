import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchStates, fetchDistricts, fetchBlocks, fetchGrampanchyats } from '../../Services/villageProfile-service';

const initialState = {
  states: [],
  districts: [],
  blocks: [],
  grampanchyats: [],
  status: 'idle',
  error: null
};

export const fetchStatesThunk = createAsyncThunk('villages/fetchStates', async () => {
  const response = await fetchStates();
  return response;
});

export const fetchDistrictsThunk = createAsyncThunk('villages/fetchDistricts', async (stateId) => {  
  const response = await fetchDistricts(stateId);
  // console.log(response);
  return response;
});

export const fetchBlocksThunk = createAsyncThunk('villages/fetchBlocks', async (districtId) => {
  const response = await fetchBlocks(districtId);
  return response;
});

export const fetchGrampanchyatsThunk = createAsyncThunk('villages/fetchGrampanchyats', async (blockId) => {
  const response = await fetchGrampanchyats(blockId);
  return response;
});

const villageSlice = createSlice({
  name: 'villages',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStatesThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStatesThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.states = action.payload;
      })
      .addCase(fetchStatesThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchDistrictsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchDistrictsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.districts = action.payload;
      })
      .addCase(fetchDistrictsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchBlocksThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBlocksThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.blocks = action.payload;
      })
      .addCase(fetchBlocksThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchGrampanchyatsThunk.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGrampanchyatsThunk.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.grampanchyats = action.payload;
      })
      .addCase(fetchGrampanchyatsThunk.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  }
});

export default villageSlice.reducer;
