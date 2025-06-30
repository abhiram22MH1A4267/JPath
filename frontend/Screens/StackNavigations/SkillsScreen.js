import React from "react";
import { useNavigation } from "@react-navigation/native";
// import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import CertificateDownloader from "../../components/certficateValidation";

const SkillsScreen = () => {
    return (
        // <View style={styles.container}>
        //     <Text>Skills Screen</Text>
        // </View>
        <CertificateDownloader />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default SkillsScreen;




// npm install react-native-tesseract-ocr react-native-fs


// import React, { useState } from 'react';
// import { View, Button, Alert, TextInput, Text } from 'react-native';
// import TesseractOcr from 'react-native-tesseract-ocr';
// import RNFS from 'react-native-fs';

// const CertificateValidationScreen = () => {
//   const [userName, setUserName] = useState('');
//   const [imageUri, setImageUri] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   // Function to download the image
//   const downloadImage = async (url) => {
//     setIsLoading(true);
//     try {
//       const filePath = `${RNFS.CachesDirectoryPath}/certificate.jpg`;  // Save to cache directory
//       await RNFS.downloadFile({ fromUrl: url, toFile: filePath }).promise;
//       setImageUri(filePath);
//       alert('Image downloaded successfully!');
//     } catch (error) {
//       console.error('Error downloading image:', error);
//       Alert.alert('Error', 'Failed to download the certificate image');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // OCR to read text from the image
//   const performOCR = async () => {
//     if (!imageUri) {
//       Alert.alert('Error', 'No certificate image available!');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const recognizedText = await TesseractOcr.recognize(imageUri, 'eng', {
//         whitelist: null,
//         blacklist: null,
//       });

//       // Extract the user name from the recognized text
//       const match = recognizedText.toLowerCase().includes(userName.toLowerCase());

//       if (match) {
//         Alert.alert('Success', 'The name matches!');
//       } else {
//         Alert.alert('Error', 'The name does not match!');
//       }
//     } catch (error) {
//       console.error('Error recognizing text:', error);
//       Alert.alert('Error', 'Failed to recognize text from the certificate image');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text style={{ marginBottom: 20 }}>Enter User Name</Text>
//       <TextInput
//         style={{
//           height: 40,
//           borderColor: 'gray',
//           borderWidth: 1,
//           width: '80%',
//           marginBottom: 20,
//           paddingLeft: 8,
//         }}
//         placeholder="User Name"
//         onChangeText={setUserName}
//         value={userName}
//       />

//       <Button
//         title="Download Certificate"
//         onPress={() => downloadImage('https://example.com/certificate.jpg')}
//         disabled={isLoading}
//       />

//       <Button
//         title="Validate User Name"
//         onPress={performOCR}
//         disabled={!imageUri || isLoading}
//       />

//       {isLoading && <Text>Loading...</Text>}
//     </View>
//   );
// };

// export default CertificateValidationScreen;
