import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SignUpAPi, SendVerificationCodeApi, VerifyCodeApi } from "./ApiCalls/SignIn_Api";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

/**
 * Signup screen with modern UI matching login screen design
 * Features: Name, Roll No, Email verification, Password with validation
 */
export default function Signup() {
  const navigation = useNavigation();
  
  const [secureSet, setSecureSet] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState(null);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // 'pending', 'verified', 'failed'

  const [form, setForm] = useState({
    Name: "",
    RollNo: "",
    Email: "",
    VerifyCode: "",
    Password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const { Name, RollNo, Email, VerifyCode, Password } = form;

    if (!Name.trim()) newErrors.Name = "Name is required";
    if (!RollNo.trim()) newErrors.RollNo = "Roll No is required";
    if (codeSent && !VerifyCode.trim()) newErrors.VerifyCode = "Verification code is required";

    const eduRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.in$/;
    if (!Email.trim()) newErrors.Email = "Email is required";
    else if (!eduRegex.test(Email)) newErrors.Email = "Use a valid .edu.in email";

    const passwordPattern = /^(?=.[A-Z])(?=.[a-z])(?=.[0-9])(?=.[@])[A-Za-z0-9@]{8,30}$/;
    if (!Password) newErrors.Password = "Password is required";
    else if (!passwordPattern.test(Password)) {
      if (Password.length < 8 || Password.length > 30) {
        newErrors.Password = "Password must be 8-30 characters long.";
      } else {
        if (!/[A-Z]/.test(Password)) {
          newErrors.Password = "Password must contain at least one uppercase letter.";
        } else if (!/[a-z]/.test(Password)) {
          newErrors.Password = "Password must contain at least one lowercase letter.";
        } else if (!/[0-9]/.test(Password)) {
          newErrors.Password = "Password must contain at least one number.";
        } else if (!/@/.test(Password)) {
          newErrors.Password = "Password must contain at least one spcecial character.";
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const sendVerificationCode = async () => {
    if (!form.Email.trim()) {
      setErrors({ Email: "Email is required to send verification code" });
      return;
    }

    const eduRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.in$/;
    if (!eduRegex.test(form.Email)) {
      setErrors({ Email: "Use a valid .edu.in email" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await SendVerificationCodeApi(form.Email);
      if (res.data.success) {
        setCodeSent(true);
        setVerificationToken(res.data.token);
        setErrors({ global: "Verification code sent to your email!" });
      } else {
        setErrors({ global: res.data.message || "Failed to send verification code" });
      }
    } catch (error) {
      setErrors({ global: "Failed to send verification code" });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!form.VerifyCode.trim()) {
      setErrors({ VerifyCode: "Please enter verification code" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await VerifyCodeApi({
        verificationCode: form.VerifyCode,
        token: verificationToken
      });
      
      if (res.data.success) {
        setIsEmailVerified(true);
        setVerificationStatus('verified');
        setErrors({ global: "Email verified successfully!" });
      } else {
        setVerificationStatus('failed');
        setErrors({ VerifyCode: res.data.message || "Invalid verification code" });
      }
    } catch (error) {
      setVerificationStatus('failed');
      setErrors({ VerifyCode: "Verification failed" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validate()) return;
    if (!isEmailVerified) {
      setErrors({ global: "Please verify your email first" });
      return;
    }

    setIsLoading(true);
    try {
      const { VerifyCode, ...userData } = form;
      const res = await SignUpAPi(userData);
      
      if (res.status === 200) {
        setErrors({ RollNo: res.data.message });
      } else if (res.status === 202) {
        setErrors({ Email: res.data.message });
      } else if (res.status === 201) {
        navigation.navigate("Login");
      } else {
        setErrors({ global: "Unknown error occurred" });
      }
    } catch (error) {
      setErrors({ global: "Signup failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Ionicons name="person-add" size={32} color="#fff" />
          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join us and get started</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mainContent}>
          <View style={styles.signupSection}>
            {/* Name Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="person" size={20} color="#6366f1" style={styles.inputIcon} />
                <TextInput
                  placeholder="Full Name"
                  value={form.Name}
                  onChangeText={(text) => handleChange("Name", text)}
                  style={[styles.inputField, errors.Name && styles.inputFieldError]}
                  placeholderTextColor="#94a3b8"
                />
              </View>
              {errors.Name && <Text style={styles.errorText}>{errors.Name}</Text>}
            </View>

            {/* Roll Number Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="school" size={20} color="#6366f1" style={styles.inputIcon} />
                <TextInput
                  placeholder="Roll Number"
                  value={form.RollNo}
                  onChangeText={(text) => handleChange("RollNo", text)}
                  style={[styles.inputField, errors.RollNo && styles.inputFieldError]}
                  placeholderTextColor="#94a3b8"
                />
              </View>
              {errors.RollNo && <Text style={styles.errorText}>{errors.RollNo}</Text>}
            </View>

            {/* Email Field with Send Code Button */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={20} color="#6366f1" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  value={form.Email}
                  onChangeText={(text) => handleChange("Email", text)}
                  style={[styles.inputField, errors.Email && styles.inputFieldError, { flex: 1 }]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94a3b8"
                  editable={!codeSent}
                />
                {form.Email && !codeSent && (
                  <TouchableOpacity
                    style={styles.sendCodeButton}
                    onPress={sendVerificationCode}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.sendCodeText}>Send</Text>
                    )}
                  </TouchableOpacity>
                )}
                {codeSent && (
                  <View style={styles.statusIcon}>
                    <Ionicons name="mail" size={16} color="#10b981" />
                  </View>
                )}
              </View>
              {errors.Email && <Text style={styles.errorText}>{errors.Email}</Text>}
            </View>

            {/* Verification Code Field */}
            {codeSent && (
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons 
                    name="shield-checkmark" 
                    size={20} 
                    color={verificationStatus === 'verified' ? '#10b981' : '#6366f1'} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    placeholder="Verification Code"
                    value={form.VerifyCode}
                    onChangeText={(text) => handleChange("VerifyCode", text)}
                    style={[styles.inputField, errors.VerifyCode && styles.inputFieldError, { flex: 1 }]}
                    keyboardType="number-pad"
                    placeholderTextColor="#94a3b8"
                    editable={verificationStatus !== 'verified'}
                  />
                  {form.VerifyCode && verificationStatus === 'pending' && (
                    <TouchableOpacity
                      style={styles.verifyButton}
                      onPress={verifyCode}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.verifyButtonText}>Verify</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  {verificationStatus === 'verified' && (
                    <View style={styles.verifiedIcon}>
                      <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    </View>
                  )}
                </View>
                {errors.VerifyCode && <Text style={styles.errorText}>{errors.VerifyCode}</Text>}
              </View>
            )}

            {/* Password Field */}
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed" size={20} color="#6366f1" style={styles.inputIcon} />
                <TextInput
                  placeholder="Password"
                  value={form.Password}
                  onChangeText={(text) => handleChange("Password", text)}
                  style={[styles.inputField, errors.Password && styles.inputFieldError, { flex: 1 }]}
                  secureTextEntry={secureSet}
                  autoCapitalize="none"
                  placeholderTextColor="#94a3b8"
                />
                <TouchableOpacity 
                  onPress={() => setSecureSet(!secureSet)}
                  style={styles.eyeIcon}
                >
                  <MaterialIcons 
                    name={secureSet ? 'visibility-off' : 'visibility'} 
                    size={24} 
                    color="#94a3b8"
                  />
                </TouchableOpacity>
              </View>
              {errors.Password && <Text style={styles.errorText}>{errors.Password}</Text>}
            </View>

            {/* Global Error/Success Messages */}
            {errors.global && (
              <Text style={[
                styles.errorText, 
                errors.global.includes('successfully') && styles.successText
              ]}>
                {errors.global}
              </Text>
            )}

            {/* Signup Button */}
            <TouchableOpacity
              style={[styles.signupButton, isLoading && styles.disabledButton]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.signupButtonText}>Creating Account...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="person-add" size={20} color="#fff" />
                  <Text style={styles.signupButtonText}>Create Account</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in" size={20} color="#6366f1" />
            <Text style={styles.loginButtonText}>Have an account? Sign In</Text>
          </TouchableOpacity>
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
    paddingTop: 40,
    paddingBottom: 30,
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
  signupSection: {
    paddingVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 16,
  },
  inputFieldError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  eyeIcon: {
    padding: 4,
  },
  sendCodeButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  sendCodeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusIcon: {
    marginLeft: 8,
    padding: 4,
  },
  verifiedIcon: {
    marginLeft: 8,
    padding: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  successText: {
    color: '#10b981',
  },
  signupButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 10,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e2e8f0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
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
  loginButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});