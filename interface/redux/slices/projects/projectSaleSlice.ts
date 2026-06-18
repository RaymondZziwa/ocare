import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IProjectSale } from "../../types/sales";
import type { DataState } from "../generic";

const initialState: DataState<IProjectSale[]> = {
  data: [],
  loading: false,
  error: null,
};

const projectSaleSlice = createSlice({
  name: "projectSale",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IProjectSale[]>) {
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
projectSaleSlice.actions;
export default projectSaleSlice.reducer;
