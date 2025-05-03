import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Image, 
  TouchableOpacity, 
  ScrollView, 
  Modal, 
  TextInput,
  Alert,
  ActivityIndicator,
  StatusBar,
  Platform,
  Dimensions
} from 'react-native';
import { Linking } from 'react-native';
import { AntDesign, MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../_layout';
import { useApi } from '../../services/api';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../languagejsons/i18n';

const { width } = Dimensions.get('window');

const AddFarmer = () => {
  const route = useRoute();
  const { user } = useAuth();
  const fpoId = user?.id || route.params?.id;
  const params = useLocalSearchParams();
  const id = params.id;
  const refresh = params.refresh;
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [farmersData, setFarmersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const router = useRouter();
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const api = useApi();
  const navigation = useNavigation();
  const [language, setLanguage] = useState('en');

  // Load language from AsyncStorage
  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage) {
        setLanguage(storedLanguage);
        i18n.locale = storedLanguage;
      }
    };
    loadLanguage();
  }, []);

  // Update i18n locale when language changes
  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  // Fetch farmers data
  const fetchFarmersData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/fpo/farmers?fpo_id=${fpoId}`);
      
      const farmersArray = Object.entries(response.data)
        .filter(([key]) => !['success', 'message'].includes(key))
        .map(([_, value]) => value);
      
      setFarmersData(farmersArray);
    } catch (error) {
      console.error('Error fetching farmer data:', error);
      Alert.alert("Error", "Failed to load farmer data");
      setFarmersData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific farmer details
  const fetchFarmerDetails = async (farmerId) => {
    try {
      const response = await api.get(`/api/fpo/farmers/${farmerId}`);
      setSelectedFarmer(response.data);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching farmer details:', error);
      Alert.alert("Error", "Failed to load farmer details");
    }
  };

  // Fetch data on initial load and refresh
  useEffect(() => {
    if (fpoId) {
      fetchFarmersData();
    }
  }, [fpoId, refresh]);

  // Filter farmers based on search and status
  const filteredFarmers = farmersData.filter(farmer => {
    const matchesSearch = farmer.farmer_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus ? farmer.verification_status === selectedStatus : true;
    return matchesSearch && matchesStatus;
  });

  const handleStatusPress = (status) => {
    setSelectedStatus(status === selectedStatus ? null : status);
  };

  const getStatusButtonStyle = (status) => {
    if (status === 'verified') {
      return selectedStatus === 'verified' ? styles.activeVerifiedButton : styles.inactiveVerifiedButton;
    } else {
      return selectedStatus === 'Unverified' ? styles.activeUnverifiedButton : styles.inactiveUnverifiedButton;
    }
  };

  const getStatusButtonTextStyle = (status) => {
    return selectedStatus === status ? styles.activeStatusText : styles.inactiveStatusText;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.headerTitle}>{i18n.t('farmers.management')}</Text>
          <Text style={styles.headerSubtitle}>{i18n.t('farmers.fpoId')} {fpoId}</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={i18n.t('common.search')}
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
            <AntDesign name="close" size={16} color="#999" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Status Filter Buttons */}
      <View style={styles.statusContainer}>
        <TouchableOpacity
          style={[styles.statusButton, getStatusButtonStyle('verified')]}
          onPress={() => handleStatusPress('verified')}
        >
          <Text style={[styles.statusButtonText, getStatusButtonTextStyle('verified')]}>
            {i18n.t('farmers.verified')}
          </Text>
          {selectedStatus === 'verified' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.statusButton, getStatusButtonStyle('Unverified')]}
          onPress={() => handleStatusPress('Unverified')}
        >
          <Text style={[styles.statusButtonText, getStatusButtonTextStyle('Unverified')]}>
            {i18n.t('farmers.notVerified')}
          </Text>
          {selectedStatus === 'Unverified' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>

      {/* Farmer Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredFarmers.length} {i18n.t('farmers.farmersFound')}
        </Text>
      </View>

      {/* Farmers List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {filteredFarmers.length > 0 ? (
            filteredFarmers.map((farmer) => (
              <TouchableOpacity 
                key={farmer.farmer_id} 
                style={styles.card}
                onPress={() => fetchFarmerDetails(farmer.farmer_id)}
                activeOpacity={0.9}
              >
                <View style={styles.cardContent}>
                  {/* Farmer Avatar and Basic Info */}
                  <View style={styles.farmerHeader}>
                    <View style={styles.avatarContainer}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {farmer.farmer_name ? farmer.farmer_name.charAt(0).toUpperCase() : "F"}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.farmerInfo}>
                      <View style={styles.nameContainer}>
                        <Text style={styles.farmerName}>{farmer.farmer_name}</Text>
                        {farmer.verification_status === 'verified' && (
                          <View style={styles.verifiedBadge}>
                            <MaterialIcons name="verified" size={16} color="#fff" />
                          </View>
                        )}
                      </View>
                      <View style={styles.locationContainer}>
                        <Ionicons name="location-sharp" size={14} color="#666" />
                        <Text style={styles.farmerLocation} numberOfLines={1}>
                          {[farmer.village_name, farmer.district_name, farmer.state_name]
                            .filter(Boolean)
                            .join(', ') || "Location not specified"}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Farmer Details */}
                  <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{i18n.t('farmers.quantity')}</Text>
                        <Text style={styles.detailValue}>{farmer.total_quantity || '0'} MT</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{i18n.t('farmers.primaryCrop')}</Text>
                        <Text style={styles.detailValue}>{farmer.primary_crop || 'N/A'}</Text>
                      </View>
                    </View>
                    <View style={styles.detailRow}>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{i18n.t('farmers.area')}</Text>
                        <Text style={styles.detailValue}>
                          {farmer.total_plot_size || 'N/A'} {farmer.total_plot_unit || ''}
                        </Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>{i18n.t('farmers.lastUpdated')}</Text>
                        <Text style={styles.detailValue}>
                          {farmer.updated_at ? new Date(farmer.updated_at).toLocaleDateString() : 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionsContainer}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        if (farmer.contact_number) {
                          Alert.alert(
                            i18n.t('farmers.callFarmer'), 
                            `${i18n.t('farmers.callConfirm')} ${farmer.farmer_name}`, 
                            [
                              { text: i18n.t('common.cancel'), style: "cancel" },
                              {
                                text: i18n.t('common.call'),
                                onPress: () => Linking.openURL(`tel:${farmer.contact_number}`)
                              }
                            ]
                          );
                        } else {
                          Alert.alert(i18n.t('farmers.noPhone'), i18n.t('farmers.noPhoneMessage'));
                        }
                      }}
                    >
                      <Ionicons name="call" size={18} color="#4CAF50" />
                      <Text style={styles.actionButtonText}>{i18n.t('common.call')}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => router.push(`Screens/FpoJourney/EditFarmerProfile?id=${farmer.farmer_id}`)}
                    >
                      <FontAwesome name="pencil" size={18} color="#2196F3" />
                      <Text style={styles.actionButtonText}>{i18n.t('common.edit')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>{i18n.t('farmers.noFarmers')}</Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Add Farmer Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => navigation.replace('AddFarmerForm', { fpoId })}
        >
          <AntDesign name="plus" size={24} color="white" />
          <Text style={styles.fabText}>{i18n.t('farmers.addFarmer')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.fab, styles.bulkFab]}
          onPress={() => navigation.replace('Bulkfarmer', { fpoId })}
        >
          <MaterialIcons name="group-add" size={24} color="white" />
          <Text style={styles.fabText}>{i18n.t('farmers.bulkaddFarmer')}</Text>
        </TouchableOpacity>
      </View>

      {/* Farmer Details Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {selectedFarmer && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalAvatar}>
                    <Text style={styles.modalAvatarText}>
                      {selectedFarmer.farmer_name ? selectedFarmer.farmer_name.charAt(0).toUpperCase() : "F"}
                    </Text>
                  </View>
                  <Text style={styles.modalTitle}>{selectedFarmer.farmer_name}</Text>
                  {selectedFarmer.verification_status === 'verified' && (
                    <View style={styles.modalVerifiedBadge}>
                      <MaterialIcons name="verified" size={16} color="#fff" />
                      <Text style={styles.modalVerifiedText}>{i18n.t('farmers.verified')}</Text>
                    </View>
                  )}
                </View>

                <ScrollView style={styles.modalScroll}>
                  <View style={styles.modalSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="information-circle" size={20} color="#4CAF50" />
                      <Text style={styles.sectionTitle}>{i18n.t('farmers.basicInfo')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{i18n.t('farmers.contact')}</Text>
                      <Text style={styles.infoValue}>{selectedFarmer.contact_number || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{i18n.t('farmers.location')}</Text>
                      <Text style={styles.infoValue}>
                        {selectedFarmer.village_name}, {selectedFarmer.district_name}, {selectedFarmer.state_name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="stats-chart" size={20} color="#4CAF50" />
                      <Text style={styles.sectionTitle}>{i18n.t('farmers.farmingDetails')}</Text>
                    </View>
                    <View style={styles.doubleInfoRow}>
                      <View style={styles.halfRow}>
                        <Text style={styles.infoLabel}>{i18n.t('farmers.yearsFarming')}</Text>
                        <Text style={styles.infoValue}>{selectedFarmer.years_in_farming || 'N/A'}</Text>
                      </View>
                      <View style={styles.halfRow}>
                        <Text style={styles.infoLabel}>{i18n.t('farmers.soilTesting')}</Text>
                        <Text style={styles.infoValue}>
                          {selectedFarmer.soil_testing_done ? i18n.t('common.yes') : i18n.t('common.no')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>{i18n.t('farmers.paymentMethod')}</Text>
                      <Text style={styles.infoValue}>{selectedFarmer.preferred_payment_method || 'N/A'}</Text>
                    </View>
                  </View>

                  {selectedFarmer.crops && selectedFarmer.crops.length > 0 && (
                    <View style={styles.modalSection}>
                      <View style={styles.sectionHeader}>
                        <Ionicons name="leaf" size={20} color="#4CAF50" />
                        <Text style={styles.sectionTitle}>{i18n.t('farmers.crops')}</Text>
                      </View>
                      {selectedFarmer.crops.map((crop, index) => (
                        <View key={index} style={styles.cropItem}>
                          <Text style={styles.cropName}>
                            {crop.crop_variety} {crop.crop_sub_variety ? `(${crop.crop_sub_variety})` : ''}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </ScrollView>

                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.closeButtonText}>{i18n.t('common.close')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  clearSearchButton: {
    padding: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    position: 'relative',
  },
  activeVerifiedButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  inactiveVerifiedButton: {
    backgroundColor: 'transparent',
  },
  activeUnverifiedButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
  },
  inactiveUnverifiedButton: {
    backgroundColor: 'transparent',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeStatusText: {
    color: '#2c3e50',
  },
  inactiveStatusText: {
    color: '#95a5a6',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 3,
    width: '60%',
    height: 3,
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
  countContainer: {
    marginBottom: 12,
  },
  countText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  farmerInfo: {
    flex: 1,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginRight: 8,
  },
  verifiedBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  verifiedText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 2,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  farmerLocation: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 4,
    flexShrink: 1,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    width: '48%',
  },
  detailLabel: {
    fontSize: 12,
    color: '#95a5a6',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#34495e',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#bdc3c7',
    marginTop: 16,
    fontWeight: '500',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },
  fab: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 28,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  bulkFab: {
    backgroundColor: '#2196F3',
  },
  fabText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  modalAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalAvatarText: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
  },
  modalVerifiedBadge: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalVerifiedText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
  },
  modalScroll: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modalSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
  },
  infoRow: {
    marginBottom: 12,
  },
  doubleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfRow: {
    width: '48%',
  },
  infoLabel: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: '#34495e',
    fontWeight: '500',
  },
  cropItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  cropName: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddFarmer;