import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { SeedlingBatchTracker } from "../../types/farm";

const initialState: DataState<SeedlingBatchTracker[]> = {
  data: [],
  loading: false,
  error: null,
};

const seedlingGrowthSlice = createSlice({
  name: "seedlingGrowth",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<SeedlingBatchTracker[]>) {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    fetchDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const { fetchDataStart, fetchDataSuccess, fetchDataFailure } =
seedlingGrowthSlice.actions;
export default seedlingGrowthSlice.reducer;
