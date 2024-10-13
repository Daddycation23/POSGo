import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
}

const menuSlice = createSlice({
  name: 'menu',
  initialState: [] as MenuItem[],
  reducers: {
    addMenuItem: (state, action: PayloadAction<MenuItem>) => {
      state.push(action.payload);
      saveMenuItems(state);
    },
    removeMenuItem: (state, action: PayloadAction<string>) => {
      const newState = state.filter(item => item.id !== action.payload);
      saveMenuItems(newState);
      return newState;
    },
    setMenuItems: (state, action: PayloadAction<MenuItem[]>) => {
      return action.payload;
    },
  },
});

export const { addMenuItem, removeMenuItem, setMenuItems } = menuSlice.actions;

const saveMenuItems = async (menuItems: MenuItem[]) => {
  try {
    const jsonValue = JSON.stringify(menuItems);
    await AsyncStorage.setItem('@menu_items', jsonValue);
  } catch (e) {
    console.error('Error saving menu items:', e);
  }
};

export const loadMenuItems = () => async (dispatch: any) => {
  try {
    const jsonValue = await AsyncStorage.getItem('@menu_items');
    if (jsonValue != null) {
      const menuItems = JSON.parse(jsonValue);
      dispatch(setMenuItems(menuItems));
    }
  } catch (e) {
    console.error('Error loading menu items:', e);
  }
};

export default menuSlice.reducer;
