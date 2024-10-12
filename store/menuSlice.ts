import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
    },
    removeMenuItem: (state, action: PayloadAction<string>) => {
      return state.filter(item => item.id !== action.payload);
    },
  },
});

export const { addMenuItem, removeMenuItem } = menuSlice.actions;
export default menuSlice.reducer;