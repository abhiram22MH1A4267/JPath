import React from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Icon from "react-native-vector-icons/Ionicons"

import HomeScreen from "./HomeScreen";
import StatusScreen from "./StatusScreen";
import ProfileScreen from "./ProfileScreen";

const BottomBar = () => {
    const BottomTab = createBottomTabNavigator();
    return (
            <BottomTab.Navigator screenOptions={({ route }) => ({
                
                headerShown: false,
                tabBarActiveTintColor: "#6366f1", 
                tabBarInactiveTintColor: '#6B7280', // Muted gray
                tabBarIcon: ({ focused, color }) => {
                    let IconName;
                    if (route.name == 'Home') {
                        IconName = focused ? 'home' : 'home-outline'
                    }
                    else if (route.name == 'Status') {
                        IconName = focused ? "analytics" : "analytics-outline"
                    }
                    else if (route.name == 'Profile') {
                        IconName = focused ? "person" : 'person-outline'
                    }
                    if(route.name == 'Status'){
                        return <View style={[styles.StatusIcon,focused?{position:"relative",top:-20}:{}]}><Icon name={IconName} color={focused ? "#FFFFFF" : "#FFFFFF"}  size={40} /></View>
                    }else{
                        return <Icon name={IconName} color={color} size={28} style={focused ? {} : {position:"relative",top:10}} />
                    }
                },
                tabBarStyle: {
                    height: 90,
                    backgroundColor: '#FFFFFF', // Clean white background
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB', // Light border
                    shadowColor: "#000",
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 8,
                },
                tabBarLabel: ({ focused, color }) => {
                    if(focused)return <Text style={{color:"#6366f1",fontSize:20,fontWeight:'700'}}>{route.name}</Text> 
                },
                tabBarLabelStyle: {
                    fontSize: 15,
                },
                tabBarButton: (props) => <TouchableOpacity activeOpacity={1} {...props} />,
            })}
            >
                <BottomTab.Screen name="Home" component={HomeScreen} />
                <BottomTab.Screen name="Status" component={StatusScreen} />
                <BottomTab.Screen name="Profile" component={ProfileScreen} />
            </BottomTab.Navigator>
    );
}

export default BottomBar;

const styles = StyleSheet.create({
  StatusIcon:{
    backgroundColor: "#6366f1", // Primary signup blue
    width: 70,
    height: 70,
    borderRadius: 35, // Use numeric value instead of percentage
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    top: -10,
    padding: 10,
    shadowColor: "#4A90E2",
    shadowOffset: {
        width: 0,
        height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: "#FFFFFF", // White border for clean look
  }
})