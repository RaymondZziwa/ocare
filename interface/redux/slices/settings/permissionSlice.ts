import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IPermission } from "../../types/systemSettings";
import type { DataState } from "../generic";

const initialState: DataState<IPermission[]> = {
  data: [],
  loading: false,
  error: null,
};

const permissionSlice = createSlice({
  name: "permission",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IPermission[]>) {
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
permissionSlice.actions;
export default permissionSlice.reducer;
