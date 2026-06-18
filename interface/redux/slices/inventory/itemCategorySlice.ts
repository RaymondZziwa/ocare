import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IItemCategory } from "../../types/inventory";

const initialState: DataState<IItemCategory[]> = {
  data: [],
  loading: false,
  error: null,
};

const itemCategorySlice = createSlice({
  name: "itemCategory",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IItemCategory[]>) {
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
itemCategorySlice.actions;
export default itemCategorySlice.reducer;
