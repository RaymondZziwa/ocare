import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IPayrollPeriod } from "../../types/hr";

const initialState: DataState<IPayrollPeriod[]> = {
  data: [],
  loading: false,
  error: null,
};

const payrollSlice = createSlice({
  name: "payroll",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IPayrollPeriod[]>) {
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
payrollSlice.actions;
export default payrollSlice.reducer;
