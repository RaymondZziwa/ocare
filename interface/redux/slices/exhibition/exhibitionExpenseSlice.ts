import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IExhibitionExpense } from "../../types/exhibition";

const initialState: DataState<IExhibitionExpense[]> = {
  data: [],
  loading: false,
  error: null,
};

const exhibitionExpenseSlice = createSlice({
  name: "exhibitionExpense",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IExhibitionExpense[]>) {
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
exhibitionExpenseSlice.actions;
export default exhibitionExpenseSlice.reducer;
