import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeFromCart } from '../store/cartSlice';
import { Link } from 'expo-router';
import { RootState } from '../store';
import { CartItem } from '../store/cartSlice';

export default function Cart() {
  const currentCart = useSelector((state: RootState) => state.cart.currentCart);
  const dispatch = useDispatch();

  const handleRemoveFromCart = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
      <Text style={styles.productQuantity}>Qty: {item.quantity}</Text>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveFromCart(item.id)}
      >
        <Text style={styles.removeButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.cartTitle}>{currentCart.name}</Text>
      <FlatList
        data={currentCart.items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>Your cart is empty</Text>}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total: ${currentCart.total.toFixed(2)}</Text>
        <Link href="/checkout" asChild>
          <TouchableOpacity style={styles.checkoutButton}>
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  cartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Roboto',
  },
  cartItem: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginVertical: 8,
    borderRadius: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  productPrice: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Roboto',
  },
  productQuantity: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Roboto',
  },
  removeButton: {
    backgroundColor: '#FF3B30', // Changed to red (iOS red color)
    padding: 10,
    borderRadius: 5,
  },
  removeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  totalContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  checkoutButton: {
    backgroundColor: '#57FF63', // Updated color
    padding: 15,
    borderRadius: 5,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
});
