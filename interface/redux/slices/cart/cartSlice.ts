import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { DataState } from "../generic";

export interface CartItemVariation {
  id: string;
  name: string;
  value: string;
}

export interface CartItem {
  id: string;
  name: string;
  sellingPrice: number;
  unitId: string;
  image?: string;
  quantity: number;
  description?: string;
  variation?: CartItemVariation;
}

const initialState: DataState<CartItem[]> = {
  data: [],
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Omit<CartItem, "quantity">>) {
      // Match by both id AND variation (if provided) so different variations are separate cart entries
      const existingItem = state.data.find(item =>
        item.id === action.payload.id &&
        item.variation?.id === action.payload.variation?.id
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.data.push({ ...action.payload, quantity: 1 });
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.data = state.data.filter(item => item.id !== action.payload);
    },
    updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
      const item = state.data.find(item => item.id === action.payload.id);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.data = state.data.filter(cartItem => cartItem.id !== action.payload.id);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },
    clearCart(state) {
      state.data = [];
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setLoading,
  setError,
} = cartSlice.actions;

export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: { cart: DataState<CartItem[]> }) => state.cart.data;
export const selectCartTotal = (state: { cart: DataState<CartItem[]> }) => 
  state.cart.data.reduce((total, item) => total + (item.sellingPrice * item.quantity), 0);
export const selectCartCount = (state: { cart: DataState<CartItem[]> }) =>
  state.cart.data.reduce((count, item) => count + item.quantity, 0);
export const selectCartLoading = (state: { cart: DataState<CartItem[]> }) => state.cart.loading;
export const selectCartError = (state: { cart: DataState<CartItem[]> }) => state.cart.error;
