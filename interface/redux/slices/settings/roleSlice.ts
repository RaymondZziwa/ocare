import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IRole } from "../../types/systemSettings";
import type { DataState } from "../generic";

const initialState: DataState<IRole[]> = {
  data: [],
  loading: false,
  error: null,
};

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IRole[]>) {
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
roleSlice.actions;
export default roleSlice.reducer;
