
import React, { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserSkillsApi, fetchAllTheSkills } from "../ApiCalls/SignIn_Api";
import UltimateJobMatcherScreen from "../../components/skillsRecommand"; // adjust if moved
import { View } from "react-native";

const StatusScreen = () => {
  const [skillsPathData, setSkillsPathData] = useState([]);
  const [jobRolesData, setJobRolesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        try {
          setLoading(true);
          const userDetails = await AsyncStorage.getItem("userDetails");
          const user = JSON.parse(userDetails);

          const [skills, roles] = await Promise.all([
            getUserSkillsApi(user.Email),
            fetchAllTheSkills()
          ]);

          if (isActive) {
            setSkillsPathData(skills);
            setJobRolesData(roles);
          }
        } catch (err) {
          console.error("Error fetching data for StatusScreen:", err);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchData();

      return () => { isActive = false; };
    }, [])
  );

  return (
    <View style={{paddingTop:40,flex:1}}>
    <UltimateJobMatcherScreen
      skillsPathData={skillsPathData}
      jobRolesData={jobRolesData}
      isLoading={loading}
    />
    </View>
  );
};

export default StatusScreen;
