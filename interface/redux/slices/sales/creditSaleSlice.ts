import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ISale } from "../../types/sales";
import type { DataState } from "../generic";

const initialState: DataState<ISale[]> = {
  data: [],
  loading: false,
  error: null,
};

const creditSaleSlice = createSlice({
  name: "creditSale",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<ISale[]>) {
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
creditSaleSlice.actions;
export default creditSaleSlice.reducer;
