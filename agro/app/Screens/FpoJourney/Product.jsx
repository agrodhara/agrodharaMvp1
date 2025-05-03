import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useApi } from '../../services/api';

const Products = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [loading, setLoading] = useState(false);
  const [productsData, setProductsData] = useState([]);
  const fpoId = route.params?.id || 1;
const api = useApi();
  console.log('Component rendered with FPO ID:', fpoId);
  console.log('Route params:', route.params);

  // Function to fetch products data
  const fetchProductsData = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for FPO ID:', fpoId);
      const response = await api.get(`/api/fpo/products/${fpoId}`);
      console.log('API Response:', response.data);
      
      // Convert object response to array, excluding 'success' and 'message' keys
      const productsArray = Object.entries(response.data)
        .filter(([key]) => !['success', 'message'].includes(key))
        .map(([_, value]) => value);
      
      console.log('Processed Products Array:', productsArray);
      setProductsData(productsArray);
    } catch (error) {
      console.error('Error fetching products data:', error);
      console.error('Error details:', error.response?.data || error.message);
      Alert.alert("Error", "Failed to load products data");
      setProductsData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching products...');
    fetchProductsData();
  }, [fpoId]);

  const renderProductItem = ({ item }) => {
    console.log('Rendering item:', item);
    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
          <Text style={styles.productName}>{item.product}</Text>
          <Text style={styles.variety}>{item.variety}</Text>
        </View>
        <View style={styles.productDetails}>
          <Text style={styles.detailText}>Quantity: {item.quantity} units</Text>
          <Text style={styles.detailText}>Grade: {item.grade}</Text>
          <Text style={styles.detailText}>Cost: ₹{item.cost_per_quantity}/unit</Text>
          <Text style={styles.detailText}>Total: ₹{item.total}</Text>
          {item.note && <Text style={styles.noteText}>Note: {item.note}</Text>}
        </View>
      </View>
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct', { id: fpoId })}
        >
          <Ionicons name="add-circle" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {productsData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No products found</Text>
        </View>
      ) : (
        <FlatList
          data={productsData}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productHeader: {
    marginBottom: 8,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  variety: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  productDetails: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default Products; 