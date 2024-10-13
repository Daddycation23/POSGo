import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, SafeAreaView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { addItemToCart, removeFromCart, updateCartItemQuantity, clearCart, saveCart, removeSavedCart, saveCartState } from '../store/cartSlice';
import { RootState } from '../store';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MenuItem } from '../store/menuSlice';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { addOrder } from '../store/orderHistorySlice';

interface CartItem extends MenuItem {
  quantity: number;
}

export default function Carts() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const dispatch = useDispatch();
  const menu = useSelector((state: RootState) => state.menu);
  const currentCart = useSelector((state: RootState) => state.cart.currentCart);
  const savedCarts = useSelector((state: RootState) => state.cart.savedCarts);
  const [amountPaid, setAmountPaid] = useState('');
  const [change, setChange] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMenu, setFilteredMenu] = useState<MenuItem[]>(menu);

  useEffect(() => {
    const paid = parseFloat(amountPaid) || 0;
    setChange(Math.max(0, paid - currentCart.total));
  }, [amountPaid, currentCart.total]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    const lowercasedQuery = query.toLowerCase();
    const filtered = menu.filter(item =>
      item.name.toLowerCase().includes(lowercasedQuery)
    );
    setFilteredMenu(filtered);
  }, [menu]);

  const handleGoBack = () => {
    if (currentCart.items.length > 0) {
      Alert.alert(
        "Confirm Navigation",
        "Are you sure you want to go back? Any unsaved changes will be lost.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Yes", 
            onPress: () => {
              dispatch(clearCart());
              router.replace('/(tabs)');
            }
          }
        ]
      );
    } else {
      router.replace('/(tabs)');
    }
  };

  const handleAddToCart = (product: MenuItem) => {
    dispatch(addItemToCart({ ...product, quantity: 1 }));
  };

  const handleRemoveFromCart = (productId: string) => {
    const existingItem = currentCart.items.find(item => item.id === productId);
    if (existingItem && existingItem.quantity > 1) {
      dispatch(updateCartItemQuantity({ id: productId, quantity: existingItem.quantity - 1 }));
    } else {
      dispatch(removeFromCart(productId));
    }
  };

  const handlePaid = () => {
    const paidAmount = parseFloat(amountPaid);
    
    if (!amountPaid || isNaN(paidAmount)) {
      Alert.alert("Error", "Please enter a valid amount paid.");
      return;
    }

    if (paidAmount < currentCart.total) {
      Alert.alert("Error", "The amount paid is less than the total. Please enter the correct amount.");
      return;
    }

    Alert.alert(
      "Confirm Payment",
      "Are you sure you want to mark this order as paid?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes", 
          onPress: () => processPayment(paidAmount)
        }
      ]
    );
  };

  const processPayment = (paidAmount: number) => {
    const order = {
      id: Date.now().toString(),
      date: Date.now(),
      total: currentCart.total,
      items: currentCart.items,
      cartName: currentCart.name,
      amountPaid: paidAmount,
      change: paidAmount - currentCart.total,
    };
    dispatch(addOrder(order));
    dispatch(removeSavedCart(currentCart.name));
    dispatch(clearCart());
    setAmountPaid('');
    setChange(0);
    Alert.alert(
      "Success", 
      "Payment processed successfully!",
      [
        {
          text: "OK",
          onPress: () => {
            router.replace('/(tabs)');
          }
        }
      ]
    );
  };

  const handleSaveCart = () => {
    Alert.alert(
      "Save Cart",
      "Are you sure you want to save this cart?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes", 
          onPress: () => {
            const updatedCart = { 
              ...currentCart,
              name: name as string, 
              items: currentCart.items, 
              total: currentCart.total 
            };
            dispatch(saveCart(updatedCart));
            const updatedSavedCarts = savedCarts.map(cart => 
              cart.name === updatedCart.name ? updatedCart : cart
            );
            if (!savedCarts.find(cart => cart.name === updatedCart.name)) {
              updatedSavedCarts.push(updatedCart);
            }
            dispatch(saveCartState({ currentCart: updatedCart, savedCarts: updatedSavedCarts }));
            Alert.alert("Success", "Cart saved successfully!", [
              {
                text: "OK",
                onPress: () => {
                  dispatch(clearCart());
                  router.replace('/(tabs)');
                }
              }
            ]);
          }
        }
      ]
    );
  };

  const handleDeleteCart = () => {
    const confirmDelete = () => {
      dispatch(removeSavedCart(currentCart.name));
      const updatedSavedCarts = savedCarts.filter(cart => cart.name !== currentCart.name);
      dispatch(saveCartState({ currentCart: { id: '', name: '', items: [], total: 0 }, savedCarts: updatedSavedCarts }));
      dispatch(clearCart());
      Alert.alert("Success", "Cart deleted successfully!", [
        {
          text: "OK",
          onPress: () => {
            router.replace('/(tabs)');
          }
        }
      ]);
    };

    if (Platform.OS === 'web') {
      if (window.confirm("Are you sure you want to delete this cart?")) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        "Delete Cart",
        "Are you sure you want to delete this cart?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Yes", onPress: confirmDelete }
        ]
      );
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerLeft: () => (
            <TouchableOpacity onPress={handleGoBack}>
              <AntDesign name="arrowleft" size={24} color="black" />
            </TouchableOpacity>
          ),
          title: name as string,
        }} 
      />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidingView}
        >
          <ScrollView style={styles.scrollView}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSaveCart}>
              <MaterialIcons name="save" size={24} color="white" />
              <Text style={styles.buttonText}>Save Cart</Text>
            </TouchableOpacity>
            <View style={styles.cartSection}>
              <Text style={styles.sectionTitle}>Current Cart</Text>
              {currentCart.items && currentCart.items.length > 0 ? (
                currentCart.items.map((item) => (
                  <View key={item.id} style={styles.cartItem}>
                    <Text style={styles.cartItemName}>{item.name} x{item.quantity}</Text>
                    <Text style={styles.cartItemPrice}>${(item.price * item.quantity).toFixed(2)}</Text>
                    <View style={styles.cartItemButtons}>
                      <TouchableOpacity
                        style={styles.cartItemButton}
                        onPress={() => handleRemoveFromCart(item.id)}
                      >
                        <AntDesign name="minus" size={24} color="white" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cartItemButton}
                        onPress={() => handleAddToCart(item)}
                      >
                        <AntDesign name="plus" size={24} color="white" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Cart is empty</Text>
              )}
              <Text style={styles.totalText}>Total: ${currentCart.total.toFixed(2)}</Text>
              
              <View style={styles.paymentSection}>
                <Text style={styles.paymentLabel}>Amount Paid:</Text>
                <TextInput
                  style={styles.paymentInput}
                  keyboardType="numeric"
                  value={amountPaid}
                  onChangeText={setAmountPaid}
                  placeholder="Enter amount paid"
                />
                <Text style={styles.changeText}>Change: ${change.toFixed(2)}</Text>
                <TouchableOpacity style={styles.paidButton} onPress={handlePaid}>
                  <MaterialIcons name="payment" size={24} color="white" />
                  <Text style={styles.paidButtonText}>Paid</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Menu Items</Text>
              <View style={styles.searchInputContainer}>
                <AntDesign name="search1" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
              </View>
              {filteredMenu.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={() => handleAddToCart(item)}
                >
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.menuItemImage} />
                  )}
                  <View style={styles.menuItemInfo}>
                    <Text style={styles.menuItemName}>{item.name}</Text>
                    <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleAddToCart(item)}
                  >
                    <AntDesign name="plus" size={24} color="white" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.bottomButtonContainer}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteCart}>
              <MaterialIcons name="delete" size={24} color="white" />
              <Text style={styles.buttonText}>Delete Cart</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 5,
    margin: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Roboto',
  },
  cartSection: {
    marginBottom: 20,
    padding: 10,
  },
  menuSection: {
    marginBottom: 20,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    marginBottom: 10,
  },
  cartItemName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    fontFamily: 'Roboto',
  },
  cartItemButtons: {
    flexDirection: 'row',
  },
  cartItemButton: {
    backgroundColor: '#007AFF',
    padding: 5,
    borderRadius: 5,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  menuItemImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  menuItemInfo: {
    flex: 1,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Roboto',
  },
  addButton: {
    backgroundColor: '#4CD964',
    padding: 10,
    borderRadius: 5,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
    marginVertical: 20,
    fontFamily: 'Roboto',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginVertical: 10,
    fontFamily: 'Roboto',
  },
  paymentSection: {
    marginTop: 20,
  },
  paymentLabel: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'Roboto',
  },
  paymentInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  changeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  paidButton: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 5,
  },
  paidButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Roboto',
  },
  bottomButtonContainer: {
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 5,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  menuList: {
    maxHeight: 300,
  },
});