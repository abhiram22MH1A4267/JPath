import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
// import { StatusBar } from "expo-status-bar";
import {
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Button } from "react-native-paper";
import { MaterialIcons } from '@expo/vector-icons';
import { fetchRolesByCategoryApi } from "../ApiCalls/SignIn_Api";

const { width } = Dimensions.get('window');

const JobRoleListScreen = ({ route, navigation }) => {
  const { categoryName } = route.params;
  // console.log("categoryName: ", categoryName);
  const [jobRoles, setJobRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({ 
      title: categoryName,
      headerStyle: {
        backgroundColor: '#6366f1',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [categoryName, navigation]);

  const fetchData = async () => {
    try {
      const data = await fetchRolesByCategoryApi(categoryName);
      setJobRoles(data);
      setError(null);
    } catch (err) {
      setError('Failed to load job roles');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryName]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderRoleItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.listItem, { 
        transform: [{ scale: 1 }],
        opacity: 1,
      }]}
      onPress={() => navigation.navigate('JobRoleDetail', { 
        categoryName, 
        roleName: item.roleName 
      })}
      accessibilityLabel={`Job Role: ${item.roleName}`}
      activeOpacity={0.8}
    >
      <View style={styles.roleIconContainer}>
        <MaterialIcons name="work" size={24} color="#6366f1" />
      </View>
      
      <View style={styles.listContentV}>
        <Text style={styles.listItemText}>{item.roleName}</Text>
        <Text style={styles.categoryText}>{categoryName}</Text>
      </View>
      
      <View style={styles.chevronContainer}>
        <MaterialIcons name="chevron-right" size={28} color="#9ca3af" />
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Available Roles</Text>
      <Text style={styles.headerSubtitle}>
        {jobRoles.length} role{jobRoles.length !== 1 ? 's' : ''} found in {categoryName}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="work-off" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Roles Available</Text>
      <Text style={styles.emptyText}>
        We couldn't find any job roles in the {categoryName} category at the moment.
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={64} color="#ef4444" />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading job roles...</Text>
      </View>
    );
  }

  if (error) {
    return <SafeAreaView style={styles.container}>{renderErrorState()}</SafeAreaView>;
  }

  if (!jobRoles || jobRoles.length === 0) {
    return <SafeAreaView style={styles.container}>{renderEmptyState()}</SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar style="light" backgroundColor="#6366f1" /> */}
      <FlatList
        data={jobRoles}
        keyExtractor={(item, index) => `${item.roleName}-${index}`}
        renderItem={renderRoleItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        accessibilityRole="list"
      />
    </SafeAreaView>
  );
};

export default JobRoleListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: '#f8fafc',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  listItem: {
    backgroundColor: 'white',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  roleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  listContentV: {
    flex: 1,
  },
  listItemText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  chevronContainer: {
    padding: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#dc2626',
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});