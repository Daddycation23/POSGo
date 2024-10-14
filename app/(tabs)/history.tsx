import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TextInput, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { AntDesign } from '@expo/vector-icons';

export default function History() {
  const orderHistory = useSelector((state: RootState) => state.orderHistory);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = orderHistory.filter(order => 
    order.cartName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderOrderItem = ({ item }: { item: any }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderDate}>{new Date(item.date).toLocaleString()}</Text>
      <Text style={styles.cartName}>Cart: {item.cartName}</Text>
      <Text style={styles.orderTotal}>Total: ${item.total.toFixed(2)}</Text>
      <Text style={styles.amountPaid}>Amount Paid: ${item.amountPaid.toFixed(2)}</Text>
      <Text style={styles.change}>Change: ${item.change.toFixed(2)}</Text>
      <FlatList
        data={item.items}
        renderItem={({ item: orderItem }: { item: any }) => (
          <Text style={styles.orderItemText}>
            {orderItem.name} x{orderItem.quantity} - ${(orderItem.price * orderItem.quantity).toFixed(2)}
          </Text>
        )}
        keyExtractor={(orderItem) => orderItem.id}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.stickyHeader}>
        <Text style={styles.title}>Order History</Text>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <AntDesign name="search1" size={20} color="#888" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search orders..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.spacer} />
        {filteredHistory.length > 0 ? (
          <FlatList
            data={filteredHistory}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Text style={styles.emptyText}>No order history found</Text>
        )}
      </ScrollView>
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
    height: 20, // Add some space between the sticky header and the first order item
  },
  title: {
    fontSize: 24, // Ensuring it matches the Menu Items title size
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Roboto',
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
  orderItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    marginBottom: 10,
    borderRadius: 5,
  },
  orderDate: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Roboto',
  },
  cartName: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 5,
    fontFamily: 'Roboto',
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    fontFamily: 'Roboto',
  },
  amountPaid: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 2,
    fontFamily: 'Roboto',
  },
  change: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 10,
    fontFamily: 'Roboto',
  },
  orderItemText: {
    fontSize: 14,
    marginBottom: 5,
    fontFamily: 'Roboto',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Roboto',
  },
});
