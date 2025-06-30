// import React from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { FontAwesome } from "react-native-vector-icons";


// import BottomBar from "../BottomBarNavigations/BottomBar";

// //Profile Screen Navigations
// import PeronalInfoScreen from "./PersonalInfoScreen";
// import ResumeScreen from "./ResumeScreen";
// import SkillsScreen from "./SkillsScreen";

// //Home Screen Navigations
// import RoleDetailsAndDescription from "./RoleDetailsAndDescription";

// const StackNavigation = () => {
//     const Stack = createStackNavigator();
//     return (
//         // <NavigationContainer>
//             <Stack.Navigator screenOptions={({ route }) => ({
//                 tabBarActiveTintColor: "green",
//                 tabBarInactiveTintColor: 'black',
//                 tabBarIcon: ({ focused, color }) => {    
//                     let iconName;
//                     if (route.name == 'Resume') {
//                         iconName = focused ? 'home' : 'home-outline'
//                     }
//                     return <FontAwesome name={iconName} color={color} size={28} />
//                 },
//                 tabBarStyle: {
//                     height: 70,
//                 },
//                 tabBarLabel: ({ focused, color }) => (
//                     focused ? <Text>{route.name}</Text> : <></>
//                 ),
//                 tabBarLabelStyle: {
//                     fontSize: 15,
//                     fontWeight: 'bold',
//                 },
//             })}>
//                 <Stack.Screen name="BottomBar" component={BottomBar} options={{headerShown: false}}/>
//                 <Stack.Screen name="PersonalInfo" component={PeronalInfoScreen} />
//                 <Stack.Screen name="Resume" component={ResumeScreen} />
//                 <Stack.Screen name="Skills" component={SkillsScreen} />

//                 <Stack.Screen name="Role" component={RoleDetailsAndDescription} />
//             </Stack.Navigator>
//         // </NavigationContainer>
//     );
// }

// export default StackNavigation;


import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { FontAwesome } from "react-native-vector-icons";


import BottomBar from "../BottomBarNavigations/BottomBar";

//Profile Screen Navigations
import PeronalInfoScreen from "./PersonalInfoScreen";
import ResumeScreen from "./ResumeScreen";
import SkillsScreen from "./SkillsScreen";

//Home Screen Navigations
import JobRoleListScreen from "./JobRoles";
import JobRoleDetailScreen from "./JobRoleDetails";

//chatBot in the Home Screen
import JobChatbot from "./JobChatbot";


//Status Match Job View
import JobDetailScreen from "../../components/JobDetailsScreen";


const StackNavigation = () => {
    const Stack = createStackNavigator();
    return (
        // <NavigationContainer>
            <Stack.Navigator screenOptions={({ route }) => ({
                headerStyle: {
                    backgroundColor: route.name === 'Home' ? 'red' : '#f15d49',
                  },
                tabBarActiveTintColor: "green",
                tabBarInactiveTintColor: 'black',
                tabBarIcon: ({ focused, color }) => {    
                    let iconName;
                    if (route.name == 'Resume') {
                        iconName = focused ? 'home' : 'home-outline'
                    }
                    return <FontAwesome name={iconName} color={color} size={28} />
                },
                tabBarStyle: {
                    height: 70,
                },
                tabBarLabel: ({ focused, color }) => (
                    focused ? <Text>{route.name}</Text> : <></>
                ),
                tabBarLabelStyle: {
                    fontSize: 15,
                    fontWeight: 'bold',
                },
            })}>
                <Stack.Screen name="BottomBar" component={BottomBar} options={{headerShown: false}}/>

                
                <Stack.Screen name="PersonalInfo" component={PeronalInfoScreen} options={{ headerShown: false}} />
                <Stack.Screen name="Resume" component={ResumeScreen} options={{ headerShown: false}} />
                <Stack.Screen name="Skills" component={SkillsScreen} options={{ headerShown: false}} />

                <Stack.Screen name="JobRoleList" component={JobRoleListScreen} />
                <Stack.Screen name="JobRoleDetail" component={JobRoleDetailScreen} />

                <Stack.Screen name="Chatbot" component={JobChatbot} options={{ headerShown: false}} />

                <Stack.Screen name ="JobMatchView" component = {JobDetailScreen}  options={{ headerShown: false}} />
            </Stack.Navigator>
        //</NavigationContainer>
    );
}

export default StackNavigation;