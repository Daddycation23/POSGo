import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, SafeAreaView, Image, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeMenuItem } from '../../store/menuSlice';
import { loadCart, addCart, saveCartState } from '../../store/cartSlice';
import { RootState } from '../../store';
import { useRouter } from 'expo-router';
import { MenuItem } from '../../store/menuSlice';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';

interface Cart {
  id: string;
  name: string;
  items: MenuItem[];
  total: number;
}

export default function ProductList() {
  const router = useRouter();
  const dispatch = useDispatch();
  const menu = useSelector((state: RootState) => state.menu);
  const [isNewCartModalVisible, setIsNewCartModalVisible] = useState(false);
  const [newCartName, setNewCartName] = useState('');
  const [isCartsModalVisible, setIsCartsModalVisible] = useState(false);
  const savedCarts = useSelector((state: RootState) => state.cart.savedCarts);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMenu = searchQuery
    ? menu.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : menu;

  const handleRemoveMenuItem = (productId: string) => {
    Alert.alert(
      "Remove Menu Item",
      "Are you sure you want to remove this item from the menu?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Yes", onPress: () => dispatch(removeMenuItem(productId)) }
      ]
    );
  };

  const renderMenuItem = (item: MenuItem) => (
    <View key={item.id} style={styles.productItem}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.productImage} />
      )}
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveMenuItem(item.id)}
      >
        <AntDesign name="delete" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  const handleAddCart = () => {
    if (menu.length === 0) {
      Alert.alert(
        "No Menu Items",
        "You need to add menu items before creating a cart. Would you like to add a menu item now?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Add Menu Item",
            onPress: () => router.push('/add-item')
          }
        ]
      );
    } else {
      setIsNewCartModalVisible(true);
    }
  };

  const handleCreateCart = () => {
    if (newCartName.trim()) {
      const newCart = {
        id: Date.now().toString(),
        name: newCartName.trim(),
        items: [],
        total: 0,
      };
      dispatch(addCart(newCart));
      dispatch(saveCartState({ currentCart: newCart, savedCarts: [...savedCarts, newCart] }));
      router.push({
        pathname: '/carts',
        params: { name: newCartName.trim() }
      });
      setIsNewCartModalVisible(false);
      setNewCartName('');
    } else {
      Alert.alert('Error', 'Please enter a name for the cart');
    }
  };

  const handleOpenCart = (cartName: string) => {
    dispatch(loadCart(cartName));
    router.push({
      pathname: '/carts',
      params: { name: cartName }
    });
  };

  const handleOpenSavedCarts = () => {
    if (savedCarts.length === 0) {
      Alert.alert("No Saved Carts", "You don't have any saved carts.");
    } else {
      setIsCartsModalVisible(true);
    }
  };

  const renderSavedCartItem = (item: Cart) => (
    <TouchableOpacity key={item.id} style={styles.savedCartItem} onPress={() => handleOpenCart(item.name)}>
      <Text style={styles.savedCartName}>{item.name}</Text>
      <Text style={styles.savedCartTotal}>Total: ${item.total.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stickyHeader}>
        <Text style={styles.sectionTitle}>Menu Items</Text>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <AntDesign name="search1" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search menu items..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.spacer} />
        <View style={styles.menuSection}>
          {filteredMenu.length > 0 ? (
            filteredMenu.map(renderMenuItem)
          ) : (
            <Text style={styles.emptyText}>No menu items found.</Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.bottomButtons}>
        <Link href="/add-item" asChild>
          <TouchableOpacity style={styles.addItemButton}>
            <AntDesign name="pluscircle" size={24} color="white" />
            <Text style={styles.addItemButtonText}>Add New Menu</Text>
          </TouchableOpacity>
        </Link>
        <TouchableOpacity style={styles.cartButton} onPress={handleAddCart}>
          <MaterialIcons name="add-shopping-cart" size={24} color="white" />
          <Text style={styles.cartButtonText}>New Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartsButton} onPress={handleOpenSavedCarts}>
          <MaterialIcons name="shopping-cart" size={24} color="white" />
          <Text style={styles.cartsButtonText}>Saved Carts</Text>
          {savedCarts.length > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{savedCarts.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isNewCartModalVisible}
        onRequestClose={() => setIsNewCartModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Cart</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter cart name"
              value={newCartName}
              onChangeText={setNewCartName}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsNewCartModalVisible(false);
                  setNewCartName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateCart}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={isCartsModalVisible}
        onRequestClose={() => setIsCartsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Saved Carts</Text>
            <ScrollView>
              {savedCarts.length > 0 ? (
                savedCarts.map(renderSavedCartItem)
              ) : (
                <Text style={styles.emptyText}>No saved carts</Text>
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsCartsModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    zIndex: 1,
    paddingTop: 60, // Adjust this value to lower the sticky header
    paddingHorizontal: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingTop: 150, // Adjust this value to match the height of your sticky header
  },
  spacer: {
    height: 20, // Add some space between the sticky header and the first menu item
  },
  searchContainer: {
    marginBottom: 10,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    paddingHorizontal: 10,
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
  menuSection: {
    paddingHorizontal: 10,
  },
  productItem: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginVertical: 8,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 5,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  productPrice: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  addButton: {
    backgroundColor: '#007AFF',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: '#FF3B30',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  addItemButton: {
    backgroundColor: '#007AFF', // Changed to iOS blue
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addItemButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    fontFamily: 'Roboto',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
    color: '#888',
    fontFamily: 'Roboto',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'right',
    fontFamily: 'Roboto',
  },
  cartSection: {
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 24, // Updated to match Order History title size
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  cartItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  cartItemText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  cartItemName: {
    fontSize: 16,
    flex: 1,
    fontFamily: 'Roboto',
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
    fontFamily: 'Roboto',
  },
  paymentSection: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingTop: 10,
  },
  paymentLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Roboto',
  },
  paymentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  changeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
    fontFamily: 'Roboto',
  },
  paidButton: {
    backgroundColor: '#4CD964',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paidButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    fontFamily: 'Roboto',
  },
  bottomButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  historyButton: {
    backgroundColor: '#007AFF', // Changed to iOS blue
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    fontFamily: 'Roboto',
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cartButton: {
    backgroundColor: '#007AFF', // Changed to iOS blue
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    fontFamily: 'Roboto',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Roboto',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    fontSize: 18,
    fontFamily: 'Roboto',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    padding: 15,
    borderRadius: 5,
    width: '48%',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  createButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  createButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  cartsButton: {
    backgroundColor: '#007AFF', // Changed to iOS blue
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cartsButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
    fontFamily: 'Roboto',
  },
  closeButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  closeButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  savedCartsSection: {
    marginTop: 20,
    marginBottom: 20,
  },
  savedCartItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
  },
  savedCartName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
  savedCartTotal: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
    fontFamily: 'Roboto',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
  },
});