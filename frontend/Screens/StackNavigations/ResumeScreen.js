import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  Animated,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import {
  saveResumeApi,
  getUserApi,
  deleteResumeApi,
} from '../ApiCalls/SignIn_Api';

const { width } = Dimensions.get('window');

export default function FileManager() {
  const [file, setFile] = useState(null);
  const [scaleValue] = useState(new Animated.Value(1));
  const [email, setEmail] = useState('');

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        const user = JSON.parse(userDetails);
        const res = await getUserApi(user.Email);
        setEmail(user.Email);
        // console.log('User data:', res);
        setFile(res.Resume || null);
      } catch (error) {
        console.error("Failed to load user data:", error);
      }
    };
    getUser();
  }, []);

  const pickFile = async (isUpdating = false) => {
    animateButton();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const selectedFile = result.assets[0];

        if (!selectedFile.size) {
          const info = await FileSystem.getInfoAsync(selectedFile.uri);
          selectedFile.size = info.size || 0;
        }

        let previewUri = selectedFile.uri;

        if (
          Platform.OS === 'android' &&
          selectedFile.mimeType?.startsWith('image/')
        ) {
          try {
            const fileContent = await FileSystem.readAsStringAsync(
              selectedFile.uri,
              {
                encoding: FileSystem.EncodingType.Base64,
              }
            );
            previewUri = `data:${selectedFile.mimeType};base64,${fileContent}`;
          } catch (error) {
            // console.log('Error processing image for preview:', error);
          }
        }

        setFile({ ...selectedFile, previewUri });

        if (isUpdating) {
          Alert.alert('✅ Updated', 'File updated successfully!');
        } else {
          Alert.alert('📄 File Selected', `${selectedFile.name} is ready to upload`);
        }
      } else {
        Alert.alert('❌ Cancelled', 'No file was selected.');
      }
    } catch (error) {
      Alert.alert('❌ Error', error.message || 'Failed to pick file.');
    }
  };

  const openPdfExternally = async () => {
    if (!file?.uri) return;

    if (!(await Sharing.isAvailableAsync())) {
      return Alert.alert('❌ Error', 'Sharing is not available on this device');
    }

    await Sharing.shareAsync(file.uri);
  };

  const deleteFile = () => {
    Alert.alert('🗑 Delete File', 'Are you sure you want to delete this file?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const res = await deleteResumeApi(email);
            setFile(null);
            Alert.alert('✅ Deleted', res.message || 'File deleted successfully.');
          } catch (error) {
            Alert.alert('❌ Error', 'Failed to delete file.');
          }
        },
      },
    ]);
  };

  const saveResume = async () => {
    if (!file?.uri) return Alert.alert('⚠️ Error', 'No file selected.');

    try {
      const userDetails = await AsyncStorage.getItem('userDetails');
      const user = JSON.parse(userDetails);
      const response = await saveResumeApi(file.uri, file.name, user.Email);
      Alert.alert('✅ Success', response.message || 'Resume saved successfully.');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to save resume.');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const renderFilePreview = () => {
    if (!file?.uri) return null;

    return (
      <View style={styles.previewContainer}>
        <View style={styles.previewHeader}>
          <MaterialIcons name="description" size={24} color="#6366f1" />
          <Text style={styles.previewTitle}>Selected Resume</Text>
        </View>

        {file.mimeType?.startsWith('image/') ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: file.previewUri || file.uri }}
              style={styles.imagePreview}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.documentPreviewContainer}>
            <MaterialIcons name="description" size={48} color="#6366f1" />
            <Text style={styles.fileName}>{file.name || 'Unnamed File'}</Text>
            <Text style={styles.fileInfo}>
              {file.mimeType?.toUpperCase()} • {formatFileSize(file.size)}
            </Text>
            <TouchableOpacity style={styles.viewDocumentButton} onPress={openPdfExternally}>
              <Ionicons name="eye" size={20} color="#fff" />
              <Text style={styles.viewDocumentText}>View Document</Text>
            </TouchableOpacity>
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
          <Ionicons name="document-text" size={32} color="#fff" />
          <Text style={styles.headerTitle}>Resume Manager</Text>
          <Text style={styles.headerSubtitle}>Manage your resume documents with ease</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mainContent}>
          {!file?.uri ? (
            <View style={styles.uploadSection}>
              <View style={styles.uploadIconContainer}>
                <MaterialIcons name="cloud-upload" size={64} color="#6366f1" />
              </View>
              <Text style={styles.uploadTitle}>Upload Your Resume</Text>
              <Text style={styles.uploadDescription}>
                Select any document file to upload as your resume
              </Text>
              
              <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => pickFile(false)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="document" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>Choose File</Text>
                </TouchableOpacity>
              </Animated.View>
              
              <View style={styles.supportedFormats}>
                <Text style={styles.supportedText}>Supported formats:</Text>
                <View style={styles.formatTags}>
                  <View style={styles.formatTag}>
                    <Text style={styles.formatTagText}>PDF</Text>
                  </View>
                  <View style={styles.formatTag}>
                    <Text style={styles.formatTagText}>DOC</Text>
                  </View>
                  <View style={styles.formatTag}>
                    <Text style={styles.formatTagText}>DOCX</Text>
                  </View>
                  <View style={styles.formatTag}>
                    <Text style={styles.formatTagText}>TXT</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <>
              {renderFilePreview()}
              
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveResume}
                activeOpacity={0.8}
              >
                <Ionicons name="save" size={20} color="#fff" />
                <Text style={styles.saveButtonText}>Save Resume</Text>
              </TouchableOpacity>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={() => pickFile(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="refresh" size={20} color="#fff" />
                  <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={deleteFile}
                  activeOpacity={0.8}
                >
                  <Ionicons name="trash" size={20} color="#fff" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
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
    paddingBottom: 30,paddingTop: 40
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
    flexWrap: 'wrap',
    justifyContent: 'center',
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
    height: 300,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  documentPreviewContainer: {
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
    paddingHorizontal: 16,
  },
  fileInfo: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 16,
  },
  viewDocumentButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  viewDocumentText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  saveButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#10b981',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  updateButton: {
    flex: 1,
    backgroundColor: '#f59e0b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#f59e0b',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#ef4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 6,
  },
});