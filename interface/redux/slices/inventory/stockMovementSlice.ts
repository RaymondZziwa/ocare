import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IStockMovement } from "../../types/inventory";

const initialState: DataState<IStockMovement[]> = {
  data: [],
  loading: false,
  error: null,
};

const stockMvtSlice = createSlice({
  name: "stockMv",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IStockMovement[]>) {
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
stockMvtSlice.actions;
export default stockMvtSlice.reducer;
