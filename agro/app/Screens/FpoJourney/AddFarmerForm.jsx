import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { AntDesign, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useApi } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../../languagejsons/i18n'; // Importing the i18n instance

const FarmerForm = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const fpoId = params.fpoId || 'Unknown';
  const onSuccess = params.onSuccess;




  const [language, setLanguage] = useState('en'); // Default to English

  // Load language from AsyncStorage on component mount
  useEffect(() => {
    const loadLanguage = async () => {
      const storedLanguage = await AsyncStorage.getItem('language');
      if (storedLanguage) {
        setLanguage(storedLanguage);
        i18n.locale = storedLanguage; // Set the locale for i18n
      } else {
        console.log('No language set, defaulting to English');
      }
    };
    loadLanguage();
  }, []);

  // Update i18n locale when language state changes
  useEffect(() => {
    i18n.locale = language; // Set the current locale
  }, [language]);



const api = useApi();
  const [showSowingPicker, setShowSowingPicker] = useState(false);
  const [showHarvestPicker, setShowHarvestPicker] = useState(false);
  const [formData, setFormData] = useState({
    fpo_id: fpoId,
    farmer_name: '',
    contact_number: '',
    village_name: '',
    house_number: '',
    gram_panchayat: '',
    district_name: '',
    state_name: '',
    pincode: '',
    block: '',
    years_in_farming: '',
    years_in_growing_crop: '',


    total_plot_size: '',
    total_plot_unit: '',
    soil_testing_done: '',
    open_to_soil_testing: '',


    prone_to_calamities: '',
    calamity_type: '',
    impact_duration_days: '',
    impact_severity: '',


    willing_to_adopt_sustainable_farming: '',
    participates_in_govt_schemes: '',
    preferred_payment_method: '',
  });

  // Add state to track if location fields are editable
  const [locationFieldsEditable, setLocationFieldsEditable] = useState({
    district_name: false,
    state_name: false,
    block: false
  });

  // New state for managing crops
  const [crops, setCrops] = useState([]);
  const [newCrop, setNewCrop] = useState({
    crop_variety: '',
    crop_sub_variety: '',
    grade: '',
    sowing_date: new Date(),
    farming_type: '',
    harvest_date: new Date(),
    expected_harvest_quantity: '',
  });
  const [showCropSowingPicker, setShowCropSowingPicker] = useState(false);
  const [showCropHarvestPicker, setShowCropHarvestPicker] = useState(false);
  const [availableCropVarieties, setAvailableCropVarieties] = useState({
    en: ['Foxnuts (makhana)', 'Kalanamak rice'],
    hi: ['फॉक्सनट्स (मखाना)', 'कलानामक चावल']
  });
  
  const [availableSubVarieties, setAvailableSubVarieties] = useState({
    en: {
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
    },
    hi: {
      'फॉक्सनट्स (मखाना)': [
        "सूता 3-4 (9-12.5 मिमी)",
        "सूता 4-5 (12.5-15.5 मिमी)",
        "सूता 4+ (मल्टी-साइज़) (12.5-24 मिमी)",
        "सूता 5-6 प्योर/HP (15.7-19 मिमी)",
        "सूता 5+ नॉन-HP (15.75-24 मिमी)",
        "सूता 5+ HP (15.75-24 मिमी)",
        "सूता 6+ नॉन-HP (19-24 मिमी)",
        "सूता 6+ HP (19-24 मिमी)"
      ],
      'कलानामक चावल': [
        "KN3", "KN 207", "KN 208", "KN 209", "PUSA 1638", "PUSA 1652", "KIRAN"
      ]
    }
  });

  const [availableGrades] = useState(['A', 'B', 'C', 'D']);
  const availableFarmingTypes = {
    en: ['Organic', 'Conventional', 'Natural Farming', 'Integrated Farming', 'Mixed Farming'],
    hi: ['जैविक', 'परंपरागत', 'प्राकृतिक खेती', 'एकीकृत खेती', 'मिश्रित खेती']
  };
  // Function to get the correct farming types based on the selected language
const getFarmingTypes = () => {
  return language === 'hi' ? availableFarmingTypes.hi : availableFarmingTypes.en;
};

  const cropSubVarieties = {
    'Foxnuts(makhana)': [
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
      "KN3",
      "KN 207",
      "KN 208",
      "KN 209",
      "PUSA 1638",
      "PUSA 1652",
      "KIRAN"
    ]
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });

    if (name === 'pincode' && value.length === 6) {
      fetchLocationDetails(value);
    }
  };

  const handleDateChange = (event, selectedDate, type) => {
    const currentDate = selectedDate || formData[type];
    setShowSowingPicker(false);
    setShowHarvestPicker(false);
    handleChange(type, currentDate);
  };
  console.log('newCrop.crop_variety:', newCrop.crop_variety);
  // Function to handle crop date changes
  const handleCropDateChange = (event, selectedDate, type) => {
    const currentDate = selectedDate || newCrop[type];
    setShowCropSowingPicker(false);
    setShowCropHarvestPicker(false);
    setNewCrop({ ...newCrop, [type]: currentDate });
  };

  // Function to add a new crop
  const addCrop = () => {
    console.log('Add Crop button clicked');
    console.log('Current crop data:', newCrop);
    
    if (newCrop.crop_variety && newCrop.crop_sub_variety && newCrop.grade && 
        newCrop.sowing_date && newCrop.farming_type && newCrop.harvest_date) {
      console.log('All required fields are filled, adding crop');
      
      const newCropWithId = { ...newCrop, id: Date.now() };
      console.log('New crop with ID:', newCropWithId);
      
      setCrops(prevCrops => {
        console.log('Previous crops:', prevCrops);
        const updatedCrops = [...prevCrops, newCropWithId];
        console.log('Updated crops:', updatedCrops);
        return updatedCrops;
      });
      
      // Remove the added crop combination from available options
      const updatedSubVarieties = { ...availableSubVarieties };
      const cropVarietyList = updatedSubVarieties[language][newCrop.crop_variety];
      
      if (cropVarietyList) {
        updatedSubVarieties[language][newCrop.crop_variety] = cropVarietyList.filter(
          subVariety => subVariety !== newCrop.crop_sub_variety
        );
      } else {
        console.warn('No sub-varieties found for selected crop variety:', newCrop.crop_variety);
      }

      
      
      ;

if (updatedSubVarieties[language][newCrop.crop_variety]?.length === 0) {
  // Remove from crop varieties too
  const updatedCropVarieties = availableCropVarieties[language].filter(
    variety => variety !== newCrop.crop_variety
  );
  
  setAvailableCropVarieties(prev => ({
    ...prev,
    [language]: updatedCropVarieties
  }));
} else {
  setAvailableSubVarieties(updatedSubVarieties);
}
      
      // Reset the new crop form
      setNewCrop({
        crop_variety: '',
        crop_sub_variety: '',
        grade: '',
        sowing_date: new Date(),
        farming_type: '',
        harvest_date: new Date(),
        expected_harvest_quantity: '',
      });
      
      console.log('Crop added successfully');
    } else {
      console.log('Missing required fields:', {
        crop_variety: !newCrop.crop_variety,
        crop_sub_variety: !newCrop.crop_sub_variety,
        grade: !newCrop.grade,
        sowing_date: !newCrop.sowing_date,
        farming_type: !newCrop.farming_type,
        harvest_date: !newCrop.harvest_date
      });
      Alert.alert('Error', 'Please fill all required crop details');
    }
  };

  // Function to remove a crop
 const removeCrop = (cropId) => {
  const cropToRemove = crops.find(crop => crop.id === cropId);
  if (!cropToRemove) return;

  const cropVariety = cropToRemove.crop_variety;
  const cropSubVariety = cropToRemove.crop_sub_variety;

  // Update sub-varieties
  const updatedSubVarieties = { ...availableSubVarieties };
  const subList = updatedSubVarieties[language][cropVariety] || [];

  if (!subList.includes(cropSubVariety)) {
    updatedSubVarieties[language][cropVariety] = [...subList, cropSubVariety];
  }

  // Update crop varieties
  if (!availableCropVarieties[language].includes(cropVariety)) {
    setAvailableCropVarieties({
      ...availableCropVarieties,
      [language]: [...availableCropVarieties[language], cropVariety]
    });
  }

  setAvailableSubVarieties(updatedSubVarieties);
  setCrops(crops.filter(crop => crop.id !== cropId));
};
  

  // Function to handle crop form changes
  const handleCropChange = (name, value) => {
    setNewCrop({ ...newCrop, [name]: value });
    
    // Reset sub-variety when crop variety changes
    if (name === 'crop_variety') {
      setNewCrop({ ...newCrop, crop_variety: value, crop_sub_variety: '' });
    }
  };

  const handleSubmit = async () => {
    try {
      // Format dates as YYYY-MM-DD for MySQL
      const formatDate = (date) => {
        if (!date) return null;
        return date.toISOString().split('T')[0];
      };

      console.log('Form data before submission:', formData);

      // Send formData to the API - FIXED: Remove the extra object wrapper
      const farmerRes = await api.post('/api/fpo/farmers', formData);

      if (!farmerRes.data.success) {
        throw new Error(farmerRes.data.message || 'Failed to submit form data');
      }
      
      const farmerId = farmerRes.data.id; // Get the new farmer ID from the response

      // Prepare crop data for submission
      const cropData = crops.map(crop => ({
        fpo_id: parseInt(formData.fpo_id) || 0,
        farmer_id: farmerId,
        crop_variety: crop.crop_variety,
        crop_sub_variety: crop.crop_sub_variety,
        grade: crop.grade,
        sowing_date: formatDate(crop.sowing_date),
        farming_type: crop.farming_type,
        harvest_date: formatDate(crop.harvest_date),
        expected_harvest_quantity: parseFloat(crop.expected_harvest_quantity) || 0
      }));

      // Submit crop data - FIXED: Remove the extra object wrapper
      const cropRes = await api.post('/api/fpo/farmers/farmer-crops', cropData);

      if (!cropRes.data.success) {
        throw new Error(cropRes.data.message || 'Failed to submit crop data');
      }

      console.log('Success!');
      console.log('Farmer data being submitted:', formData);
      console.log('Crop data being submitted:', cropData);
      
      // Use ONLY Expo Router for navigation
      router.replace(`/Screens/FpoJourney/AddFarmer?refresh=${new Date().getTime()}`);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      Alert.alert('Error', error.message || 'Failed to submit farmer data');
    }
  };

  const fetchLocationDetails = async (pincode) => {
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (
        data[0]?.Status === 'Success' &&
        data[0]?.PostOffice &&
        data[0].PostOffice.length > 0
      ) {
        const location = data[0].PostOffice[0];

        setFormData(prev => ({
          ...prev,
          block: location.Block || '',
          district_name: location.District || '',
          state_name: location.State || '',
        }));
        
        // Set location fields as read-only since we got valid data
        setLocationFieldsEditable({
          district_name: false,
          state_name: false,
          block: false
        });
      } else {
        // Set location fields as editable since we didn't get valid data
        setLocationFieldsEditable({
          district_name: true,
          state_name: true,
          block: true
        });
        
        // You may want to clear or alert the user
        console.warn('Invalid or not found pincode.');
      }
    } catch (error) {
      console.error('Failed to fetch location data', error);
      
      // Set location fields as editable since we got an error
      setLocationFieldsEditable({
        district_name: true,
        state_name: true,
        block: true
      });
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t('addFarmer.title')}</Text>
        <Text style={styles.headerSubtitle}>{i18n.t('addFarmer.fpoId')} {fpoId}</Text>
      </View>

      {/* Farmer Details Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <MaterialCommunityIcons name="account-details" size={22} color="#2B7A0B" />
          <Text style={styles.sectionTitle}>{i18n.t('addFarmer.farmerDetails')}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.farmerName')}</Text>
            <TextInput
              placeholder="Enter farmer's full name"
              value={formData.farmer_name}
              onChangeText={(text) => handleChange('farmer_name', text)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.contactNumber')}</Text>
            <TextInput
              placeholder="Enter 10-digit mobile number"
              value={formData.contact_number}
              keyboardType="phone-pad"
              onChangeText={(text) => handleChange('contact_number', text)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.houseNumber')}</Text>
            <TextInput
              placeholder="Enter house number"
              value={formData.house_number}
              onChangeText={(text) => handleChange('house_number', text)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.villageName')}</Text>
            <TextInput
              placeholder="Enter village name"
              value={formData.village_name}
              onChangeText={(text) => handleChange('village_name', text)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.gramPanchayat')}</Text>
            <TextInput
              placeholder="Enter Gram Panchayat"
              value={formData.gram_panchayat}
              onChangeText={(text) => handleChange('gram_panchayat', text)}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.pincode')}</Text>
            <TextInput
              placeholder="Enter Pincode"
              value={formData.pincode}
              onChangeText={(text) => handleChange('pincode', text)}
              style={styles.input}
              keyboardType="numeric"
              maxLength={6}
            />
            <Text style={styles.helperText}>Enter 6-digit pincode to auto-fill location details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.block')}</Text>
            <TextInput
              placeholder="Enter block name"
              value={formData.block}
              onChangeText={(text) => handleChange('block', text)}
              style={[
                styles.input,
                !locationFieldsEditable.block && styles.readOnlyInput
              ]}
              editable={locationFieldsEditable.block}
            />
            {!locationFieldsEditable.block && (
              <Text style={styles.helperText}>This field is auto-filled based on pincode</Text>
            )}
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.districtName')}</Text>
            <TextInput
              placeholder="Enter district name"
              value={formData.district_name}
              onChangeText={(text) => handleChange('district_name', text)}
              style={[
                styles.input,
                !locationFieldsEditable.district_name && styles.readOnlyInput
              ]}
              editable={locationFieldsEditable.district_name}
            />
            {!locationFieldsEditable.district_name && (
              <Text style={styles.helperText}>This field is auto-filled based on pincode</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.stateName')}</Text>
            <TextInput
              placeholder="Enter state name"
              value={formData.state_name}
              onChangeText={(text) => handleChange('state_name', text)}
              style={[
                styles.input,
                !locationFieldsEditable.state_name && styles.readOnlyInput
              ]}
              editable={locationFieldsEditable.state_name}
            />
            {!locationFieldsEditable.state_name && (
              <Text style={styles.helperText}>This field is auto-filled based on pincode</Text>
            )}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.yearsInFarming')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.years_in_farming}
                onValueChange={(value) => handleChange('years_in_farming', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="1-5" value="1-5" />
                <Picker.Item label="6-10" value="6-10" />
                <Picker.Item label="10+" value="10+" />
              </Picker>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.yearsInGrowingCrop')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.years_in_growing_crop}
                onValueChange={(value) => handleChange('years_in_growing_crop', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="1-5" value="1-5" />
                <Picker.Item label="6-10" value="6-10" />
                <Picker.Item label="10+" value="10+" />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* Farm and Plot Details Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <FontAwesome5 name="tractor" size={18} color="#2B7A0B" />
          <Text style={styles.sectionTitle}>{i18n.t('addFarmer.farmPlotDetails')}</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}> {i18n.t('addFarmer.totalPlotSize')}  </Text>
            <TextInput
              placeholder="Enter total plot size"
              value={formData.total_plot_size}
              keyboardType="numeric"
              onChangeText={(text) => handleChange('total_plot_size', text)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.totalPlotUnit')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.total_plot_unit}
                onValueChange={(value) => handleChange('total_plot_unit', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Kattha" value="Kattha" />
                <Picker.Item label="Bigha" value="Bigha" />
                <Picker.Item label="Acre" value="Acre" />
              </Picker>
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.soilTestingDone')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.soil_testing_done}
                onValueChange={(value) => handleChange('soil_testing_done', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{i18n.t('addFarmer.openToSoilTesting')}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.open_to_soil_testing}
                onValueChange={(value) => handleChange('open_to_soil_testing', value)}
                style={styles.picker}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Yes" value="Yes" />
                <Picker.Item label="No" value="No" />
              </Picker>
            </View>
          </View>
        </View>
      </View>

      {/* FarmerCrops */}
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <MaterialCommunityIcons name="sprout" size={22} color="#2B7A0B" />
          <Text style={styles.sectionTitle}>{i18n.t('addFarmer.farmerCrops')}</Text>
        </View>
        <View style={styles.card}>
          {/* Add Crop Form */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}> {i18n.t('addFarmer.addNewCrop')} </Text>
            <View style={styles.cropFormContainer}>
              <View style={styles.cropFormField}>
                <Text style={styles.sublabel}>{i18n.t('addFarmer.cropVariety')}</Text>
                <View style={styles.pickerContainer}>
            <Picker
                    selectedValue={newCrop.crop_variety}
                    onValueChange={(value) => handleCropChange('crop_variety', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
                    {availableCropVarieties[language].map((variety, index) => (
                      <Picker.Item label={variety} value={variety} key={index} />
                    ))}
            </Picker>
          </View>

          
              </View>
              
              <View style={styles.cropFormField}>
                <Text style={styles.sublabel}>Sub-Variety</Text>
                <View style={styles.pickerContainer}>
  <Picker
    selectedValue={newCrop.crop_sub_variety}
    onValueChange={(value) => handleCropChange('crop_sub_variety', value)}
    style={styles.picker}
    enabled={!!newCrop.crop_variety}
  >
    <Picker.Item label="Select" value="" />
    {newCrop.crop_variety && availableSubVarieties[language][newCrop.crop_variety]?.length > 0 ? (
      availableSubVarieties[language][newCrop.crop_variety].map((subVariety, index) => (
        <Picker.Item label={subVariety} value={subVariety} key={index} />
      ))
    ) : (
      <Picker.Item label="No sub-varieties available" value="" />
    )}
  </Picker>
</View>
              </View>
              
              <View style={styles.cropFormField}>
                <Text style={styles.sublabel}>Grade</Text>
                <View style={styles.pickerContainer}>
            <Picker
                    selectedValue={newCrop.grade}
                    onValueChange={(value) => handleCropChange('grade', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
                    {availableGrades.map((grade, index) => (
                      <Picker.Item label={grade} value={grade} key={index} />
                    ))}
            </Picker>
        </View>
      </View>

              <View style={styles.cropFormField}>
                <Text style={styles.sublabel}>Date of Sowing</Text>
            <TouchableOpacity 
              style={styles.dateButton} 
                  onPress={() => setShowCropSowingPicker(true)}
            >
              <Text style={styles.dateButtonText}>
                    {newCrop.sowing_date.toLocaleDateString()}
              </Text>
                  <AntDesign name="calendar" size={18} color="#2B7A0B" />
            </TouchableOpacity>
                {showCropSowingPicker && (
              <DateTimePicker
                    value={newCrop.sowing_date}
                mode="date"
                display="default"
                    onChange={(event, date) => handleCropDateChange(event, date, 'sowing_date')}
              />
            )}
          </View>
              
              <View style={styles.cropFormField}>
                <Text style={styles.sublabel}>Farming Type</Text>
                <View style={styles.pickerContainer}>
                <Picker
  selectedValue={newCrop.farming_type}
  onValueChange={(value) => handleCropChange('farming_type', value)}
  style={styles.picker}
>
  <Picker.Item label={i18n.t('common.select')} value="" />
  {getFarmingTypes().map((type, index) => (
    <Picker.Item label={type} value={type} key={index} />
  ))}
</Picker>
                </View>
              </View>
              
              <View style={styles.cropFormField}>
                <Text style={styles.sublabel}>Date of Harvesting</Text>
            <TouchableOpacity 
              style={styles.dateButton} 
                  onPress={() => setShowCropHarvestPicker(true)}
            >
              <Text style={styles.dateButtonText}>
                    {newCrop.harvest_date.toLocaleDateString()}
              </Text>
                  <AntDesign name="calendar" size={18} color="#2B7A0B" />
            </TouchableOpacity>
                {showCropHarvestPicker && (
              <DateTimePicker
                    value={newCrop.harvest_date}
                mode="date"
                display="default"
                    onChange={(event, date) => handleCropDateChange(event, date, 'harvest_date')}
              />
            )}
          </View>
              
              <View style={styles.cropFormField}>
                <Text style={styles.sublabel}>Expected Harvest Quantity</Text>
                <TextInput
                  placeholder="Enter expected harvest quantity in Acre"
                  value={newCrop.expected_harvest_quantity}
                  onChangeText={(text) => handleCropChange('expected_harvest_quantity', text)}
                  style={styles.input}
                  keyboardType="numeric"
                />
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.addCropButton,
                  (!newCrop.crop_variety || !newCrop.crop_sub_variety || !newCrop.grade || 
                   !newCrop.sowing_date || !newCrop.farming_type || !newCrop.harvest_date) && 
                  styles.disabledButton
                ]} 
                onPress={() => {
                  console.log('Add Crop button pressed');
                  addCrop();
                }}
                disabled={!newCrop.crop_variety || !newCrop.crop_sub_variety || !newCrop.grade || 
                         !newCrop.sowing_date || !newCrop.farming_type || !newCrop.harvest_date}
              >
                <Text style={styles.addCropButtonText}>Add Crop</Text>
                <AntDesign name="plus" size={16} color="white" />
              </TouchableOpacity>
        </View>
      </View>
          
          {/* Display Added Crops */}
          {crops.length > 0 ? (
            <View style={styles.cropsContainer}>
              <Text style={styles.label}>Added Crops</Text>
              {crops.map((crop) => (
                <View key={crop.id} style={styles.cropCard}>
                  <View style={styles.cropCardContent}>
                    <Text style={styles.cropCardTitle}>{crop.crop_variety}</Text>
                    <Text style={styles.cropCardSubtitle}>{crop.crop_sub_variety}</Text>
                    <View style={styles.cropCardDetails}>
                      <View style={styles.cropCardDetailItem}>
                        <Text style={styles.cropCardDetailLabel}>Grade:</Text>
                        <Text style={styles.cropCardDetailValue}>{crop.grade}</Text>
                      </View>
                      <View style={styles.cropCardDetailItem}>
                        <Text style={styles.cropCardDetailLabel}>Farming Type:</Text>
                        <Text style={styles.cropCardDetailValue}>{crop.farming_type}</Text>
                      </View>
                    </View>
                    <View style={styles.cropCardDates}>
                      <View style={styles.cropCardDateItem}>
                        <Text style={styles.cropCardDateLabel}>Sowing:</Text>
                        <Text style={styles.cropCardDateValue}>{crop.sowing_date.toLocaleDateString()}</Text>
                      </View>
                      <View style={styles.cropCardDateItem}>
                        <Text style={styles.cropCardDateLabel}>Harvest:</Text>
                        <Text style={styles.cropCardDateValue}>{crop.harvest_date.toLocaleDateString()}</Text>
                      </View>
                    </View>
                    {crop.expected_harvest_quantity && (
                      <View style={styles.cropCardQuantity}>
                        <Text style={styles.cropCardQuantityLabel}>Expected Harvest:</Text>
                        <Text style={styles.cropCardQuantityValue}>{crop.expected_harvest_quantity}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.removeCropButton}
                    onPress={() => removeCrop(crop.id)}
                  >
                    <AntDesign name="delete" size={18} color="#FF5252" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.noCropsContainer}>
              <Text style={styles.noCropsText}>No crops added yet</Text>
            </View>
          )}
        </View>
      </View>

      

      {/* Calamity Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <MaterialCommunityIcons name="weather-tornado" size={22} color="#2B7A0B" />
          <Text style={styles.sectionTitle}>Calamity Information</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prone to Calamities?</Text>
            <Picker
              selectedValue={formData.prone_to_calamities}
              onValueChange={(value) => handleChange('prone_to_calamities', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Type of Calamity</Text>
            <TextInput
              placeholder="Enter type of calamity"
              value={formData.calamity_type}
              onChangeText={(text) => handleChange('calamity_type', text)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Impact Duration (days)</Text>
            <TextInput
              placeholder="Enter impact duration"
              value={formData.impact_duration_days}
              keyboardType="numeric"
              onChangeText={(text) => handleChange('impact_duration_days', text)}
              style={styles.input}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Impact Severity</Text>
            <Picker
              selectedValue={formData.impact_severity}
              onValueChange={(value) => handleChange('impact_severity', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Low" value="Low" />
              <Picker.Item label="Medium" value="Medium" />
              <Picker.Item label="High" value="High" />
            </Picker>
          </View>
        </View>
      </View>

      {/* Sustainable Practices Section */}
      <View style={styles.section}>
        <View style={styles.sectionTitleContainer}>
          <MaterialCommunityIcons name="earth" size={22} color="#2B7A0B" />
          <Text style={styles.sectionTitle}>Sustainable Practices</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Willing to Adopt Sustainable Farming?</Text>
            <Picker
              selectedValue={formData.willing_to_adopt_sustainable_farming}
              onValueChange={(value) => handleChange('willing_to_adopt_sustainable_farming', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Participates in Government Schemes?</Text>
            <Picker
              selectedValue={formData.participates_in_govt_schemes}
              onValueChange={(value) => handleChange('participates_in_govt_schemes', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Yes" value="Yes" />
              <Picker.Item label="No" value="No" />
            </Picker>
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Preferred Payment Method</Text>
            <Picker
              selectedValue={formData.preferred_payment_method}
              onValueChange={(value) => handleChange('preferred_payment_method', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Cash" value="Cash" />
              <Picker.Item label="Bank Transfer" value="Bank Transfer" />
              <Picker.Item label="Cheque" value="Cheque" />
            </Picker>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit</Text>
        <AntDesign name="arrowright" size={20} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
    padding: 15,
  },
  header: {
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2B7A0B',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingLeft: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2B7A0B',
    marginLeft: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#2B7A0B',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  // New styles for crop management
  cropFormContainer: {
    marginTop: 10,
  },
  cropFormField: {
    marginBottom: 15,
  },
  sublabel: {
    fontSize: 13,
    color: '#555',
    marginBottom: 5,
  },
  addCropButton: {
    backgroundColor: '#2B7A0B',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 5,
  },
  addCropButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
  },
  cropsContainer: {
    marginTop: 20,
  },
  cropCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F8F0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropCardContent: {
    flex: 1,
  },
  cropCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2B7A0B',
  },
  cropCardSubtitle: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  cropCardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  cropCardDetailItem: {
    flexDirection: 'row',
    marginRight: 15,
    marginTop: 3,
  },
  cropCardDetailLabel: {
    fontSize: 13,
    color: '#555',
    marginRight: 5,
  },
  cropCardDetailValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2B7A0B',
  },
  cropCardDates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  cropCardDateItem: {
    flexDirection: 'row',
    marginRight: 15,
    marginTop: 3,
  },
  cropCardDateLabel: {
    fontSize: 13,
    color: '#555',
    marginRight: 5,
  },
  cropCardDateValue: {
    fontSize: 13,
    color: '#2B7A0B',
  },
  cropCardQuantity: {
    flexDirection: 'row',
    marginTop: 5,
  },
  cropCardQuantityLabel: {
    fontSize: 13,
    color: '#555',
    marginRight: 5,
  },
  cropCardQuantityValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2B7A0B',
  },
  removeCropButton: {
    padding: 8,
  },
  noCropsContainer: {
    padding: 15,
    alignItems: 'center',
  },
  noCropsText: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  // Add style for read-only inputs
  readOnlyInput: {
    backgroundColor: '#F5F5F5',
    color: '#555',
  },
  // Add helper text style
  helperText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Add style for disabled button
  disabledButton: {
    backgroundColor: '#A0C0A0',
    opacity: 0.7,
  },
});

export default FarmerForm;