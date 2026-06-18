import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IClient } from "../../types/sales";
import type { DataState } from "../generic";

const initialState: DataState<IClient[]> = {
  data: [],
  loading: false,
  error: null,
};

const clientSlice = createSlice({
  name: "client",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IClient[]>) {
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
clientSlice.actions;
export default clientSlice.reducer;
