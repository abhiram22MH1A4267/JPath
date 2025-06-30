import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';

import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import { createThumbnail } from 'react-native-pdf-thumbnail';
import { verifyCertificateApi, AddSkillApi, fetchAllRequiredSkillsApi } from '../Screens/ApiCalls/SignIn_Api';

const { width, height } = Dimensions.get('window');

export default function CertificateValidationScreen() {
  const [fileUri, setFileUri] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null); // 'success', 'failed', null
  const [RequiredSkills, setRequiredSkills] = useState([]);

  useEffect(() => {
    fetchAllRequiredSkillsApi().then((response) => {
      setRequiredSkills(response);
    })
      .catch((error) => {
        console.error('Error fetching required skills:', error);
      })
  }, [])

  const copyFileToCache = async (contentUri, filename) => {
    try {
      const cacheUri = FileSystem.cacheDirectory + filename;
      await FileSystem.copyAsync({ from: contentUri, to: cacheUri });
      return cacheUri;
    } catch (e) {
      console.error('copyFileToCache error:', e);
      throw e;
    }
  };

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return;
      }

      setIsLoading(true);
      setVerificationStatus(null);
      let asset = result.assets[0];
      let { uri, name, mimeType } = asset;

      setFileUri(uri);
      setFileType(mimeType);
      setFileName(name);
      
      // Show success feedback
      Alert.alert('📄 File Selected', `${name} is ready for verification`);

    } catch (e) {
      console.error(e);
      Alert.alert('❌ Error', 'Could not pick or process the file.');
    } finally {
      setIsLoading(false);
    }
  };

  const openPdfExternally = async () => {
    if (!fileUri) return;
    if (!(await Sharing.isAvailableAsync())) {
      return Alert.alert('Error', 'Sharing is not available on this device');
    }
    await Sharing.shareAsync(fileUri);
  };

  const matchedSkills = async (skill) => {
    if (!skill) return;
    const matches = RequiredSkills
      .map(s =>
        skill.toLowerCase().includes(
          s.length > 1 ? s.toLowerCase() : s.toUpperCase()
        )
          ? s
          : undefined
      )
      .filter(Boolean);

    console.log(matches);
    return matches.length ? matches : "";
  }

  const verifyCertificate = async () => {
    if (!fileUri) {
      return Alert.alert('⚠️ Cannot Verify', 'Please select a certificate first.');
    }

    setIsLoading(true);
    setVerificationStatus(null);
    
    try {
      const formData = new FormData();
      formData.append('certificateFile', {
        uri: fileUri,
        name: fileName,
        type: fileType,
      });

      const userDetails = await AsyncStorage.getItem('userDetails');
      const user = JSON.parse(userDetails);

      const response = await verifyCertificateApi(formData);

      if (!response.userName || !response.skillName) {
        throw new Error("Could not extract details from the certificate. Please try another file.");
      }

      const storedUserName = user.Name.toLowerCase().split(' ').sort();
      const extractedUserName = response.userName.toLowerCase().split(' ').sort();

      const namesMatch = storedUserName.length === extractedUserName.length &&
        storedUserName.every((val, idx) => val === extractedUserName[idx]);

      if (!namesMatch) {
        setVerificationStatus('failed');
        Alert.alert(
          '❌ Verification Failed',
          `Name mismatch. Expected "${user.Name}", but found "${response.userName}" in the certificate.`
        );
      } else {
        let matchedSkill = await matchedSkills(response.skillName) || [response.skillName];
        
        console.log("matchedSkill", matchedSkill);

        if(matchedSkill.includes(response.skillName)){
          matchedSkill = [response.skillName];
        }

        const res = await AddSkillApi(user.Email, matchedSkill);
        setVerificationStatus('success');

        Alert.alert(
          '✅ Verification Successful',
          `${res.message}`
        );
      }
    } catch (error) {
      console.error("Verification Error:", error);
      setVerificationStatus('failed');
      Alert.alert('❌ Verification Error', error.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFilePreview = () => {
    if (!fileUri) return null;

    return (
      <View style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <MaterialIcons name="description" size={24} color="#6366f1" />
          <Text style={styles.previewTitle}>Selected Certificate</Text>
        </View>
        
        {fileType?.startsWith('image/') ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: fileUri }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.pdfPreviewContainer}>
            <MaterialIcons name="picture-as-pdf" size={48} color="#ef4444" />
            <Text style={styles.fileName}>{fileName}</Text>
            <Text style={styles.fileDescription}>PDF Certificate</Text>
            <TouchableOpacity style={styles.viewPdfButton} onPress={openPdfExternally}>
              <Ionicons name="eye" size={20} color="#fff" />
              <Text style={styles.viewPdfText}>View PDF</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {verificationStatus && (
          <View style={[
            styles.statusBadge,
            verificationStatus === 'success' ? styles.successBadge : styles.failedBadge
          ]}>
            <Ionicons 
              name={verificationStatus === 'success' ? "checkmark-circle" : "close-circle"} 
              size={20} 
              color="#fff" 
            />
            <Text style={styles.statusText}>
              {verificationStatus === 'success' ? 'Verified' : 'Verification Failed'}
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={32} color="#fff" />
          <Text style={styles.headerTitle}>Certificate Validator</Text>
          <Text style={styles.headerSubtitle}>Verify your professional certificates</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mainContent}>
          {!fileUri ? (
            <View style={styles.uploadSection}>
              <View style={styles.uploadIconContainer}>
                <MaterialIcons name="cloud-upload" size={64} color="#6366f1" />
              </View>
              <Text style={styles.uploadTitle}>Upload Your Certificate</Text>
              <Text style={styles.uploadDescription}>
                Select a PDF or image file of your certificate to verify
              </Text>
              
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.disabledButton]}
                onPress={pickFile}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="document" size={20} color="#fff" />
                    <Text style={styles.primaryButtonText}>Choose File</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <View style={styles.supportedFormats}>
                <Text style={styles.supportedText}>Supported formats:</Text>
                <View style={styles.formatTags}>
                  <View style={styles.formatTag}>
                    <Text style={styles.formatTagText}>PDF</Text>
                  </View>
                  <View style={styles.formatTag}>
                    <Text style={styles.formatTagText}>JPG</Text>
                  </View>
                  <View style={styles.formatTag}>
                    <Text style={styles.formatTagText}>PNG</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <>
              {renderFilePreview()}
              
              <TouchableOpacity
                style={[styles.verifyButton, isLoading && styles.disabledButton]}
                onPress={verifyCertificate}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.verifyButtonText}>Verifying...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="shield-checkmark" size={20} color="#fff" />
                    <Text style={styles.verifyButtonText}>Verify Certificate</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  setFileUri(null);
                  setFileType(null);
                  setFileName(null);
                  setVerificationStatus(null);
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="refresh" size={20} color="#6366f1" />
                <Text style={styles.secondaryButtonText}>Choose Another File</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingBottom: 30,paddingTop:40
  },
  header: {
    alignItems: 'center',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    marginTop: 5,
    textAlign: 'center',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    marginTop: -20,
  },
  mainContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadSection: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  uploadIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  uploadDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    marginBottom: 24,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  supportedFormats: {
    alignItems: 'center',
  },
  supportedText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  formatTags: {
    flexDirection: 'row',
    gap: 8,
  },
  formatTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  formatTagText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  previewContainer: {
    marginBottom: 24,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  imagePreview: {
    width: '100%',
    height: 300,
  },
  pdfPreviewContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 12,
    textAlign: 'center',
  },
  fileDescription: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
  },
  viewPdfButton: {
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  viewPdfText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 16,
    alignSelf: 'center',
  },
  successBadge: {
    backgroundColor: '#10b981',
  },
  failedBadge: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  verifyButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  secondaryButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
});