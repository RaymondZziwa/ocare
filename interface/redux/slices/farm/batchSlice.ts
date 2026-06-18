import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { SeedlingBatch } from "../../types/farm";

const initialState: DataState<SeedlingBatch[]> = {
  data: [],
  loading: false,
  error: null,
};

const seedlingBatchSlice = createSlice({
  name: "seedlingBatch",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<SeedlingBatch[]>) {
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
seedlingBatchSlice.actions;
export default seedlingBatchSlice.reducer;
