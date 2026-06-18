import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IEvent } from "../../types/events";

const initialState: DataState<IEvent[]> = {
  data: [],
  loading: false,
  error: null,
};

const eventSlice = createSlice({
  name: "event",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IEvent[]>) {
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
eventSlice.actions;
export default eventSlice.reducer;
