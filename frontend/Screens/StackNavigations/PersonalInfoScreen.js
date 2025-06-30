import React, { useEffect, useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Button, 
  Alert, 
  ScrollView,  
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { getUserApi, updateUserApi } from '../ApiCalls/SignIn_Api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from "react-native-vector-icons";

const THEME = {
  PRIMARY: '#2563EB',
  PRIMARY_DARK: '#1D4ED8',
  PRIMARY_LIGHT: '#DBEAFE',
  PRIMARY_TINT: 'rgba(37, 99, 235, 0.1)',
  BACKGROUND: '#F8FAFC',
  CARD_BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#1A202C',
  TEXT_SECONDARY: '#4A5568',
  TEXT_MUTED: '#64748B',
  BORDER: '#E2E8F0',
  BORDER_FOCUS: '#2563EB',
  WHITE: '#FFFFFF',
  SUCCESS: '#16A34A',
  SUCCESS_LIGHT: '#DCFCE7',
  SHADOW: 'rgba(0, 0, 0, 0.1)',
};

const PersonalInformationScreen = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        if (!userDetails) {
          Alert.alert('Error', 'User details not found in storage');
          setLoading(false);
          return;
        }

        const user = JSON.parse(userDetails);
        const res = await getUserApi(user.Email);
        // console.log('User data:', res);
        setData(res);
      } catch (err) {
        console.error('Fetch error: ', err);
        Alert.alert('Error', 'Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateUserApi(data);
      Alert.alert('Success', 'Information updated successfully');
      const updatedData = { 
        ...data, 
        Name: res.Name, 
        RollNo: res.RollNo, 
        Email: res.Email, 
        Password: res.Password 
      };
      await AsyncStorage.setItem('userDetails', JSON.stringify(updatedData));
    } catch (err) {
      Alert.alert('Error', 'Failed to update information');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label, value, onChangeText, placeholder, secureTextEntry = false, editable = true, icon }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputWrapper, 
        focusedField === label && styles.inputWrapperFocused,
        !editable && styles.inputWrapperDisabled
      ]}>
        {icon && (
          <MaterialIcons 
            name={icon} 
            size={20} 
            color={focusedField === label ? THEME.PRIMARY : THEME.TEXT_MUTED} 
            style={styles.inputIcon}
          />
        )}
        <TextInput
          style={[styles.textInput, !editable && styles.textInputDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          editable={editable}
          onFocus={() => setFocusedField(label)}
          onBlur={() => setFocusedField(null)}
          placeholderTextColor={THEME.TEXT_MUTED}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.PRIMARY} />
        <Text style={styles.loadingText}>Loading your information...</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color={THEME.TEXT_MUTED} />
        <Text style={styles.errorText}>No Data Found</Text>
        <Text style={styles.errorSubtext}>Please try refreshing the page</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Personal Information</Text>
          <Text style={styles.headerSubtitle}>Update your profile details</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <InputField
            label="Full Name"
            value={data.Name}
            onChangeText={(text) => setData({ ...data, Name: text })}
            placeholder="Enter your full name"
            icon="person"
             editable={false}
          />

          <InputField
            label="Roll Number"
            value={data.RollNo}
            onChangeText={(text) => setData({ ...data, RollNo: text })}
            placeholder="Enter your roll number"
            icon="badge"
        
          />

          <InputField
            label="Email Address"
            value={data.Email}
            onChangeText={(text) => setData({ ...data, Email: text })}
            placeholder="Enter your email"
            icon="email"
            editable={false}
          />

          <InputField
            label="Password"
            value={data.Password}
            onChangeText={(text) => setData({ ...data, Password: text })}
            placeholder="Enter your password"
            secureTextEntry={true}
            icon="lock"
          />

          {/* Certifications Section */}
          <View style={styles.certificationsSection}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <Text style={styles.sectionSubtitle}>Your professional certifications</Text>
            
            <View style={styles.tagContainer}>
              {data.CertificationLinks?.length > 0 ? (
                data.CertificationLinks.map((cert, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{cert}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const newCerts = data.CertificationLinks.filter((_, i) => i !== index);
                        setData({ ...data, CertificationLinks: newCerts });
                      }}
                      style={styles.tagCloseButton}
                    >
                      <MaterialIcons name="close" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.noCertificationsContainer}>
                  <MaterialIcons name="school" size={32} color={THEME.TEXT_MUTED} />
                  <Text style={styles.noCertificationsText}>No certifications added yet</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <MaterialIcons name="save" size={20} color="white" style={styles.saveButtonIcon} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND,
  },
  scrollContainer: {
    paddingBottom: 40,paddingTop: 40
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: THEME.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: THEME.BORDER,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: THEME.TEXT_PRIMARY,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: THEME.TEXT_SECONDARY,
  },
  formCard: {
    backgroundColor: THEME.WHITE,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 24,
    shadowColor: THEME.SHADOW,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.TEXT_PRIMARY,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: THEME.BORDER,
    borderRadius: 12,
    backgroundColor: THEME.WHITE,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputWrapperFocused: {
    borderColor: THEME.BORDER_FOCUS,
    backgroundColor: THEME.PRIMARY_TINT,
  },
  inputWrapperDisabled: {
    backgroundColor: '#F7F8FA',
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: THEME.TEXT_PRIMARY,
    paddingVertical: 0,
  },
  textInputDisabled: {
    color: THEME.TEXT_MUTED,
  },
  certificationsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: THEME.TEXT_PRIMARY,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: THEME.TEXT_SECONDARY,
    marginBottom: 16,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    minHeight: 60,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 12,
    shadowColor: THEME.SHADOW,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tagText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  tagCloseButton: {
    marginLeft: 8,
    padding: 2,
  },
  noCertificationsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    width: '100%',
  },
  noCertificationsText: {
    fontSize: 16,
    color: THEME.TEXT_MUTED,
    marginTop: 12,
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: THEME.PRIMARY,
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: THEME.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.BACKGROUND,
  },
  loadingText: {
    fontSize: 16,
    color: THEME.TEXT_SECONDARY,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.BACKGROUND,
    paddingHorizontal: 32,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.TEXT_PRIMARY,
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 16,
    color: THEME.TEXT_MUTED,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default PersonalInformationScreen;
