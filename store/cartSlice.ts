import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Cart {
  id: string;
  name: string;
  items: CartItem[];
  total: number;
}

interface CartState {
  currentCart: Cart;
  savedCarts: Cart[];
}

const initialState: CartState = {
  currentCart: {
    id: '',
    name: '',
    items: [],
    total: 0,
  },
  savedCarts: [],
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addCart: (state, action: PayloadAction<Cart>) => {
      const newCart = {
        ...action.payload,
        items: Array.isArray(action.payload.items) ? action.payload.items : [],
        total: typeof action.payload.total === 'number' ? action.payload.total : 0,
      };
      state.savedCarts.push(newCart);
      state.currentCart = newCart;
    },
    loadCart: (state, action: PayloadAction<string>) => {
      const cartToLoad = state.savedCarts.find(cart => cart.name === action.payload);
      if (cartToLoad) {
        state.currentCart = {
          ...cartToLoad,
          items: Array.isArray(cartToLoad.items) ? cartToLoad.items : [],
        };
      } else {
        state.currentCart = {
          id: Date.now().toString(),
          name: action.payload,
          items: [],
          total: 0,
        };
      }
    },
    addItemToCart: (state, action: PayloadAction<CartItem>) => {
      if (!Array.isArray(state.currentCart.items)) {
        state.currentCart.items = [];
      }
      const existingItem = state.currentCart.items.find(item => item.id === action.payload.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.currentCart.items.push({ ...action.payload, quantity: 1 });
      }
      state.currentCart.total = state.currentCart.items.reduce((total, item) => total + item.price * item.quantity, 0);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      const itemIndex = state.currentCart.items.findIndex(item => item.id === action.payload);
      if (itemIndex !== -1) {
        const item = state.currentCart.items[itemIndex];
        state.currentCart.total -= item.price * item.quantity;
        state.currentCart.items.splice(itemIndex, 1);
      }
    },
    saveCart: (state, action: PayloadAction<{ name: string; items: CartItem[]; total: number }>) => {
      const existingCartIndex = state.savedCarts.findIndex(cart => cart.name === action.payload.name);
      const newCart = {
        id: Date.now().toString(),
        name: action.payload.name,
        items: action.payload.items,
        total: action.payload.total,
      };
      
      if (existingCartIndex !== -1) {
        // Update existing cart
        state.savedCarts[existingCartIndex] = newCart;
      } else {
        // Add new cart
        state.savedCarts.push(newCart);
      }
      
      // Update current cart
      state.currentCart = newCart;
    },
    updateCartItemQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.currentCart.items.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        state.currentCart.total = state.currentCart.items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    },
    clearCart: (state) => {
      state.currentCart = {
        id: '',
        name: '',
        items: [],
        total: 0,
      };
    },
    removeSavedCart: (state, action: PayloadAction<string>) => {
      state.savedCarts = state.savedCarts.filter(cart => cart.name !== action.payload);
    },
  },
});

export const { 
  addCart, 
  loadCart, 
  addItemToCart, 
  removeFromCart, 
  saveCart, 
  updateCartItemQuantity, 
  clearCart,
  removeSavedCart
} = cartSlice.actions;

export default cartSlice.reducer;
