import React, { useEffect, useState } from 'react';
import { Text, View, ActivityIndicator, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '../../_layout';
import axios from 'axios';

export default function EditFpoProfile() {
  const params = useLocalSearchParams();
  const fpoid = params.id;

  const { getAccessToken, isAuthenticated } = useAuth();
  const [fpoDetails, setFpoDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editable, setEditable] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [originalData, setOriginalData] = useState(null);

  useEffect(() => {
    const fetchFpoDetails = async () => {
      try {
        if (!isAuthenticated) {
          throw new Error('User is not authenticated');
        }

        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error('Access token is not available');
        }

        const response = await axios.get(`https://agrodhara-18yb.onrender.com/api/fpo/profile/${fpoid}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setFpoDetails(response.data);
        setOriginalData(response.data); // Store original data for cancel
      } catch (err) {
        setError(err.message || 'Error fetching FPO details');
      } finally {
        setLoading(false);
      }
    };
    
    if (fpoid) {
      fetchFpoDetails();
    }
  }, [fpoid, isAuthenticated, getAccessToken]);

  const handleSave = async () => {


console.log('Saving FPO details:', fpoDetails); // Debugging line

    try {
      const accessToken = await getAccessToken();
      await axios.put(`https://agrodhara-18yb.onrender.com/api/fpo/profile/update/${fpoid}`, fpoDetails, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setEditable(false);
      setOriginalData(fpoDetails); // Update original data after save
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Error saving FPO details');
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };


  const handleCancel = () => {
    setFpoDetails(originalData); // Revert to original data
    setEditable(false);
  };

  const handleInputChange = (field, value) => {
    setFpoDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading FPO Profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>FPO Profile Management</Text>
        <Text style={styles.subHeader}>Edit and manage your FPO details</Text>
      </View>

      {successMessage && (
        <View style={styles.successContainer}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      {fpoDetails ? (
        <View style={styles.profileContainer}>
          {/* Basic Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Basic Information</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>FPO Name</Text>
              <TextInput
                style={[styles.input, editable ? styles.editableInput : styles.disabledInput]}
                value={fpoDetails.fpo_name}
                onChangeText={(text) => handleInputChange('fpo_name', text)}
                editable={editable}
                placeholder="Enter FPO name"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Legal Structure</Text>
              <TextInput
                style={[styles.input, editable ? styles.editableInput : styles.disabledInput]}
                value={fpoDetails.legal_structure}
                onChangeText={(text) => handleInputChange('legal_structure', text)}
                editable={editable}
                placeholder="Enter legal structure"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Incorporation Date</Text>
              <TextInput
                style={[styles.input, styles.disabledInput]}
                value={new Date(fpoDetails.incorporation_date).toLocaleDateString()}
                editable={false}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Registration Number</Text>
              <TextInput
                style={[styles.input, editable ? styles.editableInput : styles.disabledInput]}
                value={fpoDetails.registration_number}
                onChangeText={(text) => handleInputChange('registration_number', text)}
                editable={editable}
                placeholder="Enter CIN number"
              />
            </View>
          </View>

          {/* Location Information Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Location Information</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>State</Text>
              <TextInput
                style={[styles.input, editable ? styles.editableInput : styles.disabledInput]}
                value={fpoDetails.state}
                onChangeText={(text) => handleInputChange('state', text)}
                editable={editable}
                placeholder="Enter state"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>District</Text>
              <TextInput
                style={[styles.input, editable ? styles.editableInput : styles.disabledInput]}
                value={fpoDetails.district}
                onChangeText={(text) => handleInputChange('district', text)}
                editable={editable}
                placeholder="Enter district"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Block Name</Text>
              <TextInput
                style={[styles.input, editable ? styles.editableInput : styles.disabledInput]}
                value={fpoDetails.villages_covered}
                onChangeText={(text) => handleInputChange('villages_covered', text)}
                editable={editable}
                placeholder="Enter block name"
              />
            </View>
          </View>

          {/* Leadership Section */}
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Leadership</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Board Member</Text>
              <TextInput
                style={[styles.input, editable ? styles.editableInput : styles.disabledInput]}
                value={fpoDetails.board_member_name}
                onChangeText={(text) => handleInputChange('board_member_name', text)}
                editable={editable}
                placeholder="Enter board member name"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>CEO</Text>
              <TextInput
                style={[styles.input, editable ? styles.editableInput : styles.disabledInput]}
                value={fpoDetails.ceo_name}
                onChangeText={(text) => handleInputChange('ceo_name', text)}
                editable={editable}
                placeholder="Enter CEO name"
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {editable ? (
              <>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.buttonText}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => setEditable(true)}>
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.noDataText}>No FPO details found</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingBottom: 15,
  },
  headerText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subHeader: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    color: '#4CAF50',
    fontSize: 16,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  noDataText: {
    color: '#757575',
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  profileContainer: {
    padding: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 5,
  },
  input: {
    height: 45,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 15,
  },
  editableInput: {
    backgroundColor: '#fafafa',
    borderColor: '#4CAF50',
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#9e9e9e',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginRight: 10,
    flex: 1,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  successContainer: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 8,
    borderLeftWidth: 5,
    borderLeftColor: '#4CAF50',
  },
  successText: {
    color: '#2e7d32',
    fontSize: 14,
  },
});