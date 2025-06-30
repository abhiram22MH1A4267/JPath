import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// import { StatusBar } from "expo-status-bar";

import { fetchRoleDetailsApi } from "../ApiCalls/SignIn_Api";

const { width } = Dimensions.get('window');

const JobRoleDetailScreen = ({ route, navigation }) => {
  const { categoryName, roleName } = route.params;
  const [roleDetails, setRoleDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: roleName,
      headerStyle: {
        backgroundColor: '#6366f1',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [roleName, navigation]);

  const fetchData = async () => {
    try {
      const data = await fetchRoleDetailsApi(categoryName, roleName);
      setRoleDetails(data);
      setError(null);
    } catch (err) {
      setError('Failed to load job details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [categoryName, roleName]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const renderSkillPoint = (skill, index) => (
    <View key={`${skill}-${index}`} style={styles.skillItem}>
      <View style={styles.bulletPoint}>
        <MaterialIcons name="check-circle" size={16} color="#22c55e" />
      </View>
      <Text style={styles.skillText}>{skill}</Text>
    </View>
  );

  const renderChip = (label, index) => (
    <View key={`${label}-${index}`} style={styles.chip}>
      <MaterialIcons name="business" size={16} color="#6366f1" />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.roleIconContainer}>
        <MaterialIcons name="work" size={32} color="#6366f1" />
      </View>
      <Text style={styles.roleTitle}>{roleName}</Text>
      <Text style={styles.categoryBadge}>{categoryName}</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <MaterialIcons name="error-outline" size={64} color="#ef4444" />
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="work-off" size={64} color="#d1d5db" />
      <Text style={styles.emptyTitle}>No Details Available</Text>
      <Text style={styles.emptyText}>Job role details not found.</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
        <Text style={styles.retryButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return <SafeAreaView style={styles.container}>{renderErrorState()}</SafeAreaView>;
  }

  if (!roleDetails) {
    return <SafeAreaView style={styles.container}>{renderEmptyState()}</SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar style="light" backgroundColor="#6366f1" /> */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#6366f1']}
            tintColor="#6366f1"
          />
        }
        accessibilityLabel={`Details for job role ${roleName}`}
      >
        {renderHeader()}

        <Section
          icon="description"
          title="Job Description"
          iconColor="#3b82f6"
          backgroundColor="#eff6ff"
        >
          <Text style={styles.descriptionText}>{roleDetails.description}</Text>
        </Section>

        <Section
          icon="build"
          title="Required Skills"
          iconColor="#8b5cf6"
          backgroundColor="#f3e8ff"
        >
          <View style={styles.skillsContainer}>
            {roleDetails.mergedSkills?.map(renderSkillPoint)}
          </View>
        </Section>

        <Section
          icon="trending-up"
          title="Experience Level"
          iconColor="#f59e0b"
          backgroundColor="#fef3c7"
        >
          <View style={styles.experienceContainer}>
            <MaterialIcons name="timeline" size={20} color="#f59e0b" />
            <Text style={styles.experienceText}>{roleDetails.experience}</Text>
          </View>
        </Section>

        <Section
          icon="attach-money"
          title="Salary Range"
          iconColor="#10b981"
          backgroundColor="#d1fae5"
        >
          <View style={styles.salaryContainer}>
            <MaterialIcons name="account-balance-wallet" size={20} color="#10b981" />
            <Text style={styles.salaryText}>{roleDetails.salary}</Text>
          </View>
        </Section>

        <Section
          icon="business"
          title="Top Companies"
          iconColor="#ef4444"
          backgroundColor="#fee2e2"
        >
          <View style={styles.companiesContainer}>
            {roleDetails.companyNames?.map(renderChip)}
          </View>
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
};

const Section = ({ icon, title, children, iconColor, backgroundColor }) => (
  <View style={styles.section}>
    <View style={[styles.sectionHeader, { backgroundColor }]}>
      <View style={styles.sectionIconContainer}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

export default JobRoleDetailScreen;

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
  scrollContent: {
    paddingBottom: 32,
  },
  headerContainer: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#6366f1',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
    overflow: 'hidden',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  sectionContent: {
    padding: 20,
    paddingTop: 0,
  },
  descriptionText: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    fontWeight: '500',
  },
  skillsContainer: {
    gap: 8,
  },
  skillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  bulletPoint: {
    marginRight: 12,
  },
  skillText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  experienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  experienceText: {
    fontSize: 16,
    color: '#92400e',
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
  },
  salaryText: {
    fontSize: 18,
    color: '#065f46',
    fontWeight: '700',
    marginLeft: 12,
    flex: 1,
  },
  companiesContainer: {
    marginTop: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#c7d2fe',
  },
  chipText: {
    color: '#6366f1',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
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