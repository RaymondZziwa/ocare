import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ManufacturingState {
  data: unknown[];
  loading: boolean;
  error: string | null;
}

const initialState: ManufacturingState = {
  data: [],
  loading: false,
  error: null,
};

const manufacturingSlice = createSlice({
  name: 'manufacturing',
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<unknown[]>) {
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

export const { fetchDataStart, fetchDataSuccess, fetchDataFailure } = manufacturingSlice.actions;
export default manufacturingSlice.reducer;

