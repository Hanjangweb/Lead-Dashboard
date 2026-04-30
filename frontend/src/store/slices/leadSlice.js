import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Dynamic API call with filters
export const fetchLeads = createAsyncThunk('leads/fetchAll', async (filters) => {
  const response = await axios.get('/api/leads', { params: filters });
  return response.data;
});

const leadSlice = createSlice({
  name: 'leads',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => { state.loading = true; })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default leadSlice.reducer;