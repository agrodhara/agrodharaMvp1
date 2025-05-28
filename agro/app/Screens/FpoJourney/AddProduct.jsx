import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, StatusBar, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApi } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import i18n from '../../languagejsons/i18n'; // Importing the i18n instance
import axios from 'axios';


export default function CreateListing() {
  const [product, setProduct] = useState('');
  const [variety, setVariety] = useState('');
  const [quantity, setQuantity] = useState('');
  const [grade, setGrade] = useState('');
  const [costPerQuantity, setCostPerQuantity] = useState('');
  const [note, setNote] = useState('');
  const [total, setTotal] = useState(0);
  const [portalChargesChecked, setPortalChargesChecked] = useState(false);
  
  const api = useApi();
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    setTotal(quantity * costPerQuantity);
  }, [quantity, costPerQuantity]);



 


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



  const [availableCropVarieties, setAvailableCropVarieties] = useState({ en: [], hi: [] });
  const [availableSubVarieties, setAvailableSubVarieties] = useState({ en: {}, hi: {} });
 
 
 
 
 
 
  useEffect(() => {
   const fetchCropData = async () => {
     try {
       const varietiesRes = await api.get(`api/fpo/crops/crop-varieties`);
       const subVarietiesRes = await api.get('api/fpo/crops/sub-varieties/');
 
       const enVarieties = varietiesRes.data.map(v => v.name_en);
       const hiVarieties = varietiesRes.data.map(v => v.name_hi);
 
       const enSub = {};
       const hiSub = {};
 
       subVarietiesRes.data.forEach(sub => {
         const enCrop = varietiesRes.data.find(v => v.id === sub.crop_variety_id)?.name_en;
         const hiCrop = varietiesRes.data.find(v => v.id === sub.crop_variety_id)?.name_hi;
 
         if (enCrop) {
           if (!enSub[enCrop]) enSub[enCrop] = [];
           enSub[enCrop].push(sub.name_en);
         }
 
         if (hiCrop) {
           if (!hiSub[hiCrop]) hiSub[hiCrop] = [];
           hiSub[hiCrop].push(sub.name_hi);
         }
       });
 
       setAvailableCropVarieties({ en: enVarieties, hi: hiVarieties });
       setAvailableSubVarieties({ en: enSub, hi: hiSub });
     } catch (err) {
       console.error("Error fetching crop data", err);
     }
   };
 
   fetchCropData();
 }, []);
 
 
  const grades = ['A-grade', 'B-grade', 'C-grade', 'D-grade'];

  const handleConfirm = async () => {
    if (!product || !variety || !quantity || !costPerQuantity) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    const data = {
      fpo_id: id,
      product: product,
      variety: variety,
      quantity: quantity ? parseFloat(quantity) : null,
      grade: grade,
      cost_per_quantity: costPerQuantity ? parseFloat(costPerQuantity) : null,
      note: note,
      total: total,
      portal_charges_checked: portalChargesChecked,
    };
  
    try {
      const response = await api.post(`/api/fpo/products`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.data.success) {
        Alert.alert('Success', 'Product listing created successfully!');
        
        try {
          router.replace({
            pathname: 'Screens/FpoJourney/Product',
            params: { id: id }
          });
        } catch (navError) {
          navigation.replace('Product', { id: id });
        }
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create product listing');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create product listing. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8faf8" />

      <ScrollView contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Create New Product Listing</Text>
          <Text style={styles.subtitle}>Fill in the details to list your agricultural product</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Product Selection */}
          <View style={styles.inputGroup}>
      <Text style={styles.label}>Product *</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={product}
          onValueChange={(itemValue) => {
            setProduct(itemValue);
            setVariety(''); // Reset sub-variety when crop variety changes
          }}
          style={styles.picker}
          dropdownIconColor="#4a7c59"
        >
          <Picker.Item label="Select Product" value="" />
          {availableCropVarieties[language].map((cropName, index) => (
            <Picker.Item key={index} label={cropName} value={cropName} />
          ))}
        </Picker>
      </View>
    </View>

          {/* Variety Selection */}
          {product && (
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Variety *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={variety}
            onValueChange={(itemValue) => setVariety(itemValue)}
            style={styles.picker}
            dropdownIconColor="#4a7c59"
          >
            <Picker.Item label="Select Variety" value="" />
            {availableSubVarieties[language][product]?.map((subVar, index) => (
              <Picker.Item key={index} label={subVar} value={subVar} />
            ))}
          </Picker>
        </View>
      </View>
    )}

          {/* Grade Selection */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Grade</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={grade}
                onValueChange={(itemValue) => setGrade(itemValue)}
                style={styles.picker}
                dropdownIconColor="#4a7c59"
              >
                <Picker.Item label="Select Grade (optional)" value="" />
                {grades.map((gradeName, index) => (
                  <Picker.Item key={index} label={gradeName} value={gradeName} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Quantity Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantity *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
            />
          </View>

          {/* Cost Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Price per Quintal *</Text>
            <View style={styles.costInputContainer}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={[styles.input, styles.costInput]}
                placeholder="Enter price"
                value={costPerQuantity}
                onChangeText={setCostPerQuantity}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Notes */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Additional Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any special instructions or details about your product..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Total Calculation */}
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Estimated Total Value</Text>
            <Text style={styles.totalAmount}>₹ {total.toFixed(2) || '0.00'}</Text>
          </View>

          {/* Portal Charges Agreement */}
          <View style={styles.agreementContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setPortalChargesChecked(!portalChargesChecked)}
            >
              <View style={[styles.checkbox, portalChargesChecked && styles.checkboxChecked]}>
                {portalChargesChecked && <MaterialIcons name="check" size={16} color="#fff" />}
              </View>
              <Text style={styles.agreementText}>
                I understand that I have to pay additional Portal Charges ₹423.6 upon Successful Order Completion.
              </Text>
            </TouchableOpacity>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.confirmButton, (!product || !variety || !quantity || !costPerQuantity) && styles.disabledButton]}
            onPress={handleConfirm}
            disabled={!product || !variety || !quantity || !costPerQuantity}
          >
            <Text style={styles.confirmButtonText}>Create Listing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8faf8',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#f8faf8',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d5dbdd',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    color: '#34495e',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#d5dbdd',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 15,
    color: '#34495e',
  },
  costInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
    color: '#7f8c8d',
    fontSize: 16,
  },
  costInput: {
    paddingLeft: 30,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#e8f5e9',
    borderRadius: 8,
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#27ae60',
  },
  agreementContainer: {
    marginBottom: 25,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#27ae60',
    borderColor: '#27ae60',
  },
  agreementText: {
    flex: 1,
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 20,
  },
  confirmButton: {
    backgroundColor: '#27ae60',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#95a5a6',
    shadowColor: 'transparent',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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