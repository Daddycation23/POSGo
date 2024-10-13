import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
      const oneMonthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      const recentOrders = state.filter(order => order.date >= oneMonthAgo);
      recentOrders.push(action.payload);
      saveOrderHistory(recentOrders);
      return recentOrders;
    },
    setOrderHistory: (state, action: PayloadAction<Order[]>) => {
      return action.payload;
    },
  },
});

export const { addOrder, setOrderHistory } = orderHistorySlice.actions;

const saveOrderHistory = async (orders: Order[]) => {
  try {
    const jsonValue = JSON.stringify(orders);
    await AsyncStorage.setItem('@order_history', jsonValue);
  } catch (e) {
    console.error('Error saving order history:', e);
  }
};

export const loadOrderHistory = () => async (dispatch: any) => {
  try {
    const jsonValue = await AsyncStorage.getItem('@order_history');
    if (jsonValue != null) {
      const orders = JSON.parse(jsonValue);
      dispatch(setOrderHistory(orders));
    }
  } catch (e) {
    console.error('Error loading order history:', e);
  }
};

export default orderHistorySlice.reducer;
