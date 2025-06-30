import React, { useRef, useState, useEffect, useCallback, memo, useMemo } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, SafeAreaView, Alert, ActivityIndicator, ImageBackground } from 'react-native';
import { Gesture, GestureDetector, FlatList, ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withTiming,
    withSpring,
    useAnimatedRef,
    useScrollViewOffset,
    interpolate,
    Extrapolate,
    FadeIn,
    FadeOut,
    SlideInUp,SlideInDown,
    SlideInRight,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute, useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const THEME = {
    PRIMARY: '#6366F1',
    PRIMARY_DARK: '#4F46E5',
    PRIMARY_LIGHT: '#A5B4FC',
    PRIMARY_GRADIENT: ['#6366F1', '#8B5CF6'],
    SECONDARY: '#EC4899',
    BACKGROUND: '#F8FAFC',
    CARD_BG: '#FFFFFF',
    TEXT_PRIMARY: '#0F172A',
    TEXT_SECONDARY: '#475569',
    TEXT_MUTED: '#64748B',
    BORDER: '#E2E8F0',
    SUCCESS: '#10B981',
    SUCCESS_LIGHT: '#ECFDF5',
    SUCCESS_BORDER: '#6EE7B7',
    WARNING: '#F59E0B',
    WARNING_LIGHT: '#FEF3C7',
    WARNING_BORDER: '#FCD34D',
    SHADOW: 'rgba(0, 0, 0, 0.1)',
};

const JobDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const scrollY = useSharedValue(0);

    // Destructure params from the route
    const { item, mySkills } = route.params;
    console.log(item);

    const matchedSkills = useMemo(() => {
        const lowerUserSkills = mySkills.map(s => s.toLowerCase());
        return item.requiredSkills.filter(skill =>
            lowerUserSkills.includes(skill.toLowerCase())
        );
    }, [item.requiredSkills, mySkills]);

    const missingSkills = useMemo(() => {
        const lowerUserSkills = mySkills.map(s => s.toLowerCase());
        return item.requiredSkills.filter(skill =>
            !lowerUserSkills.includes(skill.toLowerCase())
        );
    }, [item.requiredSkills, mySkills]);

    const matchPercentage = useMemo(() => {
        const total = item.requiredSkills.length;
        const matched = matchedSkills.length;
        return total > 0 ? Math.round((matched / total) * 100) : 0;
    }, [matchedSkills, item.requiredSkills]);

    const SkillPill = ({ skill, isMatched, index }) => (
        <Animated.View 
            entering={SlideInRight.delay(index * 100).duration(600)} 
            style={[styles.skillPill, isMatched ? styles.matchedSkillPill : styles.missingSkillPill]}
        >
            <View style={[styles.skillIcon, isMatched ? styles.matchedIcon : styles.missingIcon]}>
                <MaterialCommunityIcons 
                    name={isMatched ? 'check' : 'plus'} 
                    size={14} 
                    color={isMatched ? THEME.SUCCESS : THEME.WARNING} 
                />
            </View>
            <Text style={[styles.skillPillText, isMatched ? styles.matchedText : styles.missingText]}>
                {skill}
            </Text>
        </Animated.View>
    );

    const CompanyCard = ({ company, index }) => (
        <Animated.View 
            entering={SlideInRight.delay(index * 150).duration(700)} 
            style={styles.companyCard}
        >
            <View style={styles.companyLogo}>
                <MaterialCommunityIcons name="domain" size={24} color={THEME.SECONDARY} />
            </View>
            <View style={styles.companyInfo}>
                <Text style={styles.companyName}>{company}</Text>
                <Text style={styles.companySubtext}>Actively hiring</Text>
            </View>
            {/* <TouchableOpacity style={styles.viewButton}>
                <MaterialCommunityIcons name="arrow-right" size={20} color={THEME.SECONDARY} />
            </TouchableOpacity> */}
        </Animated.View>
    );

    const HeaderGradient = () => (
        <LinearGradient
            colors={THEME.PRIMARY_GRADIENT}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
        >
            <SafeAreaView>
                <View style={styles.headerContent}>
                    <TouchableOpacity 
                        onPress={() => navigation.goBack()} 
                        style={styles.backButton}
                    >
                        <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle} numberOfLines={2}>
                            {item.roleName}
                        </Text>
                        {/*   */}
                    </View>
                    {/* <TouchableOpacity style={styles.favoriteButton}>
                        <MaterialCommunityIcons name="heart-outline" size={24} color="white" />
                    </TouchableOpacity> */}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );

    const MatchScore = () => (
        <Animated.View entering={FadeIn.delay(300).duration(800)} style={styles.matchScoreCard}>
            <LinearGradient
                colors={['#FFFFFF', '#F8FAFC']}
                style={styles.matchScoreGradient}
            >
                <View style={styles.matchScoreContent}>
                    <View style={styles.scoreCircle}>
                        <Text style={styles.scorePercentage}>{matchPercentage}%</Text>
                        <Text style={styles.scoreLabel}>Match</Text>
                    </View>
                    <View style={styles.scoreDetails}>
                        <View style={styles.scoreItem}>
                            <MaterialCommunityIcons name="check-circle" size={20} color={THEME.SUCCESS} />
                            <Text style={styles.scoreItemText}>
                                {matchedSkills.length} skills you have
                            </Text>
                        </View>
                        <View style={styles.scoreItem}>
                            <MaterialCommunityIcons name="school" size={20} color={THEME.WARNING} />
                            <Text style={styles.scoreItemText}>
                                {missingSkills.length} skills to learn
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            <HeaderGradient />
            
            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <MatchScore />

                <Animated.View entering={SlideInDown.delay(400).duration(800)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="file-document-outline" size={24} color={THEME.PRIMARY} />
                        <Text style={styles.sectionTitle}>Job Description</Text>
                    </View>
                    <View style={styles.descriptionCard}>
                        <Text style={styles.descriptionText}>{item.description}</Text>
                    </View>
                </Animated.View>

                <Animated.View entering={SlideInDown.delay(600).duration(800)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="lightning-bolt" size={24} color={THEME.SUCCESS} />
                        <Text style={styles.sectionTitle}>Skills You Have</Text>
                        <View style={styles.skillCountBadge}>
                            <Text style={styles.skillCountText}>{matchedSkills.length}</Text>
                        </View>
                    </View>
                    <View style={styles.skillsContainer}>
                        {matchedSkills.length > 0 ? (
                            matchedSkills.map((skill, index) => (
                                <SkillPill 
                                    key={`matched-${skill}`} 
                                    skill={skill} 
                                    isMatched={true} 
                                    index={index} 
                                />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="magnify" size={48} color={THEME.TEXT_MUTED} />
                                <Text style={styles.emptyStateText}>
                                    No matching skills found in your profile
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>

                {missingSkills.length > 0 && (
                    <Animated.View entering={SlideInDown.delay(800).duration(800)} style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <MaterialCommunityIcons name="school" size={24} color={THEME.WARNING} />
                            <Text style={styles.sectionTitle}>Skills to Learn</Text>
                            <View style={[styles.skillCountBadge, styles.warningBadge]}>
                                <Text style={styles.skillCountText}>{missingSkills.length}</Text>
                            </View>
                        </View>
                        <View style={styles.skillsContainer}>
                            {missingSkills.map((skill, index) => (
                                <SkillPill 
                                    key={`missing-${skill}`} 
                                    skill={skill} 
                                    isMatched={false} 
                                    index={index} 
                                />
                            ))}
                        </View>
                    </Animated.View>
                )}

                <Animated.View entering={SlideInDown.delay(1000).duration(800)} style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <MaterialCommunityIcons name="domain" size={24} color={THEME.SECONDARY} />
                        <Text style={styles.sectionTitle}>Companies Hiring</Text>
                        <View style={[styles.skillCountBadge, styles.secondaryBadge]}>
                            <Text style={styles.skillCountText}>{item.companyNames?.length || 0}</Text>
                        </View>
                    </View>
                    <View style={styles.companiesContainer}>
                        {item.companyNames && item.companyNames.length > 0 ? (
                            item.companyNames.map((company, index) => (
                                <CompanyCard 
                                    key={`company-${company}-${index}`} 
                                    company={company} 
                                    index={index} 
                                />
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <MaterialCommunityIcons name="domain" size={48} color={THEME.TEXT_MUTED} />
                                <Text style={styles.emptyStateText}>
                                    No companies currently hiring for this role
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: THEME.BACKGROUND
    },
    headerGradient: {
        paddingTop: 0,
        paddingBottom: 20,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: THEME.SHADOW,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        zIndex: 10
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        zIndex:10
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        flex: 1,
        marginHorizontal: 16,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: 'white',
        lineHeight: 28,
    },
    headerSubtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 4,
        fontWeight: '500',
    },
    favoriteButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
        marginTop: -12,
    },
    scrollContent: {
        paddingBottom: 100,
    },
    matchScoreCard: {
        marginHorizontal: 20,
        marginTop: 20,
        borderRadius: 20,
        shadowColor: THEME.SHADOW,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 8,
        overflow: 'hidden',
    },
    matchScoreGradient: {
        padding: 24,
    },
    matchScoreContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    scoreCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: THEME.PRIMARY,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 20,
    },
    scorePercentage: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    scoreLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    scoreDetails: {
        flex: 1,
    },
    scoreItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    scoreItemText: {
        fontSize: 16,
        color: THEME.TEXT_SECONDARY,
        marginLeft: 12,
        fontWeight: '500',
    },
    section: {
        marginHorizontal: 20,
        marginTop: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: THEME.TEXT_PRIMARY,
        marginLeft: 12,
        flex: 1,
    },
    skillCountBadge: {
        backgroundColor: THEME.SUCCESS,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
        minWidth: 24,
        alignItems: 'center',
    },
    warningBadge: {
        backgroundColor: THEME.WARNING,
    },
    secondaryBadge: {
        backgroundColor: THEME.SECONDARY,
    },
    skillCountText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: 'white',
    },
    descriptionCard: {
        backgroundColor: THEME.CARD_BG,
        borderRadius: 16,
        padding: 20,
        shadowColor: THEME.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    descriptionText: {
        fontSize: 16,
        lineHeight: 24,
        color: THEME.TEXT_SECONDARY,
    },
    skillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    skillPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: THEME.CARD_BG,
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        margin: 6,
        shadowColor: THEME.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    matchedSkillPill: {
        backgroundColor: THEME.SUCCESS_LIGHT,
        borderWidth: 1,
        borderColor: THEME.SUCCESS_BORDER,
    },
    missingSkillPill: {
        backgroundColor: THEME.WARNING_LIGHT,
        borderWidth: 1,
        borderColor: THEME.WARNING_BORDER,
    },
    skillIcon: {
        width: 20,
        height: 20,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    matchedIcon: {
        backgroundColor: THEME.SUCCESS,
    },
    missingIcon: {
        backgroundColor: THEME.WARNING,
    },
    skillPillText: {
        fontSize: 14,
        fontWeight: '600',
    },
    matchedText: {
        color: THEME.SUCCESS,
    },
    missingText: {
        color: THEME.WARNING,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        width: '100%',
    },
    emptyStateText: {
        fontSize: 16,
        color: THEME.TEXT_MUTED,
        textAlign: 'center',
        marginTop: 12,
        fontStyle: 'italic',
    },
    // Company Card Styles
    companiesContainer: {
        gap: 12,
    },
    companyCard: {
        backgroundColor: THEME.CARD_BG,
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: THEME.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: THEME.BORDER,
    },
    companyLogo: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${THEME.SECONDARY}20`,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    companyInfo: {
        flex: 1,
    },
    companyName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: THEME.TEXT_PRIMARY,
        marginBottom: 4,
    },
    companySubtext: {
        fontSize: 14,
        color: THEME.TEXT_MUTED,
        fontWeight: '500',
    },
    viewButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: `${THEME.SECONDARY}15`,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionSection: {
        marginHorizontal: 20,
        marginTop: 32,
        gap: 12,
    },
    primaryButton: {
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: THEME.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 8,
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: THEME.CARD_BG,
        borderRadius: 16,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderWidth: 2,
        borderColor: THEME.PRIMARY,
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: THEME.PRIMARY,
        marginLeft: 8,
    },
});

export default JobDetailScreen;