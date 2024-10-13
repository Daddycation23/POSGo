import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  date: number;
  total: number;
  items: OrderItem[];
  cartName: string;
  amountPaid: number;
  change: number;
}

const initialState: Order[] = [];

const orderHistorySlice = createSlice({
  name: 'orderHistory',
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.push(action.payload);
    },
  },
});

export const { addOrder } = orderHistorySlice.actions;
export default orderHistorySlice.reducer;
