import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IDepartment } from "../../types/hr";

const initialState: DataState<IDepartment[]> = {
  data: [],
  loading: false,
  error: null,
};

const deptSlice = createSlice({
  name: "dept",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IDepartment[]>) {
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
deptSlice.actions;
export default deptSlice.reducer;
