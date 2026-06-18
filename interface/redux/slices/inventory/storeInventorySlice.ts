import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IStockStore } from "../../types/inventory";

const initialState: DataState<IStockStore[]> = {
  data: [],
  loading: false,
  error: null,
};

const storeInventorySlice = createSlice({
  name: "storeInventory",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IStockStore[]>) {
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
storeInventorySlice.actions;
export default storeInventorySlice.reducer;
