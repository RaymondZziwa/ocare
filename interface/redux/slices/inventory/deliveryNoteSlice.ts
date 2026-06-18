import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IDeliveryNote } from "../../types/inventory";

const initialState: DataState<IDeliveryNote[]> = {
  data: [],
  loading: false,
  error: null,
};

const deliveryNoteSlice = createSlice({
  name: "deliveryNote",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IDeliveryNote[]>) {
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
deliveryNoteSlice.actions;
export default deliveryNoteSlice.reducer;
