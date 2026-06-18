import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IExhibitionInventoryRecord } from "../../types/exhibition";

const initialState: DataState<IExhibitionInventoryRecord[]> = {
  data: [],
  loading: false,
  error: null,
};

const exhibitionInventoryRecordSlice = createSlice({
  name: "exhibitionInventory",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IExhibitionInventoryRecord[]>) {
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
exhibitionInventoryRecordSlice.actions;
export default exhibitionInventoryRecordSlice.reducer;
