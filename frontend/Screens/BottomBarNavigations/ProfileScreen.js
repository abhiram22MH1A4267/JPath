import React, { useEffect, useState, useCallback } from 'react';
import { 
    View, 
    Text, 
    Image, 
    TouchableOpacity, 
    StyleSheet, 
    ScrollView,
    Dimensions,
    ImageBackground,
    Alert,
    RefreshControl // Add RefreshControl for pull-to-refresh
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Circle } from 'react-native-svg';
import { 
    Entypo, 
    MaterialIcons, 
    Feather, 
    AntDesign, 
    Ionicons 
} from "react-native-vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { getTopThreeApi, getUserApi } from '../ApiCalls/SignIn_Api';
import { useFocusEffect } from '@react-navigation/native'; // Add this import
import CircularPersentage from '../../components/circle';
const { width, height } = Dimensions.get('window');

const THEME = {
    GRADIENT: ['#667eea', '#764ba2'],
    GRADIENT_LIGHT: ['#a8edea', '#fed6e3'],
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

const ProfileScreen = ({ navigation }) => {
    const [MyImage, setMyImage] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [display, setDisplay] = useState(false);
    const [jobRoles, setJobRoles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // Add refreshing state

    const [stats, setStats] = useState({
        certifications: 0,
        completedJobs: 0,
        matchingJobs: 0
    });

    // Create a function to load all user data
    const loadUserData = useCallback(async () => {
        try {
            setIsLoading(true);
            const userDetails = await AsyncStorage.getItem('userDetails');
            if (userDetails) {
                const user = JSON.parse(userDetails);
                setName(user.Name || '');
                setEmail(user.Email || '');
                setMyImage(user.profileImage || null);
                
                // Fetch job roles if email exists
                if (user.Email) {
                    await fetchJobRoles(user.Email);
                    const res = await getUserApi(user.Email);
                    
                    // Process the user API response to extract stats
                    if (res) {
                        setStats({
                            certifications: res.CertificationLinks?.length || 0,
                            completedJobs: res.completedJobRoles?.length || 0,
                            matchingJobs: jobRoles.length
                        });
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load user details:', error);
        } finally {
            setIsLoading(false);
        }
    }, [jobRoles.length]);

    // Separate function for fetching job roles
    const fetchJobRoles = useCallback(async (userEmail) => {
        try {
            // console.log('Fetching job roles for email:', userEmail);
            const response = await getTopThreeApi(userEmail);
            // console.log('Job roles response:', response);
            
            if (response && Array.isArray(response)) {
                setJobRoles(response);
                // Update stats with matching jobs count
                setStats(prevStats => ({
                    ...prevStats,
                    matchingJobs: response.length
                }));
            } else {
                // console.log('Invalid response format:', response);
                setJobRoles([]);
                setStats(prevStats => ({
                    ...prevStats,
                    matchingJobs: 0
                }));
            }
        } catch (error) {
            console.error('Error fetching job roles:', error);
            setJobRoles([]);
            setStats(prevStats => ({
                ...prevStats,
                matchingJobs: 0
            }));
        }
    }, []);

    // Pull-to-refresh handler
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadUserData();
        setRefreshing(false);
    }, [loadUserData]);

    // Manual refresh function for buttons
    const handleManualRefresh = useCallback(async () => {
        await loadUserData();
    }, [loadUserData]);

    // Load data when component mounts
    useEffect(() => {
        loadUserData();
    }, [loadUserData]);

    // Refresh data every time screen comes into focus
    useFocusEffect(
        useCallback(() => {
            // console.log('ProfileScreen focused - refreshing data');
            loadUserData();
        }, [loadUserData])
    );

    // Auto-refresh every 30 seconds (optional)
    useEffect(() => {
        const interval = setInterval(() => {
            if (email) {
                // console.log('Auto-refreshing job roles...');
                fetchJobRoles(email);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [email, fetchJobRoles]);

    useEffect(() => {
        const setProfileImage = async () => {
            if (MyImage && MyImage.startsWith('file://')) {
                try {
                    const userDetails = await AsyncStorage.getItem('userDetails');
                    const user = JSON.parse(userDetails);
                    user.profileImage = MyImage;
                    await AsyncStorage.setItem('userDetails', JSON.stringify(user));
                } catch (error) {
                    console.error('Failed to set profile image:', error);
                }
            }
        };
        setProfileImage();
    }, [MyImage]);

    const OpenGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert("Permission required to access gallery");
            return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled && result.assets.length > 0) {
            setMyImage(result.assets[0].uri);
        }
    };

    const logOut = async () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel' },
            {
                text: 'Logout',
                onPress: async () => {
                    try {
                        await AsyncStorage.multiRemove([
                            "isLoggedIn",
                            "Email",
                            "Password",
                            "userDetails",
                        ]);
                        // console.log("Logout successful");
                        navigation.navigate('Loader');
                    } catch (error) {
                        console.error("Error logging out:", error);
                    }
                },
            },
        ]);
    };

    const CircularProgress = ({ JobRole }) => {
        const size = 70;
        const strokeWidth = 6;
        const color = THEME.SUCCESS;
        
        const score = JobRole._score || JobRole.score || 0;
        const roleName = JobRole.roleName || 'Unknown Role';
        const percentage = Math.round(score * 100);
        
        return (
            <View style={styles.progressCard}>
                <View style={styles.progressContainer}>
                    {/* <View style={[styles.circleOuter, { borderColor: `${color}20` }]}>
                        <View style={[
                            styles.circleProgress,
                            {
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                                borderWidth: strokeWidth,
                                borderColor: `${color}30`,
                                // borderColor: "red",
                                borderTopColor: color,
                                borderRightColor: color
                            }
                        ]} />
                        <View style={styles.percentageContainer}>
                            <Text style={[styles.percentageText, { color }]}>{percentage}%</Text>
                            </View>
                    </View> */}
                    <CircularPersentage percentage={percentage} />
                </View>
                <Text style={styles.roleText}>{roleName}</Text>
            </View>
        );
    };

    const StatCard = ({ title, value, icon }) => (
        <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
                <Feather name={icon} size={20} color={THEME.PRIMARY} />
            </View>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{title}</Text>
        </View>
    );

    const ActionButton = ({ title, icon, onPress, gradient = false }) => (
        <TouchableOpacity onPress={onPress} style={styles.actionButtonContainer}>
            {gradient ? (
                <LinearGradient
                    colors={THEME.GRADIENT}
                    style={styles.actionButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                >
                    <Feather name={icon} size={20} color="white" />
                    <Text style={[styles.actionButtonText, { color: 'white' }]}>{title}</Text>
                </LinearGradient>
            ) : (
                <View style={[styles.actionButton, { backgroundColor: THEME.CARD_BG }]}>
                    <Feather name={icon} size={20} color={THEME.TEXT_PRIMARY} />
                    <Text style={styles.actionButtonText}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );

    const renderJobRoles = () => {
        if (isLoading) {
            return (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading career matches...</Text>
                </View>
            );
        }

        if (!jobRoles || jobRoles.length === 0) {
            return (
                <View style={styles.noMatchesContainer}>
                    <Text style={styles.noMatchesText}>No career matches found</Text>
                    <Text style={styles.noMatchesSubText}>Complete your profile to get better matches</Text>
                    <TouchableOpacity style={styles.refreshButton} onPress={handleManualRefresh}>
                        <Feather name="refresh-cw" size={16} color={THEME.PRIMARY} />
                        <Text style={styles.refreshButtonText}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                {jobRoles.map((job, index) => (
                    <CircularProgress key={`${job.roleName}-${index}`} JobRole={job} />
                ))}
            </ScrollView>
        );
    };

    return (
        <View style={styles.container}>
            {display && (
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setDisplay(false)}
                    style={styles.overlay}
                />
            )}

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                bounces={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={[THEME.PRIMARY]}
                        tintColor={THEME.PRIMARY}
                        title="Pull to refresh..."
                        titleColor={THEME.TEXT_SECONDARY}
                    />
                }
            >
                {/* Header Section */}
                <LinearGradient
                    colors={THEME.GRADIENT}
                    style={styles.headerContainer}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <View style={styles.headerTop}>
                        <Text style={styles.headerTitle}>Profile</Text>
                        <View style={styles.headerActions}>
                            <TouchableOpacity style={styles.dropdownItem} onPress={logOut}>
                                <Feather name="log-out" size={28} color={"white"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.profileSection}>
                        <TouchableOpacity onPress={OpenGallery} style={styles.profileImageContainer}>
                            <Image
                                source={MyImage ? { uri: MyImage } : require('../../assets/DummyUserProfile.png')}
                                style={styles.profileImage}
                            />
                            <View style={styles.cameraIcon}>
                                <Feather name="camera" size={16} color="white" />
                            </View>
                        </TouchableOpacity>
                        
                        <Text style={styles.userName}>{name || 'Your Name'}</Text>
                        <Text style={styles.userEmail}>{email || 'your.email@example.com'}</Text>
                        
                        <View style={styles.statsContainer}>
                            <StatCard 
                                title="Certifications" 
                                value={stats.certifications} 
                                icon="award" 
                            />
                            <StatCard 
                                title="Completed Roles" 
                                value={stats.completedJobs} 
                                icon="check-circle" 
                            />
                            <StatCard 
                                title="Roles Matched" 
                                value={stats.matchingJobs} 
                                icon="target" 
                            />
                        </View>
                    </View>
                </LinearGradient>

                {/* Content Section */}
                <View style={styles.contentContainer}>
                    {/* Job Matches Section */}
                    <View style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Career Matches</Text>
                        </View>
                        
                        {renderJobRoles()}
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.actionsGrid}>
                            <ActionButton
                                title="Personal Info"
                                icon="user"
                                onPress={() => navigation.navigate('PersonalInfo')}
                                gradient={true}
                            />
                            <ActionButton
                                title="Resume"
                                icon="file-text"
                                onPress={() => navigation.navigate('Resume')}
                            />
                            <ActionButton
                                title="Add Skills"
                                icon="award"
                                onPress={() => navigation.navigate('Skills')}
                            />
                        </View>
                    </View>

                    {/* Recent Activity */}
                    <View style={styles.sectionCard}>
                        <Text style={styles.sectionTitle}>Recent Activity</Text>
                        <View style={styles.activityItem}>
                            <View style={styles.activityIcon}>
                                <Feather name="award" size={16} color={THEME.SUCCESS} />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle}>Application Submitted</Text>
                                <Text style={styles.activitySubtitle}>Software Engineer at TechCorp</Text>
                            </View>
                            <Text style={styles.activityTime}>2h ago</Text>
                        </View>
                        
                        <View style={styles.activityItem}>
                            <View style={styles.activityIcon}>
                                <Feather name="eye" size={16} color={THEME.PRIMARY} />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle}>Profile Viewed</Text>
                                <Text style={styles.activitySubtitle}>By 3 recruiters today</Text>
                            </View>
                            <Text style={styles.activityTime}>5h ago</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.BACKGROUND,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    headerContainer: {
        paddingTop: 30,
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    refreshIconButton: {
        padding: 8,
        marginRight: 12,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.2)',
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    profileSection: {
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: 'white',
    },
    cameraIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: THEME.ACCENT,
        borderRadius: 18,
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 4,
        textAlign: 'center',
    },
    userEmail: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
        marginBottom: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    statCard: {
        alignItems: 'center',
        flex: 1,
    },
    statIconContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 8,
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    statLabel: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'center',
    },
    contentContainer: {
        padding: 20,
        paddingTop: 30,
    },
    sectionCard: {
        backgroundColor: THEME.CARD_BG,
        borderRadius: 16,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: THEME.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME.TEXT_PRIMARY,
    },
    seeAllText: {
        fontSize: 14,
        color: THEME.PRIMARY,
        fontWeight: '600',
    },
    horizontalScroll: {
        marginHorizontal: -10,
    },
    progressCard: {
        alignItems: 'center',
        marginHorizontal: 10,
        minWidth: 90,
    },
    progressContainer: {
        marginBottom: 10,
    },
    circleOuter: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 6,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    circleProgress: {
        position: 'absolute',
        transform: [{ rotate: '-90deg' }],
    },
    percentageContainer: {
        alignItems: 'center',
    },
    percentageText: {
        fontSize: 12,
        fontWeight: 'bold',
        marginTop: 2,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '600',
        color: THEME.TEXT_SECONDARY,
        textAlign: 'center',
        lineHeight: 16,
    },
    actionsGrid: {
        paddingTop: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionButtonContainer: {
        width: '48%',
        marginBottom: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: THEME.BORDER,
    },
    actionButtonText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '600',
        color: THEME.TEXT_PRIMARY,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: THEME.BORDER,
    },
    activityIcon: {
        backgroundColor: `${THEME.SUCCESS}20`,
        borderRadius: 20,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.TEXT_PRIMARY,
        marginBottom: 2,
    },
    activitySubtitle: {
        fontSize: 14,
        color: THEME.TEXT_SECONDARY,
    },
    activityTime: {
        fontSize: 12,
        color: THEME.TEXT_LIGHT,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        fontSize: 16,
        color: THEME.TEXT_SECONDARY,
        fontStyle: 'italic',
    },
    noMatchesContainer: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    noMatchesText: {
        fontSize: 16,
        color: THEME.TEXT_SECONDARY,
        marginBottom: 4,
    },
    noMatchesSubText: {
        fontSize: 14,
        color: THEME.TEXT_LIGHT,
        textAlign: 'center',
        marginBottom: 12,
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: `${THEME.PRIMARY}20`,
    },
    refreshButtonText: {
        marginLeft: 6,
        fontSize: 14,
        color: THEME.PRIMARY,
        fontWeight: '600',
    },
});

export default ProfileScreen;