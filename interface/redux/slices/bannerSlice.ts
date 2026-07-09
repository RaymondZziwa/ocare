import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "./generic";

export interface IBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  backgroundColor: string;
  isActive: boolean;
  order: number;
  linkUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const initialState: DataState<IBanner[]> = {
  data: [],
  loading: false,
  error: null,
};

const bannerSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IBanner[]>) {
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
  bannerSlice.actions;
export default bannerSlice.reducer;
