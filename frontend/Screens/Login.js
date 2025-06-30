// import React, { useState } from "react";
// import {View,Text,TextInput,StyleSheet,Image,ScrollView,} from "react-native";
// import { Button } from "react-native-paper";
// import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import { LogInAPi } from "./ApiCalls/SignIn_Api";

// /**
//  * Login screen with inline validation
//  *  • Fields: Email, Password
//  *  • Rules:
//  *      – Email must be a *.edu.in address
//  *      – Password ≥ 8 characters
//  *  • Errors display below each field with red border highlight
//  */
// export default function Login() {
//   const navigation = useNavigation();

//   const [form, setForm] = useState({
//     Email: "",
//     Password: "",
//   });

//   const [errors, setErrors] = useState({});

//   /**
//    * Update single field & clear its error in real‑time
//    */
//   const handleChange = (field, value) => {
//     setForm((prev) => ({ ...prev, [field]: value }));
//     if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
//   };

//   /**
//    * Validate email & password
//    */
//   const validate = () => {
//     const { Email, Password } = form;
//     const newErrors = {};

//     const eduRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.in$/

//     if (!Email.trim()) newErrors.Email = "Email is required";
//     else if (!eduRegex.test(Email)) newErrors.Email = "Use a valid .edu.in email";

//     if (!Password) newErrors.Password = "Password is required";
//     else if (Password.length < 8)
//       newErrors.Password = "Password must be at least 8 characters";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   /**
//    * Attempt login → on success store credentials & navigate Home
//    */
//   const NavToHome = async () => {
//     if (!validate()) return;

//     const newErrors = {};
//     const res = await LogInAPi(form);
//     // console.log(res.data.result);
//     if (res.status === 200) newErrors.Email = res.data.message;
//     else if (res.status === 201) newErrors.Password = res.data.message;
//     else if (res.status === 202) {
//       await AsyncStorage.setItem("isLoggedIn", "true");

//       const userDetailsString = JSON.stringify(res.data.result);
//       await AsyncStorage.setItem("userDetails", userDetailsString);

//     //   const userDetails = await AsyncStorage.getItem('userDetails');
//     //   console.log(userDetails);

//       navigation.reset({ index: 0, routes: [{ name: "Home" }] });
//     } else {
//       setErrors({ global: "Unknown error occurred" });
//     }
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   return (
//     <ScrollView>
//       <View style={Style1.Page}>
//         <Image
//           source={require("../assets/WaveBlueTop2.jpg")}
//           style={{ width: "100%", height: 246, resizeMode: "cover" }}
//         />

//         <View style={Style1.SignupPage}>
//           <Text style={Style1.Heading}>Login</Text>

//           {[
//             { field: "Email", placeholder: "Email" },
//             { field: "Password", placeholder: "Password", secure: true },
//           ].map(({ field, placeholder, secure }) => (
//             <View key={field} style={{ width: 300 }}>
//               <TextInput
//                 placeholder={placeholder}
//                 value={form[field]}
//                 onChangeText={(text) => handleChange(field, text)}
//                 style={[Style1.InputField, errors[field] && Style1.InputFieldError]}
//                 secureTextEntry={secure}
//                 autoCapitalize={field === "Email" ? "none" : "sentences"}
//                 keyboardType={field === "Email" ? "email-address" : "default"}
//               />
//               {errors[field] && <Text style={Style1.ErrorText}>{errors[field]}</Text>}
//             </View>
//           ))}

//           {errors.global && <Text style={Style1.ErrorText}>{errors.global}</Text>}
//           <Button mode="text" onPress={() => navigation.navigate("ForgotPassword")} style={Style1.ForgotPasswordButton}>Forgot Password?</Button>
//           <Button  mode="contained"  rippleColor="white"  style={Style1.ButtonStyle1}  onPress={NavToHome}>Login</Button>
//         </View>

//         <View style={Style1.ToLogInPage}>
//           <Image  source={require("../assets/WaveBlueBottom2.jpg")}  style={{ width: "100%", height: 250 }}/>
//           <Button mode="contained" rippleColor="white" style={[Style1.ButtonStyle2, Style1.positonStyle]} onPress={() => navigation.navigate("Signup")} >
//             <Text style={Style1.TextStyle1}>No account yet? Signup</Text>
//           </Button>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }

// const Style1 = StyleSheet.create({
//   Page: {
//     padding: 0,
//   },
//   SignupPage: {
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#fff",
//     padding: 20,
//   },
//   Heading: {
//     color: "#f15d49",
//     fontSize: 40,
//     fontWeight: "900",
//   },
//   InputField: {
//     width: "100%",
//     fontSize: 18,
//     backgroundColor: "white",
//     padding: 10,
//     borderColor: "black",
//     borderWidth: 2,
//     borderRadius: 5,
//     marginVertical: 6,
//   },
//   InputFieldError: {
//     borderColor: "#dc2626",
//   },
//   ErrorText: {
//     color: "#dc2626",
//     fontSize: 14,
//     marginBottom: 8,
//     marginTop: -4,
//   },
//   ButtonStyle1: {
//     backgroundColor: "#f15d49",
//     padding: 2,
//     borderRadius: 30,
//     marginTop: 10,
//   },
//   ButtonStyle2: {
//     borderColor: "#2279E9",
//     borderWidth: 0,
//     borderRadius: 10,
//     backgroundColor: "white",
//     padding: 0,
//     width: 225,
//   },
//   ForgotPasswordButton: {
//     // marginTop: 0,
//     marginLeft: 150,
//     color: "#f15d49",
//   },  
//   TextStyle1: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "black",
//   },
//   positonStyle: {
//     position: "absolute",
//     top: 10,
//     left: 65,
//   },
//   ToLogInPage: {
//     position: "relative",
//   },
// });
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
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LogInAPi } from "./ApiCalls/SignIn_Api";

const { width, height } = Dimensions.get('window');

/**
 * Login screen with inline validation and modern UI theme
 *  • Fields: Email, Password
 *  • Rules:
 *      – Email must be a *.edu.in address
 *      – Password ≥ 8 characters with specific requirements
 *  • Errors display below each field with red border highlight
 */
export default function Login() {
  const navigation = useNavigation();
  const [secureSet, setsecureSet] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    Email: "",
    Password: "",
  });

  const [errors, setErrors] = useState({});

  /**
   * Update single field & clear its error in real‑time
   */
  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  /**
   * Validate email & password
   */
  const validate = () => {
    const { Email, Password } = form;
    const newErrors = {};

    const eduRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.in$/;

    if (!Email.trim()) newErrors.Email = "Email is required";
    else if (!eduRegex.test(Email)) newErrors.Email = "Use a valid .edu.in email";

    const passwordPattern = /^(?=.[A-Z])(?=.[a-z])(?=.[0-9])(?=.[@])[A-Za-z0-9@]{8,30}$/;
    if (!Password) newErrors.Password = "Password is required";
    else if (!passwordPattern.test(Password)){
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

  /**
   * Attempt login → on success store credentials & navigate Home
   */
  const NavToHome = async () => {
    if (!validate()) return;

    setIsLoading(true);
    const newErrors = {};
    
    try {
      const res = await LogInAPi(form);
      
      if (res.status === 200) newErrors.Email = res.data.message;
      else if (res.status === 201) newErrors.Password = res.data.message;
      else if (res.status === 202) {
        await AsyncStorage.setItem("isLoggedIn", "true");
        const userDetailsString = JSON.stringify(res.data.result);
        await AsyncStorage.setItem("userDetails", userDetailsString);
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
        return;
      } else {
        setErrors({ global: "Unknown error occurred" });
      }
      setErrors(newErrors);
    } catch (error) {
      setErrors({ global: "Login failed. Please try again." });
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
          {/* <Ionicons name="log-in" size={32} color="#fff" /> */}
          <Text style={styles.headerTitle}>JobPath</Text>
          <Text style={styles.headerSubtitle}>Sign in to your account</Text>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.mainContent}>
          <View style={styles.loginSection}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail" size={20} color="#6366f1" style={styles.inputIcon} />
                <TextInput
                  placeholder="Email Address"
                  value={form.Email}
                  onChangeText={(text) => handleChange("Email", text)}
                  style={[styles.inputField, errors.Email && styles.inputFieldError]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#94a3b8"
                />
              </View>
              {errors.Email && <Text style={styles.errorText}>{errors.Email}</Text>}
            </View>

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
                  onPress={() => setsecureSet(!secureSet)}
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

            {errors.global && <Text style={styles.errorText}>{errors.global}</Text>}

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={NavToHome}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text style={styles.loginButtonText}>Signing In...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="log-in" size={20} color="#fff" />
                  <Text style={styles.loginButtonText}>Sign In</Text>
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
            style={styles.signupButton}
            onPress={() => navigation.navigate("Signup")}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={20} color="#6366f1" />
            <Text style={styles.signupButtonText}>Create New Account</Text>
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
  loginSection: {
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
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
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
  },
  loginButtonText: {
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
  signupButton: {
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
  signupButtonText: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});