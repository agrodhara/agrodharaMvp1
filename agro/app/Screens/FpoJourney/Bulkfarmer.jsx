import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import * as XLSX from 'xlsx';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApi } from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';

function Bulkfarmer() {
  const params = useLocalSearchParams();
  const id = params.fpoId;
  const router = useRouter();
  const api = useApi();

  const allowedKeys = [
    "farmer_name",
    "contact_number",
    "village_name",
    "pincode",
    "district_name",
    "state_name",
    "block",
    "gram_panchayat",
    "house_number",
    "years_in_farming",
    "years_in_growing_crop",
    "total_plot_size",
    "total_plot_unit",
    "soil_testing_done",
    "open_to_soil_testing",
    "prone_to_calamities",
    "calamity_type",
    "impact_duration_days",
    "impact_severity",
    "willing_to_adopt_sustainable_farming",
    "participates_in_govt_schemes",
    "preferred_payment_method"
  ];

  const [farmers, setFarmers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const pickExcelFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      });
  
      // User cancelled the picker
      if (!result.assets || result.assets.length === 0) {
        return;
      }
  
      setIsLoading(true); // <-- Only set loading true if file is selected
  
      const file = result.assets[0];
      const response = await fetch(file.uri);
      const blob = await response.blob();
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
  
        const missingColumns = allowedKeys.filter(key => !json.some(row => row[key] !== undefined));
  
        if (missingColumns.length > 0) {
          Alert.alert("Error", `The following required columns are missing: ${missingColumns.join(', ')}`);
          setIsLoading(false);
          return;
        }
  
        const filtered = json.map((row) => {
          const cleanRow = { fpo_id: id };
          allowedKeys.forEach((key) => {
            cleanRow[key] = row[key] !== undefined ? String(row[key]) : '';
          });
          return cleanRow;
        });
  
        setFarmers(filtered);
        setIsLoading(false);
      };
  
      reader.readAsArrayBuffer(blob);
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Failed to read Excel file.");
      console.error(error);
    }
  };

  const handleSubmitAll = async () => {
    if (farmers.length === 0) {
      Alert.alert("No Farmers", "Please upload an Excel file with farmer data first.");
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await api.post('/api/fpo/farmers/bulkfarmer', farmers);
      Alert.alert("Success", `${farmers.length} farmers submitted successfully!`);
   

      router.replace(`/Screens/FpoJourney/AddFarmer?refresh=${new Date().getTime()}`);


      setFarmers([]);
    } catch (error) {
      console.error('Bulk submission error:', error.response?.data || error.message);
      Alert.alert("Error", "Failed to submit farmers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bulk Farmer Upload</Text>
          <Text style={styles.headerSubtitle}>FPO ID: {id}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.uploadSection}>
            <MaterialIcons name="cloud-upload" size={48} color="#2B7A0B" />
            <Text style={styles.uploadTitle}>Upload Farmer Data</Text>
            <Text style={styles.uploadDescription}>
              Select an Excel file containing farmer information. Ensure it includes all required fields.
            </Text>
            
            <TouchableOpacity
              onPress={pickExcelFile}
              style={styles.uploadButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <Text style={styles.buttonText}>Processing...</Text>
              ) : (
                <>
                  <MaterialIcons name="upload-file" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Choose Excel File</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {farmers.length > 0 && (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsTitle}>Farmers to be Added ({farmers.length})</Text>
                <TouchableOpacity
                  onPress={handleSubmitAll}
                  style={styles.submitButton}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Text style={styles.buttonText}>Submitting...</Text>
                  ) : (
                    <>
                      <MaterialIcons name="send" size={16} color="#fff" />
                      <Text style={styles.buttonText}>Submit All</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.farmersList}>
                {farmers.slice(0, 5).map((farmer, index) => (
                  <View key={index} style={styles.farmerCard}>
                    <Text style={styles.farmerName}>{farmer.farmer_name}</Text>
                    <View style={styles.farmerDetails}>
                      <View style={styles.detailRow}>
                        <MaterialIcons name="phone" size={14} color="#666" />
                        <Text style={styles.detailText}>{farmer.contact_number}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <MaterialIcons name="location-on" size={14} color="#666" />
                        <Text style={styles.detailText}>
                          {farmer.village_name}, {farmer.district_name}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <MaterialIcons name="agriculture" size={14} color="#666" />
                        <Text style={styles.detailText}>
                          Soil Test: {farmer.soil_testing_done}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}

                {farmers.length > 5 && (
                  <View style={styles.moreFarmers}>
                    <Text style={styles.moreFarmersText}>
                      + {farmers.length - 5} more farmers
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
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
  scrollContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2B7A0B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  uploadSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2B7A0B',
    marginTop: 12,
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  uploadButton: {
    flexDirection: 'row',
    backgroundColor: '#2B7A0B',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  resultsSection: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  farmersList: {
    gap: 12,
  },
  farmerCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
  },
  farmerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  farmerDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  moreFarmers: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreFarmersText: {
    fontSize: 14,
    color: '#2B7A0B',
    fontWeight: '500',
  },
});

export default Bulkfarmer;