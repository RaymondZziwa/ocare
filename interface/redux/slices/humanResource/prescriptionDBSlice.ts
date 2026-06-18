import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IClientPrescription } from "../../types/pbpd";

const initialState: DataState<IClientPrescription[]> = {
  data: [],
  loading: false,
  error: null,
};

const pbdbSlice = createSlice({
  name: "pbpd",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IClientPrescription[]>) {
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
pbdbSlice.actions;
export default pbdbSlice.reducer;
