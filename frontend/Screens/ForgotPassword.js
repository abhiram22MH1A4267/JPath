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
import {ForgotPasswordApi,ValidateCodeApi,ResetPasswordApi,} from "./ApiCalls/SignIn_Api"; // Your API calls
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function ForgotPassword() {
  const navigation = useNavigation();
  const [step, setStep] = useState(3);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");          // Store JWT token here
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [secureNewPassword, setSecureNewPassword] = useState(true);
  const [secureConfirmPassword, setSecureConfirmPassword] = useState(true);

  const handleEmailSubmit = async () => {
    setLoading(true);
    setErrors({});
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.edu\.in$/;

    if (!emailRegex.test(email)) {
      setErrors({ email: "Please enter a valid .edu.in email" });
      setLoading(false);
      return;
    }

    try {
      const res = await ForgotPasswordApi(email);
      setLoading(false);
      if (res.status === 200 && res.data?.success) {
        setErrors({ global: "Validation code sent to your email." });
        setToken(res.data.token || "");  // Save JWT token from backend
        setStep(2);
      } else {
        setErrors({ global: res.data?.message || "Failed to send validation code." });
      }
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data && error.response.data.message) {
        // Show backend error message for HTTP errors
        setErrors({ global: error.response.data.message });
      }else{
        setErrors({ global: "Network error occurred. Please try again." });
      }
    }
  };

  const handleCodeSubmit = async () => {
    setLoading(true);
    setErrors({});
    try {
      const res = await ValidateCodeApi(token, code);  // pass token and code
      setLoading(false);
      if (res.status === 200 && res.data?.success) {
        setErrors({ global: "Code validated successfully!" });
        setStep(3);
      } else {
        setErrors({ code: res.data?.message || "Invalid validation code." });
      }
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data && error.response.data.message) {
        // Show backend error message for HTTP errors
        setErrors({ code: error.response.data.message });
      }else{
        setErrors({ global: "Network error occurred. Please try again." });
      }
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setErrors({});
    // console.log("handlePasswordReset",newPassword);
    const passwordPattern = /^(?=.[A-Z])(?=.[a-z])(?=.[0-9])(?=.[@])[A-Za-z0-9@]{8,30}$/;
    if (!newPassword){ 
      setErrors({ newPassword: "Password is required"});
      setLoading(false);
      return;      
    }
    else if (!passwordPattern.test(newPassword)) {
      if (newPassword.length < 8 || newPassword.length > 30) {
        setErrors({ newPassword:"Password must be 8-30 characters long."});
        setLoading(false);
        return;
      } else {
        if (!/[A-Z]/.test(newPassword)) {
          setErrors({ newPassword:"Password must contain at least one uppercase letter."});
          setLoading(false);
          return;
        } else if (!/[a-z]/.test(newPassword)) {
          setErrors({ newPassword:"Password must contain at least one lowercase letter."});
          setLoading(false);
          return;         
        } else if (!/[0-9]/.test(newPassword)) {
          setErrors({ newPassword:"Password must contain at least one number."});
          setLoading(false);
          return;         
        } else if (!/@/.test(newPassword)) {
          setErrors({ newPassword:"Password must contain at least one spcecial character."});
          setLoading(false);
          return;         
        }
      }
    }

    if (newPassword.length < 8) {
      setErrors({ newPassword: "Password must be at least 8 characters." });
      setLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match. king" });
      setLoading(false);
      return;
    }

    try {
      const res = await ResetPasswordApi(token, newPassword); // pass token and newPassword
      setLoading(false);
      if (res.status === 200 && res.data?.success) {
        setErrors({ global: "Password reset successfully. Redirecting to login..." });
        setTimeout(() => navigation.navigate("Login"), 2000);
      } else {
        setErrors({ global: res.data?.message || "Failed to reset password. Please try again." });
      }
    } catch (error) {
      setLoading(false);
      setErrors({ global: "Network error occurred. Please try again." });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Ionicons name="lock-open" size={32} color="#fff" />
          <Text style={styles.headerTitle}>Reset Password</Text>
          <Text style={styles.headerSubtitle}>
            {step === 1 && "Enter your email to get started"}
            {step === 2 && "Check your email for verification code"}
            {step === 3 && "Create your new password"}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mainContent}>
          <View style={styles.resetSection}>
            {/* Step Indicator */}
            <View style={styles.stepIndicator}>
              <View style={[styles.stepDot, step >= 1 && styles.activeStep]}>
                <Text style={[styles.stepText, step >= 1 && styles.activeStepText]}>1</Text>
              </View>
              <View style={[styles.stepLine, step >= 2 && styles.activeStepLine]} />
              <View style={[styles.stepDot, step >= 2 && styles.activeStep]}>
                <Text style={[styles.stepText, step >= 2 && styles.activeStepText]}>2</Text>
              </View>
              <View style={[styles.stepLine, step >= 3 && styles.activeStepLine]} />
              <View style={[styles.stepDot, step >= 3 && styles.activeStep]}>
                <Text style={[styles.stepText, step >= 3 && styles.activeStepText]}>3</Text>
              </View>
            </View>

            {/* Email Input - always visible but disabled after step 1 */}
            <View style={styles.inputContainer}>
              <View style={[styles.inputWrapper, step !== 1 && styles.disabledInput]}>
                <Ionicons name="mail" size={20} color="#6366f1" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  value={email}
                  onChangeText={step === 1 ? setEmail : undefined}
                  editable={step === 1}
                  style={[
                    styles.inputField,
                    errors.email && styles.inputFieldError,
                    step !== 1 && styles.disabledText,
                  ]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94a3b8"
                />
                {step !== 1 && (
                  <View style={styles.statusIcon}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  </View>
                )}
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Step 1: Send code button */}
            {step === 1 && (
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.disabledButton]}
                onPress={handleEmailSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#fff" />
                    <Text style={styles.primaryButtonText}>Sending...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="#fff" />
                    <Text style={styles.primaryButtonText}>Send Validation Code</Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Step 2: Validation code input + validate button */}
            {step === 2 && (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="shield-checkmark" size={20} color="#6366f1" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Enter 6-digit code"
                      value={code}
                      onChangeText={setCode}
                      style={[styles.inputField, errors.code && styles.inputFieldError]}
                      keyboardType="numeric"
                      maxLength={6}
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                  {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
                </View>
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.disabledButton]}
                  onPress={handleCodeSubmit}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.primaryButtonText}>Validating...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.primaryButtonText}>Validate Code</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Step 3: Reset password inputs and button */}
            {step === 3 && (
              <>
                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed" size={20} color="#6366f1" style={styles.inputIcon} />
                    <TextInput
                      placeholder="New Password"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={secureNewPassword}
                      style={[styles.inputField, errors.newPassword && styles.inputFieldError, { flex: 1 }]}
                      autoCapitalize="none"
                      placeholderTextColor="#94a3b8"
                    />
                    <TouchableOpacity 
                      onPress={() => setSecureNewPassword(!secureNewPassword)}
                      style={styles.eyeIcon}
                    >
                      <MaterialIcons 
                        name={secureNewPassword ? 'visibility-off' : 'visibility'} 
                        size={24} 
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.newPassword && <Text style={styles.errorText}>{errors.newPassword}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="lock-closed" size={20} color="#6366f1" style={styles.inputIcon} />
                    <TextInput
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={secureConfirmPassword}
                      style={[styles.inputField, errors.confirmPassword && styles.inputFieldError, { flex: 1 }]}
                      autoCapitalize="none"
                      placeholderTextColor="#94a3b8"
                    />
                    <TouchableOpacity 
                      onPress={() => setSecureConfirmPassword(!secureConfirmPassword)}
                      style={styles.eyeIcon}
                    >
                      <MaterialIcons 
                        name={secureConfirmPassword ? 'visibility-off' : 'visibility'} 
                        size={24} 
                        color="#94a3b8"
                      />
                    </TouchableOpacity>
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>

                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.disabledButton]}
                  onPress={handlePasswordReset}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" />
                      <Text style={styles.primaryButtonText}>Resetting...</Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="save" size={20} color="#fff" />
                      <Text style={styles.primaryButtonText}>Reset Password</Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            {/* Global Messages */}
            {errors.global && (
              <Text style={[
                styles.errorText, 
                (errors.global.includes('successfully') || errors.global.includes('sent')) && styles.successText
              ]}>
                {errors.global}
              </Text>
            )}
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
            <Ionicons name="arrow-back" size={20} color="#6366f1" />
            <Text style={styles.loginButtonText}>Back to Login</Text>
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
  resetSection: {
    paddingVertical: 20,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  activeStep: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  stepText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
  },
  activeStepText: {
    color: '#fff',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginHorizontal: 8,
  },
  activeStepLine: {
    backgroundColor: '#6366f1',
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
  disabledInput: {
    backgroundColor: '#f1f5f9',
    borderColor: '#cbd5e1',
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
  disabledText: {
    color: '#64748b',
  },
  inputFieldError: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  eyeIcon: {
    padding: 4,
  },
  statusIcon: {
    marginLeft: 8,
    padding: 4,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
    textAlign: 'center',
  },
  successText: {
    color: '#10b981',
  },
  primaryButton: {
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
  primaryButtonText: {
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