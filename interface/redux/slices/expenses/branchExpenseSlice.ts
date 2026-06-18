import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";
import type { IBranchExpense } from "../../types/expenses";

const initialState: DataState<IBranchExpense[]> = {
  data: [],
  loading: false,
  error: null,
};

const branchExpenseSlice = createSlice({
  name: "branchExpense",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IBranchExpense[]>) {
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
branchExpenseSlice.actions;
export default branchExpenseSlice.reducer;
