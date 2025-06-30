import React, { useEffect, useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  ScrollView,
  FlatList,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
  Easing,
  Linking,
  SafeAreaView,
  // StatusBar,
  ImageBackground,
} from "react-native";
import { 
  MaterialIcons, 
  Feather, 
  AntDesign, 
  Ionicons,
  MaterialCommunityIcons 
} from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchCategoriesApi, getJobApplyApi } from "../ApiCalls/SignIn_Api";

const { width, height } = Dimensions.get("screen");

const THEME = {
  GRADIENT: ['#667eea', '#764ba2'],
  GRADIENT_LIGHT: ['#a8edea', '#fed6e3'],
  GRADIENT_CARDS: [
    ['#667eea', '#764ba2'],
    ['#f093fb', '#f5576c'],
    ['#4facfe', '#00f2fe'],
    ['#43e97b', '#38f9d7'],
    ['#fa709a', '#fee140'],
  ],
  PRIMARY: '#6366f1',
  ACCENT: '#ec4899',
  BACKGROUND: '#fafafa',
  CARD_BG: '#ffffff',
  TEXT_PRIMARY: '#0f172a',
  TEXT_SECONDARY: '#64748b',
  TEXT_LIGHT: '#94a3b8',
  BORDER: '#e2e8f0',
  SHADOW: 'rgba(0, 0, 0, 0.1)',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobLinks, setJobLinks] = useState([]);
  const [greetingTime, setGreetingTime] = useState('');
  const [userName, setUserName] = useState('');

  const scrollX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const flatListRef = useRef();
  const currentIndex = useRef(0);

  // Enhanced category icons with modern design
  const categoryIcons = {
    "Software Development": { icon: "code", gradient: THEME.GRADIENT_CARDS[0] },
    "Data and Analytics": { icon: "bar-chart", gradient: THEME.GRADIENT_CARDS[1] },
    "IT and Network Management": { icon: "server", gradient: THEME.GRADIENT_CARDS[2] },
    "Cybersecurity": { icon: "shield", gradient: THEME.GRADIENT_CARDS[3] },
    "Cloud and DevOps": { icon: "cloud", gradient: THEME.GRADIENT_CARDS[4] },
    "User Experience and Design": { icon: "palette", gradient: THEME.GRADIENT_CARDS[0] },
    "Project and Product Management": { icon: "trending-up", gradient: THEME.GRADIENT_CARDS[1] },
    "Research and Development": { icon: "zap", gradient: THEME.GRADIENT_CARDS[2] },
    "Business and Strategy": { icon: "briefcase", gradient: THEME.GRADIENT_CARDS[3] },
    "Quality Assurance and Testing": { icon: "check-circle", gradient: THEME.GRADIENT_CARDS[4] },
    "AI, Machine Learning, & Deep Learning Roles": { icon: "cpu", gradient: THEME.GRADIENT_CARDS[0] },
    "Technical Support and Training": { icon: "tool", gradient: THEME.GRADIENT_CARDS[1] },
  };


  // Animation handlers
  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
      friction: 4,
      tension: 150,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 4,
      tension: 150,
    }).start();
  };

  // Initialize animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Set greeting based on time
    const hour = new Date().getHours();
    if (hour < 12) setGreetingTime('Good Morning');
    else if (hour < 17) setGreetingTime('Good Afternoon');
    else setGreetingTime('Good Evening');
  }, []);

  // Data fetching
  useEffect(() => {
    setLoading(true);
    const getjobLinks = async () => {
      try {
        const response = await getJobApplyApi();
        setJobLinks(response);
      } catch (error) {
        // console.log("Failed to fetch job links:", error);
      }
    };
    
    const getUser = async () => {
      const userDetails = await AsyncStorage.getItem('userDetails');
      // console.log('User details:', userDetails);
      const user = JSON.parse(userDetails);
      setUserName(user.Name);
    }
    getUser();
    getjobLinks();
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategoriesApi()
      .then((data) => {
        setCategories(data);
        setError(null);
      })
      .catch(() => setError("Failed to load categories"))
      .finally(() => setLoading(false));
  }, []);

  // Pulse animation
  useEffect(() => {
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
    return () => pulseAnim.stopAnimation();
  }, []);

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      if (flatListRef.current && jobLinks.length > 0) {
        currentIndex.current = (currentIndex.current + 1) % jobLinks.length;
        flatListRef.current.scrollToOffset({
          offset: currentIndex.current * width,
          animated: true,
        });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [jobLinks, width]);

  const handleChatPress = () => {
    navigation.navigate("Chatbot");
  };

  const formatSalary = (min, max) => {
    const formatNumber = (num) => {
      if (num >= 100000) return `${(num / 100000).toFixed(1)}L`;
      if (num >= 1000) return `${(num / 1000).toFixed(0)}k`;
      return num.toString();
    };
    return `₹${formatNumber(min)} - ₹${formatNumber(max)}`;
  };

  // Render functions
  const renderJobCard = ({ item, index }) => (
    <View style={{ width: width - 32, marginHorizontal: 16 }}>
      <Pressable
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.jobCard, { transform: [{ scale }] }]}>
          <LinearGradient
            colors={THEME.GRADIENT_CARDS[index % THEME.GRADIENT_CARDS.length]}
            style={styles.jobCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.jobCardHeader}>
              <View style={styles.jobCardCompany}>
                <View style={styles.companyIcon}>
                  <Feather name="briefcase" size={20} color="white" />
                </View>
                <View style={styles.companyInfo}>
                  <Text style={styles.companyName}>{item.company}</Text>
                  <Text style={styles.jobTitle} numberOfLines={2}>
                    {item.position}
                  </Text>
                </View>
              </View>
              <View style={styles.jobCardBadge}>
                <Text style={styles.badgeText}>New</Text>
              </View>
            </View>

            <View style={styles.jobCardContent}>
              <View style={styles.jobMetrics}>
                <View style={styles.metricItem}>
                  <Feather name="calendar" size={16} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.metricText}>
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  {/* <Feather name="dollar-sign" size={16} color="rgba(255,255,255,0.8)" /> */}
                  <Text style={styles.metricText}>
                    {formatSalary(item.salary_min, item.salary_max)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => Linking.openURL(item.apply_url)}
                activeOpacity={0.8}
              >
                <Text style={styles.applyButtonText}>Apply Now</Text>
                <Feather name="arrow-right" size={16} color={THEME.PRIMARY} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </View>
  );

  const renderCategoryCard = ({ item, index }) => {
    const categoryData = categoryIcons[item.categoryName] || { 
      icon: "briefcase", 
      gradient: THEME.GRADIENT_CARDS[0] 
    };
    
    return (
      <TouchableOpacity
        style={styles.categoryCard}
        onPress={() => navigation.navigate("JobRoleList", { categoryName: item.categoryName })}
        activeOpacity={0.8}
      >
        <View style={styles.categoryCardContent}>
          <LinearGradient
            colors={categoryData.gradient}
            style={styles.categoryIcon}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name={categoryData.icon} size={24} color="white" />
          </LinearGradient>
          
          <View style={styles.categoryInfo}>
            <Text style={styles.categoryTitle} numberOfLines={2}>
              {item.categoryName}
            </Text>
            {/* <Text style={styles.categorySubtitle}>
              {Math.floor(Math.random() * 50) + 10}+ jobs available
            </Text> */}
          </View>
          
          <View style={styles.categoryArrow}>
            <Feather name="chevron-right" size={20} color={THEME.TEXT_LIGHT} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuickStats = () => (
    <View style={styles.quickStats}>
      <View style={styles.statItem}>
        <View style={styles.statIcon}>
          <Feather name="briefcase" size={18} color={THEME.PRIMARY} />
        </View>
        <Text style={styles.statNumber}>{jobLinks.length}</Text>
        <Text style={styles.statLabel}>Active Jobs</Text>
      </View>
      
      <View style={styles.statDivider} />
      
      <View style={styles.statItem}>
        <View style={styles.statIcon}>
          <Feather name="users" size={18} color={THEME.SUCCESS} />
        </View>
        <Text style={styles.statNumber}>{categories.length}</Text>
        <Text style={styles.statLabel}>Categories</Text>
      </View>
      
      {/* <View style={styles.statDivider} /> */}
      
      {/* <View style={styles.statItem}>
        <View style={styles.statIcon}>
          <Feather name="trending-up" size={18} color={THEME.ACCENT} />
        </View>
        <Text style={styles.statNumber}>98%</Text>
        <Text style={styles.statLabel}>Success Rate</Text>
      </View> */}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={THEME.PRIMARY} />
        <Text style={styles.loadingText}>Loading opportunities...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Feather name="alert-circle" size={48} color={THEME.ERROR} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar barStyle="light-content" backgroundColor={THEME.GRADIENT[0]} /> */}
      
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        {/* Header */}
        <LinearGradient
          colors={THEME.GRADIENT}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greeting}>{greetingTime}</Text>
              <Text style={styles.userName}>{userName.toLowerCase().split(" ")[0] + "..."} 👋</Text>
            </View>
            
            <TouchableOpacity style={styles.notificationButton}>
              <Feather name="bell" size={24} color="white" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeNumber}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          {renderQuickStats()}
        </LinearGradient>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.scrollContent}
          bounces={false}
        >
          {/* Featured Jobs Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Hirings</Text>
              {/* <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity> */}
            </View>

            <FlatList
              ref={flatListRef}
              data={jobLinks}
              keyExtractor={(item, index) => `${item.company}-${index}`}
              renderItem={renderJobCard}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              bounces={false}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              contentContainerStyle={styles.jobCarousel}
            />

            {/* Carousel Indicators */}
            <View style={styles.indicatorContainer}>
              {jobLinks.map((_, index) => {
                const widthAnim = scrollX.interpolate({
                  inputRange: [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                  ],
                  outputRange: [8, 24, 8],
                  extrapolate: "clamp",
                });
                const opacityAnim = scrollX.interpolate({
                  inputRange: [
                    (index - 1) * width,
                    index * width,
                    (index + 1) * width,
                  ],
                  outputRange: [0.3, 1, 0.3],
                  extrapolate: "clamp",
                });
                return (
                  <Animated.View
                    key={index}
                    style={[
                      styles.indicator,
                      {
                        width: widthAnim,
                        opacity: opacityAnim,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Job Categories</Text>
              {/* <TouchableOpacity>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity> */}
            </View>

            <FlatList
              data={categories}
              keyExtractor={(item) => item.categoryName}
              renderItem={renderCategoryCard}
              scrollEnabled={false}
              contentContainerStyle={styles.categoriesContainer}
            />
          </View>
        </ScrollView>
      </Animated.View>

      {/* Floating Chat Button */}
      <TouchableOpacity
        style={styles.chatButton}
        onPress={handleChatPress}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.chatButtonInner,
            { transform: [{ scale: pulseAnim }] }
          ]}
        >
          <LinearGradient
            colors={THEME.GRADIENT}
            style={styles.chatButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Feather name="message-circle" size={24} color="white" />
          </LinearGradient>
          <View style={styles.chatNotificationBadge}>
            <Text style={styles.chatBadgeText}>1</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.BACKGROUND,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    paddingTop: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
    marginTop: 4,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: THEME.ERROR,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeNumber: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 8,
    backgroundColor:"white",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: THEME.TEXT_PRIMARY,
  },
  seeAllText: {
    fontSize: 14,
    color: THEME.PRIMARY,
    fontWeight: '600',
  },
  jobCarousel: {
    paddingLeft: 4,
  },
  jobCard: {
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: THEME.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  jobCardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  jobCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobCardCompany: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  companyIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
  },
  companyInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  jobCardBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  jobCardContent: {
    gap: 16,
  },
  jobMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  applyButton: {
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.PRIMARY,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    height: 4,
    backgroundColor: THEME.PRIMARY,
    borderRadius: 2,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    backgroundColor: THEME.CARD_BG,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: THEME.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.TEXT_PRIMARY,
    marginBottom: 4,
  },
  categorySubtitle: {
    fontSize: 14,
    color: THEME.TEXT_SECONDARY,
  },
  categoryArrow: {
    padding: 8,
  },
  chatButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 1000,
  },
  chatButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    position: 'relative',
  },
  chatButtonGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: THEME.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  chatNotificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: THEME.ERROR,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  chatBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.BACKGROUND,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: THEME.TEXT_SECONDARY,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.BACKGROUND,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: THEME.ERROR,
    textAlign: 'center',
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: THEME.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;