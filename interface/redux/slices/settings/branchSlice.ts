import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IBranch } from "../../types/systemSettings";
import type { DataState } from "../generic";

const initialState: DataState<IBranch[]> = {
  data: [],
  loading: false,
  error: null,
};

const branchSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IBranch[]>) {
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
branchSlice.actions;
export default branchSlice.reducer;
