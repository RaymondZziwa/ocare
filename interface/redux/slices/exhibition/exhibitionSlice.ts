import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IExhibition } from "../../types/exhibition";

const initialState: DataState<IExhibition[]> = {
  data: [],
  loading: false,
  error: null,
};

const exhibitionSlice = createSlice({
  name: "exhibition",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IExhibition[]>) {
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
exhibitionSlice.actions;
export default exhibitionSlice.reducer;
