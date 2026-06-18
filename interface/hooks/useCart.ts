import type { CartItem } from "@/redux/slices/cart/cartSlice";
import {
    addToCart,
    clearCart,
    removeFromCart,
    selectCartCount,
    selectCartError,
    selectCartItems,
    selectCartLoading,
    selectCartTotal,
    updateQuantity,
} from "@/redux/slices/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";

const useCart = () => {
  const dispatch = useDispatch();

  // Selectors
  const items = useSelector(selectCartItems);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);
  const loading = useSelector(selectCartLoading);
  const error = useSelector(selectCartError);

  console.log('cart data', items, total, count)
  // Actions
  const addItem = (item: Omit<CartItem, "quantity">) => {
    dispatch(addToCart(item));
  };

  const removeItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const clearCartItems = () => {
    dispatch(clearCart());
  };

  // Utility functions
  const getItemQuantity = (id: string) => {
    const item = items.find((item) => item.id === id);
    return item?.quantity || 0;
  };

  const isInCart = (id: string) => {
    return items.some((item) => item.id === id);
  };

  const getSubtotal = (id: string) => {
    const item = items.find((item) => item.id === id);
    return item ? item.price * item.quantity : 0;
  };

  return {
    // State
    items,
    total,
    count,
    loading,
    error,

    // Actions
    addItem,
    removeItem,
    updateItemQuantity,
    clearCartItems,

    // Utilities
    getItemQuantity,
    isInCart,
    getSubtotal,
  };
};

export default useCart;
