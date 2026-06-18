import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IExhibitionStore } from "../../types/exhibition";

const initialState: DataState<IExhibitionStore[]> = {
  data: [],
  loading: false,
  error: null,
};

const exhibitionStoreSlice = createSlice({
  name: "exhibitionStore",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IExhibitionStore[]>) {
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
exhibitionStoreSlice.actions;
export default exhibitionStoreSlice.reducer;
