import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { SeedlingStages } from "../../types/farm";

const initialState: DataState<SeedlingStages[]> = {
  data: [],
  loading: false,
  error: null,
};

const seedlingStageSlice = createSlice({
  name: "seedlingStage",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<SeedlingStages[]>) {
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
seedlingStageSlice.actions;
export default seedlingStageSlice.reducer;
