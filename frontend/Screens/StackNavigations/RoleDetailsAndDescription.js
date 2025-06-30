import React from "react";
import { useNavigation } from "@react-navigation/native";
// import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

const RoleDetailsAndDescription = () => {
    return (
        <View style={styles.container}>
            <Text>Required Skills and Description for the Role</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
})

export default RoleDetailsAndDescription;