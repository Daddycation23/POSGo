import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import menuReducer from './menuSlice';
import orderHistoryReducer from './orderHistorySlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    menu: menuReducer,
    orderHistory: orderHistoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;