import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, SafeAreaView, Image, Modal, FlatList } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { removeMenuItem } from '../../store/menuSlice';
import { loadCart, addCart } from '../../store/cartSlice';
import { RootState } from '../../store';
import { useRouter } from 'expo-router';
import { MenuItem } from '../../store/menuSlice';
import { AntDesign, Ionicons, MaterialIcons } from '@expo/vector-icons';

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

  const renderMenuItem = ({ item }: { item: MenuItem }) => (
    <View style={styles.productItem}>
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
    setIsNewCartModalVisible(true);
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
      router.push({ pathname: '/carts', params: { name: newCartName.trim() } });
      setIsNewCartModalVisible(false);
      setNewCartName('');
    } else {
      Alert.alert('Error', 'Please enter a name for the cart');
    }
  };

  const handleOpenCart = (cartName: string) => {
    dispatch(loadCart(cartName));
    router.push({ pathname: '/carts', params: { name: cartName } });
  };

  const handleOpenSavedCarts = () => {
    if (savedCarts.length === 0) {
      Alert.alert("No Saved Carts", "You don't have any saved carts.");
    } else {
      setIsCartsModalVisible(true);
    }
  };

  const renderSavedCartItem = ({ item }: { item: Cart }) => (
    <TouchableOpacity style={styles.savedCartItem} onPress={() => handleOpenCart(item.name)}>
      <Text style={styles.savedCartName}>{item.name}</Text>
      <Text style={styles.savedCartTotal}>Total: ${item.total.toFixed(2)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Home</Text>
          {menu.length > 0 ? (
            menu.map((item) => renderMenuItem({ item }))
          ) : (
            <Text style={styles.emptyText}>No menu items. Add some!</Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.addItemButton} onPress={() => router.push('/add-item')}>
          <AntDesign name="pluscircle" size={24} color="white" />
          <Text style={styles.addItemButtonText}>Add New Menu</Text>
        </TouchableOpacity>
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
        <TouchableOpacity style={styles.historyButton} onPress={() => router.push('/history')}>
          <MaterialIcons name="history" size={24} color="white" />
          <Text style={styles.historyButtonText}>Order History</Text>
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
                onPress={() => setIsNewCartModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateCart}
              >
                <Text style={styles.modalButtonText}>Create</Text>
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
            <FlatList
              data={savedCarts}
              renderItem={renderSavedCartItem}
              keyExtractor={(item) => item.name}
              ListEmptyComponent={<Text style={styles.emptyText}>No saved carts</Text>}
            />
            <TouchableOpacity
              style={[styles.modalButton, styles.closeButton]}
              onPress={() => setIsCartsModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
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
  container: {
    flex: 1,
    padding: 10,
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
  },
  productPrice: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
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
    fontSize: 24, // Larger font size
    fontWeight: 'bold',
    textAlign: 'center',
  },
  addItemButton: {
    backgroundColor: '#34C759',
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
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
    color: '#888',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'right',
  },
  cartSection: {
    marginBottom: 20,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  menuSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 10,
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
  },
  cartItemName: {
    fontSize: 16,
    flex: 1,
  },
  cartItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
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
  },
  paymentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  changeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
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
    backgroundColor: '#007AFF',
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
  },
  cartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cartButton: {
    backgroundColor: '#FF9500',
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
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    fontSize: 18,
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
    backgroundColor: '#FF3B30',
  },
  createButton: {
    backgroundColor: '#4CD964',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartsButton: {
    backgroundColor: '#5856D6',
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
  },
  closeButton: {
    backgroundColor: '#FF9500',
    marginTop: 15,
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
  },
  savedCartTotal: {
    fontSize: 16,
    color: '#888',
    marginTop: 5,
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
  },
});