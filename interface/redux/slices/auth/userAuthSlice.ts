// slices/userAuthSlice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { IUserAuth } from "../../types/userAuth";
import type { DataState } from "../generic";

const initialState: DataState<IUserAuth> = {
  data: {
    id: "",
    fullName: "",
    phone: "",
    email: "",
    updatedAt: "",
    createdAt: "",
    gender: "",
    hasAccess: false,
    isActive: false,
    branch: {
      id: "",
      name: "",
    },
    department: {
      id: "",
      name: "",
    },
    token: {
      accessToken: "",
      refreshToken: "",
    },
    role: {
      id: "",
      name: "",
      permissions: [],
    },
  },
  loading: false,
  error: null,
};

const userAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    fetchDataStart(state) {
      state.loading = true;
      state.error = null;
    },
    fetchDataSuccess(state, action: PayloadAction<IUserAuth>) {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    fetchDataFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    // Add login actions
    loginStart(state) {
      state.loading = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<IUserAuth>) {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
      // Clear data on login failure
      state.data = initialState.data;
    },
    // Add logout action
    logout(state) {
      state.data = initialState.data;
      state.loading = false;
      state.error = null;
      localStorage.clear();
    },

    clearError(state) {
      state.error = null;
    },
  },
});

export const {
  fetchDataStart,
  fetchDataSuccess,
  fetchDataFailure,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  clearError,
} = userAuthSlice.actions;

export default userAuthSlice.reducer;
