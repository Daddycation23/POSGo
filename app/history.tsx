import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export default function History() {
  const orderHistory = useSelector((state: RootState) => state.orderHistory);

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
    <View style={styles.container}>
      <Text style={styles.title}>Order History</Text>
      <FlatList
        data={orderHistory}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.emptyText}>No order history</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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
  },
  cartName: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  amountPaid: {
    fontSize: 16,
    color: '#4CAF50',
    marginBottom: 2,
  },
  change: {
    fontSize: 16,
    color: '#2196F3',
    marginBottom: 10,
  },
  orderItemText: {
    fontSize: 14,
    marginBottom: 5,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
