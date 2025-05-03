import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';



const EditProfile = () => {
  const { id } = useLocalSearchParams();
  const [farmerData, setFarmerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  // State for date pickers
  const [showSowingDatePicker, setShowSowingDatePicker] = useState(false);
  const [showHarvestDatePicker, setShowHarvestDatePicker] = useState(false);
  const [currentCropIndex, setCurrentCropIndex] = useState(0);
  
  // Available options
  const [availableCropVarieties] = useState(['Foxnuts (makhana)', 'Kalanamak rice']);
  
  const [availableSubVarieties] = useState({
    'Foxnuts (makhana)': [
      "Suta 3-4 (9-12.5mm)",
      "Suta 4-5 (12.5-15.5mm)",
      "Suta 4+ (Multi-Size) (12.5-24mm)",
      "Suta 5-6 Pure/HP (15.7-19mm)",
      "Suta 5+ Non-HP (15.75-24mm)",
      "Suta 5+ HP (15.75-24mm)",
      "Suta 6+ Non-HP (19-24mm)",
      "Suta 6+ HP (19-24mm)"
    ],
    'Kalanamak rice': [
      "KN3", "KN 207", "KN 208", "KN 209", "PUSA 1638", "PUSA 1652", "KIRAN"
    ]
  });

  const [availableGrades] = useState(['A', 'B', 'C', 'D']);
  const [availableFarmingTypes] = useState(['Organic', 'Conventional', 'Natural Farming', 'Integrated Farming', 'Mixed Farming']);

  useEffect(() => {
    const fetchFarmerData = async () => {
      try {
        const response = await fetch(`https://agrodhara-18yb.onrender.com/api/fpo/farmers/${id}`);
        const data = await response.json();
        if (data.success) {
          // Convert string dates to Date objects for the picker
          const cropsWithDateObjects = data.crops.map(crop => ({
            ...crop,
            sowing_date: crop.sowing_date ? new Date(crop.sowing_date) : null,
            harvest_date: crop.harvest_date ? new Date(crop.harvest_date) : null
          }));
          setFarmerData({ ...data, crops: cropsWithDateObjects });
        } else {
          setError('Failed to load farmer data');
        }
      } catch (error) {
        console.error('Error fetching farmer data:', error);
        setError('Error loading data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchFarmerData();
  }, [id]);

  const handleUpdate = async () => {
    try {
      // Convert Date objects back to strings for the API
      const dataToSend = {
        ...farmerData,
        crops: farmerData.crops.map(crop => ({
          ...crop,
          sowing_date: crop.sowing_date ? crop.sowing_date.toISOString() : null,
          harvest_date: crop.harvest_date ? crop.harvest_date.toISOString() : null
        }))
      };

      const response = await fetch(`https://agrodhara-18yb.onrender.com/api/fpo/farmers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert('Farmer profile updated successfully!');
        router.replace('Screens/FpoJourney/AddFarmer');
      } else {
        alert('Failed to update farmer profile.');
      }
    } catch (error) {
      console.error('Error updating farmer data:', error);
      alert('Error updating profile. Please try again.');
    }
  };

  const handleCropChange = (index, field, value) => {
    const updatedCrops = [...farmerData.crops];
    updatedCrops[index][field] = value;
    setFarmerData({ ...farmerData, crops: updatedCrops });
  };

  const addCrop = () => {
    const newCrop = {
      crop_variety: '',
      crop_sub_variety: '',
      grade: 'A',
      sowing_date: null,
      farming_type: 'Organic',
      harvest_date: null,
      expected_harvest_quantity: '',
    };
    setFarmerData({ 
      ...farmerData, 
      crops: [...farmerData.crops, newCrop] 
    });
  };

  const deleteCrop = (index) => {
    const updatedCrops = farmerData.crops.filter((_, i) => i !== index);
    setFarmerData({ ...farmerData, crops: updatedCrops });
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const onDateChange = (event, selectedDate, field) => {
    const updatedCrops = [...farmerData.crops];
    
    if (field === 'sowing_date') {
      setShowSowingDatePicker(false);
      if (selectedDate) {
        updatedCrops[currentCropIndex].sowing_date = selectedDate;
      }
    } else if (field === 'harvest_date') {
      setShowHarvestDatePicker(false);
      if (selectedDate) {
        updatedCrops[currentCropIndex].harvest_date = selectedDate;
      }
    }
    
    setFarmerData({ ...farmerData, crops: updatedCrops });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading farmer data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  if (!farmerData) {
    return (
      <View style={styles.center}>
        <Text style={styles.noDataText}>No farmer data found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Edit Farmer Profile</Text>
        <View style={styles.headerDivider} />
      </View>

      {/* Basic Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="person" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Basic Information</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Farmer Name</Text>
          <TextInput
            style={styles.input}
            value={farmerData.farmer_name || ''}
            onChangeText={(text) => setFarmerData({ ...farmerData, farmer_name: text })}
            placeholder="Enter farmer name"
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Contact Number</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={farmerData.contact_number || ''}
            onChangeText={(text) => setFarmerData({ ...farmerData, contact_number: text })}
            keyboardType="phone-pad"
            editable={false}
            placeholder="Contact number"
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>House Number</Text>
          <TextInput
            style={styles.input}
            value={farmerData.house_number || ''}
            onChangeText={(text) => setFarmerData({ ...farmerData, house_number: text })}
            placeholder="Enter house number"
            placeholderTextColor="#aaa"
          />
        </View>
      </View>

      {/* Location Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="location-on" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Location Information</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Village Name</Text>
          <TextInput
            style={styles.input}
            value={farmerData.village_name || ''}
            onChangeText={(text) => setFarmerData({ ...farmerData, village_name: text })}
            placeholder="Enter village name"
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Gram Panchayat</Text>
          <TextInput
            style={styles.input}
            value={farmerData.gram_panchayat || ''}
            onChangeText={(text) => setFarmerData({ ...farmerData, gram_panchayat: text })}
            placeholder="Enter gram panchayat"
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Block</Text>
          <TextInput
            style={styles.input}
            value={farmerData.block || ''}
            onChangeText={(text) => setFarmerData({ ...farmerData, block: text })}
            placeholder="Enter block"
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>District</Text>
          <TextInput
            style={styles.input}
            value={farmerData.district_name || ''}
            onChangeText={(text) => setFarmerData({ ...farmerData, district_name: text })}
            placeholder="Enter district"
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>State</Text>
          <TextInput
            style={styles.input}
            value={farmerData.state_name || ''}
            onChangeText={(text) => setFarmerData({ ...farmerData, state_name: text })}
            placeholder="Enter state"
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pincode</Text>
          <TextInput
            style={styles.input}
            value={farmerData.pincode || ''}
            onChangeText={(text) => setFarmerData({ ...farmerData, pincode: text })}
            keyboardType="numeric"
            placeholder="Enter pincode"
            placeholderTextColor="#aaa"
          />
        </View>
      </View>

      {/* Farming Experience */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="work" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Farming Experience</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Years in Farming</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={farmerData.years_in_farming || '1-5'}
              onValueChange={(itemValue) => setFarmerData({ ...farmerData, years_in_farming: itemValue })}
              style={styles.picker}
              dropdownIconColor="#4CAF50">
              <Picker.Item label="1-5 years" value="1-5" />
              <Picker.Item label="6-10 years" value="6-10" />
              <Picker.Item label="11+ years" value="11+" />
            </Picker>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Years in Growing Crop</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={farmerData.years_in_growing_crop || '1-5'}
              onValueChange={(itemValue) => setFarmerData({ ...farmerData, years_in_growing_crop: itemValue })}
              style={styles.picker}
              dropdownIconColor="#4CAF50">
              <Picker.Item label="1-5 years" value="1-5" />
              <Picker.Item label="6-10 years" value="6-10" />
              <Picker.Item label="11+ years" value="11+" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Land Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="landscape" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Land Information</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Total Plot Size</Text>
          <TextInput
            style={styles.input}
            value={farmerData.total_plot_size || ''}
            onChangeText={(text) => setFarmerData({ ...farmerData, total_plot_size: text })}
            keyboardType="numeric"
            placeholder="Enter plot size"
            placeholderTextColor="#aaa"
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Plot Unit</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={farmerData.total_plot_unit || 'Acre'}
              onValueChange={(itemValue) => setFarmerData({ ...farmerData, total_plot_unit: itemValue })}
              style={styles.picker}
              dropdownIconColor="#4CAF50">
              <Picker.Item label="Acre" value="Acre" />
              <Picker.Item label="Hectare" value="Hectare" />
              <Picker.Item label="Bigha" value="Bigha" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Soil Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="grass" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Soil Information</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Soil Testing Done</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={farmerData.soil_testing_done || 'No'}
              onValueChange={(itemValue) => setFarmerData({ ...farmerData, soil_testing_done: itemValue })}
              style={styles.picker}
              dropdownIconColor="#4CAF50">
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Open to Soil Testing</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={farmerData.open_to_soil_testing || 'No'}
              onValueChange={(itemValue) => setFarmerData({ ...farmerData, open_to_soil_testing: itemValue })}
              style={styles.picker}
              dropdownIconColor="#4CAF50">
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Calamity Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="warning" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Calamity Information</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Prone to Calamities</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={farmerData.prone_to_calamities || 'No'}
              onValueChange={(itemValue) => setFarmerData({ ...farmerData, prone_to_calamities: itemValue })}
              style={styles.picker}
              dropdownIconColor="#4CAF50">
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>
          </View>
        </View>
        {farmerData.prone_to_calamities === "Yes" && (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Calamity Type</Text>
              <TextInput
                style={styles.input}
                value={farmerData.calamity_type || ''}
                onChangeText={(text) => setFarmerData({ ...farmerData, calamity_type: text })}
                placeholder="Enter calamity type"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Impact Duration (days)</Text>
              <TextInput
                style={styles.input}
                value={farmerData.impact_duration_days?.toString() || ''}
                onChangeText={(text) => setFarmerData({ ...farmerData, impact_duration_days: parseInt(text) || 0 })}
                keyboardType="numeric"
                placeholder="Enter duration in days"
                placeholderTextColor="#aaa"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Impact Severity</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={farmerData.impact_severity || 'Low'}
                  onValueChange={(itemValue) => setFarmerData({ ...farmerData, impact_severity: itemValue })}
                  style={styles.picker}
                  dropdownIconColor="#4CAF50">
                  <Picker.Item label="Low" value="Low" />
                  <Picker.Item label="Medium" value="Medium" />
                  <Picker.Item label="High" value="High" />
                </Picker>
              </View>
            </View>
          </>
        )}
      </View>

      {/* Farming Practices */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="agriculture" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Farming Practices</Text>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Willing to Adopt Sustainable Farming</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={farmerData.willing_to_adopt_sustainable_farming || 'No'}
              onValueChange={(itemValue) => setFarmerData({ ...farmerData, willing_to_adopt_sustainable_farming: itemValue })}
              style={styles.picker}
              dropdownIconColor="#4CAF50">
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Participates in Govt Schemes</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={farmerData.participates_in_govt_schemes || 'No'}
              onValueChange={(itemValue) => setFarmerData({ ...farmerData, participates_in_govt_schemes: itemValue })}
              style={styles.picker}
              dropdownIconColor="#4CAF50">
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>
          </View>
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Preferred Payment Method</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={farmerData.preferred_payment_method || 'Cash'}
              onValueChange={(itemValue) => setFarmerData({ ...farmerData, preferred_payment_method: itemValue })}
              style={styles.picker}
              dropdownIconColor="#4CAF50">
              <Picker.Item label="Cash" value="Cash" />
              <Picker.Item label="Bank Transfer" value="Bank Transfer" />
              <Picker.Item label="Digital Wallets" value="Digital Wallets" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Crops Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons name="spa" size={20} color="#4CAF50" />
          <Text style={styles.sectionTitle}>Crops Information</Text>
        </View>
        
        {farmerData.crops && farmerData.crops.length > 0 ? (
          farmerData.crops.map((crop, index) => (
            <View key={index} style={styles.cropSection}>
              <View style={styles.cropHeader}>
                <Text style={styles.cropTitle}>Crop {index + 1}</Text>
                <TouchableOpacity onPress={() => deleteCrop(index)} style={styles.deleteButton}>
                  <MaterialIcons name="delete" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Crop Variety</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={crop.crop_variety || ''}
                    onValueChange={(itemValue) => {
                      handleCropChange(index, 'crop_variety', itemValue);
                      // Reset sub-variety when variety changes
                      handleCropChange(index, 'crop_sub_variety', '');
                    }}
                    style={styles.picker}
                    dropdownIconColor="#4CAF50">
                    <Picker.Item label="Select Crop Variety" value="" />
                    {availableCropVarieties.map((variety) => (
                      <Picker.Item key={variety} label={variety} value={variety} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Crop Sub Variety</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={crop.crop_sub_variety || ''}
                    onValueChange={(itemValue) => handleCropChange(index, 'crop_sub_variety', itemValue)}
                    enabled={!!crop.crop_variety}
                    style={styles.picker}
                    dropdownIconColor="#4CAF50">
                    <Picker.Item label={crop.crop_variety ? "Select Sub Variety" : "Select Crop Variety First"} value="" />
                    {crop.crop_variety && availableSubVarieties[crop.crop_variety]?.map((subVariety) => (
                      <Picker.Item key={subVariety} label={subVariety} value={subVariety} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Grade</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={crop.grade || 'A'}
                    onValueChange={(itemValue) => handleCropChange(index, 'grade', itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#4CAF50">
                    {availableGrades.map((grade) => (
                      <Picker.Item key={grade} label={grade} value={grade} />
                    ))}
                  </Picker>
                </View>
              </View>
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Farming Type</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={crop.farming_type || 'Organic'}
                    onValueChange={(itemValue) => handleCropChange(index, 'farming_type', itemValue)}
                    style={styles.picker}
                    dropdownIconColor="#4CAF50">
                    {availableFarmingTypes.map((type) => (
                      <Picker.Item key={type} label={type} value={type} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Sowing Date</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setCurrentCropIndex(index);
                    setShowSowingDatePicker(true);
                  }}
                  style={styles.dateInput}>
                  <Text style={crop.sowing_date ? styles.dateText : styles.placeholderText}>
                    {crop.sowing_date ? formatDate(crop.sowing_date) : 'Select Sowing Date'}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color="#4CAF50" />
                </TouchableOpacity>
                {showSowingDatePicker && currentCropIndex === index && (
                  <DateTimePicker
                    value={crop.sowing_date || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => onDateChange(event, date, 'sowing_date')}
                    accentColor="#4CAF50"
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Harvest Date</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setCurrentCropIndex(index);
                    setShowHarvestDatePicker(true);
                  }}
                  style={styles.dateInput}>
                  <Text style={crop.harvest_date ? styles.dateText : styles.placeholderText}>
                    {crop.harvest_date ? formatDate(crop.harvest_date) : 'Select Harvest Date'}
                  </Text>
                  <MaterialIcons name="calendar-today" size={20} color="#4CAF50" />
                </TouchableOpacity>
                {showHarvestDatePicker && currentCropIndex === index && (
                  <DateTimePicker
                    value={crop.harvest_date || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, date) => onDateChange(event, date, 'harvest_date')}
                    accentColor="#4CAF50"
                  />
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Expected Harvest Quantity</Text>
                <View style={styles.quantityInput}>
                  <TextInput
                    style={[styles.input, styles.quantityTextInput]}
                    value={crop.expected_harvest_quantity || ''}
                    onChangeText={(text) => handleCropChange(index, 'expected_harvest_quantity', text)}
                    keyboardType="numeric"
                    placeholder="Enter expected quantity"
                    placeholderTextColor="#aaa"
                  />
                  <Text style={styles.quantityUnit}>kg</Text>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noCropsContainer}>
            <FontAwesome name="leaf" size={24} color="#aaa" />
            <Text style={styles.noCropsText}>No crops information available</Text>
          </View>
        )}
        
        <TouchableOpacity onPress={addCrop} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Crop</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleUpdate} style={styles.updateButton}>
        <Text style={styles.updateButtonText}>Update Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f9f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f9f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#4CAF50',
    fontSize: 16,
  },
  noDataText: {
    color: '#666',
    fontSize: 16,
  },
  error: {
    color: '#f44336',
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerDivider: {
    height: 2,
    backgroundColor: '#E8F5E9',
    marginHorizontal: 40,
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8F5E9',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#333',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#888',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 48,
    width: '100%',
    color: '#333',
  },
  cropSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F1F8E9',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#8BC34A',
  },
  cropHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cropTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateText: {
    color: '#333',
    fontSize: 15,
  },
  placeholderText: {
    color: '#aaa',
    fontSize: 15,
  },
  quantityInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityTextInput: {
    flex: 1,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  quantityUnit: {
    height: 48,
    paddingHorizontal: 12,
    backgroundColor: '#E8F5E9',
    color: '#2E7D32',
    textAlign: 'center',
    textAlignVertical: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    borderWidth: 1,
    borderLeftWidth: 0,
    borderColor: '#E0E0E0',
  },
  noCropsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noCropsText: {
    marginTop: 8,
    color: '#888',
    fontSize: 14,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#f44336',
    padding: 8,
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
    textAlign: 'center',
  },















  
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D8E8D8",
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  picker: {
    height: 54, 
    width: '100%',
    color: "#1A3A1A",
  },
  pickerItem: {
    fontSize: 17,
    color: "#1A3A1A",
    
  },
});

export default EditProfile;