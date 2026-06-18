import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { SeedlingDeath } from "../../types/farm";

const initialState: DataState<SeedlingDeath[]> = {
  data: [],
  loading: false,
  error: null,
};

const seedlingDeathSlice = createSlice({
  name: "seedlingDeath",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<SeedlingDeath[]>) {
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
seedlingDeathSlice.actions;
export default seedlingDeathSlice.reducer;
