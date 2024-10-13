import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Provider } from 'react-redux';
import { store } from '../store';
import { useEffect } from 'react';
import { loadMenuItems } from '../store/menuSlice';
import { loadCartState } from '../store/cartSlice';
import { loadOrderHistory } from '../store/orderHistorySlice';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    store.dispatch(loadMenuItems());
    store.dispatch(loadCartState());
    store.dispatch(loadOrderHistory());
  }, []);

  return (
    <Provider store={store}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="carts" options={{ presentation: 'modal' }} />
        <Stack.Screen name="add-item" options={{ presentation: 'modal' }} />
      </Stack>
    </Provider>
  );
}
