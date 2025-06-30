import React, { useRef, useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigation } from "@react-navigation/native";
import { View, Text, TextInput, StyleSheet, Dimensions, SafeAreaView, ScrollView, ActivityIndicator, ImageBackground } from 'react-native';
import { Gesture, GestureDetector, FlatList, TouchableOpacity } from 'react-native-gesture-handler';
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
  SlideInDown,
  SlideInRight,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getUserSkillsApi, fetchAllTheSkills } from "../Screens/ApiCalls/SignIn_Api";

// --- Theme & Constants ---
const { width, height } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// --- NEW THEME FROM PROFILE SCREEN ---
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
    WHITE: '#FFFFFF'
};



const CircularProgress = memo(({ size, strokeWidth, progress }) => {
  const radius = (size - strokeWidth) / 2;
  const circum = radius * 2 * Math.PI;
  const progressAnimation = useSharedValue(0);

  useEffect(() => {
    progressAnimation.value = withTiming(progress, { duration: 1200 });
  }, [progress, progressAnimation]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circum * (1 - progressAnimation.value),
  }));

  return (
    <View style={{ width: size, height: size, transform: [{ rotate: '-90deg' }] }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgLinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={THEME.PRIMARY} />
            <Stop offset="100%" stopColor={THEME.ACCENT} />
          </SvgLinearGradient>
        </Defs>
        <Circle 
          stroke={THEME.BORDER} 
          fill="none" 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          strokeWidth={strokeWidth - 1} 
        />
        <AnimatedCircle 
          stroke="blue" 
          fill="none" 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          strokeWidth={strokeWidth} 
          strokeDasharray={`${circum} ${circum}`} 
          animatedProps={animatedProps} 
          strokeLinecap="round" 
        />
      </Svg>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercentage}>{`${Math.round(progress * 100)}%`}</Text>
        <Text style={styles.progressLabel}>MATCH</Text>
      </View>
    </View>
  );
});

const JobRoleCard = memo(({ role, mySkills, isSaved, onToggleSave, onPress, index }) => {
  const matchPercentage = useMemo(() => {
    if (role.requiredSkills.length === 0) return 1;
    const lowerUserSkills = mySkills.map(s => s.toLowerCase());
    const matchedSkills = role.requiredSkills.filter(skill =>
      lowerUserSkills.includes(skill.toLowerCase())
    );
    return matchedSkills.length / role.requiredSkills.length;
  }, [role.requiredSkills, mySkills]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(1, { damping: 15 }) }],
  }));

  return (
    <Animated.View 
      entering={SlideInRight.delay(index * 100).duration(600)}
      style={cardStyle}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={styles.card}>
          <View style={styles.cardGlow} />
          
          <View style={styles.cardHeader}>
            <View style={{ flex: 1, paddingRight: 15 }}>
              <View style={styles.roleTagContainer}>
                <View style={styles.roleTag}>
                  <MaterialCommunityIcons name="briefcase-variant" size={12} color={THEME.PRIMARY} />
                  <Text style={styles.roleTagText}>Role</Text>
                </View>
              </View>
              
              <Text style={styles.cardTitle}>{role.roleName}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>
                {role.description}
              </Text>
              
              <View style={styles.cardFooter}>
                <View style={styles.skillsPreview}>
                  <MaterialCommunityIcons name="code-tags" size={16} color={THEME.TEXT_SECONDARY} />
                  <Text style={styles.skillsPreviewText}>
                    {role.requiredSkills.length} skills required
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <CircularProgress size={80} strokeWidth={6} progress={matchPercentage} />
            </View>
          </View>

          <TouchableOpacity 
            onPress={(e) => { e.stopPropagation(); onToggleSave(); }} 
            style={styles.saveButton}
          >
             <LinearGradient
                colors={isSaved ? THEME.GRADIENT : ['transparent', 'transparent']}
                style={styles.saveButtonGradient}
            >
                <MaterialCommunityIcons 
                    name={isSaved ? "bookmark" : "bookmark-outline"} 
                    size={22} 
                    color={isSaved ? THEME.WHITE : THEME.TEXT_SECONDARY} 
                />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

const SearchBar = ({ searchText, setSearchText }) => (
  <View style={styles.searchBarContainer}>
    <View style={styles.searchBarWrapper}>
      <MaterialCommunityIcons name="magnify" size={24} color={THEME.TEXT_SECONDARY} />
      <TextInput 
        style={styles.searchInput} 
        placeholder="Search your dream job..." 
        placeholderTextColor={THEME.TEXT_LIGHT}
        value={searchText} 
        onChangeText={setSearchText} 
      />
      <TouchableOpacity style={styles.voiceButton}>
        <MaterialCommunityIcons name="microphone" size={22} color={THEME.PRIMARY} />
      </TouchableOpacity>
    </View>
  </View>
);

const SkillBubble = ({ skill, index, scrollY, itemHeight, padding }) => {
  const y = padding + index * itemHeight;
  const x = index % 2 === 0 ? width * 0.25 : width * 0.75;

  const animatedBubbleStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [(index - 1) * itemHeight, index * itemHeight, (index + 1) * itemHeight],
      [0.7, 1.3, 0.7],
      Extrapolate.CLAMP
    );
    
    const opacity = interpolate(
      scrollY.value,
      [(index - 1) * itemHeight, index * itemHeight, (index + 1) * itemHeight],
      [0.5, 1, 0.5],
      Extrapolate.CLAMP
    );

    return { 
      transform: [{ scale }],
      opacity
    };
  });

  return (
    <Animated.View
      key={index}
      style={[
        styles.bubble, 
        { position: 'absolute', top: y - 65, left: x - 70 }, 
        animatedBubbleStyle
      ]}
    >
      <LinearGradient 
        colors={index % 2 === 0 ? THEME.GRADIENT : [THEME.ACCENT, THEME.WARNING]} 
        style={styles.bubbleGradient}
      >
        <View style={styles.bubbleInner}>
          {/* <MaterialCommunityIcons 
            name="star" 
            size={16} 
            color={THEME.WHITE} 
            style={{ opacity: 0.8 }}
          /> */}
          <Text style={styles.skillText}>{skill}</Text>
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const SkillPath = ({ skillsPathData = [] }) => {
  const scrollRef = useAnimatedRef();
  const scrollY = useScrollViewOffset(scrollRef);
  const itemHeight = 250;
  const padding = 200;

  const contentHeight = skillsPathData.length * itemHeight + padding * 2;

  const zigzagPath = useMemo(() => {
    let path = `M ${width / 2} ${padding} `;
    skillsPathData.forEach((_, i) => { 
      path += `L ${i % 2 === 0 ? width * 0.25 : width * 0.75} ${padding + i * itemHeight} `; 
    });
    return path;
  }, [skillsPathData]);

  return (
    <View style={styles.skillPathContainer}>
      <LinearGradient
        colors={[THEME.BACKGROUND, '#f0f2f5']}
        style={{ flex: 1 }}
      >
        <Animated.ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ height: contentHeight }}
        >
          <Svg height={contentHeight} width={width} style={{ position: 'absolute' }}>
            <Defs>
              <SvgLinearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={THEME.PRIMARY} />
                <Stop offset="50%" stopColor={THEME.GRADIENT[1]} />
                <Stop offset="100%" stopColor={THEME.ACCENT} />
              </SvgLinearGradient>
            </Defs>
            <Path 
              d={zigzagPath} 
              stroke="url(#pathGradient)" 
              strokeWidth={8} 
              fill="none" 
              opacity={0.5}
            />
            <Path 
              d={zigzagPath} 
              stroke={THEME.TEXT_LIGHT} 
              strokeWidth={4} 
              fill="none" 
              strokeDasharray="15 25" 
              opacity={0.6}
            />
          </Svg>

          {skillsPathData.map((skill, index) => (
            <SkillBubble
              key={`skill-${index}`}
              skill={skill}
              index={index}
              scrollY={scrollY}
              itemHeight={itemHeight}
              padding={padding}
            />
          ))}
        </Animated.ScrollView>
      </LinearGradient>
    </View>
  );
};

export default function UltimateJobMatcherScreen({ skillsPathData, jobRolesData, isLoading }) {
  const navigation = useNavigation();
  const [savedRoleIds, setSavedRoleIds] = useState(new Set());
  const [searchText, setSearchText] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const mySkills = useMemo(() => {
    return skillsPathData.map(skill => skill.toLowerCase());
  }, [skillsPathData]);

  const TOP_SNAP = height * 0.15;
  const BOTTOM_SNAP = height * 0.65;
  const translateY = useSharedValue(BOTTOM_SNAP);
  const context = useSharedValue({ y: 0 });

  const panGesture = Gesture.Pan()
    .onStart(() => { context.value = { y: translateY.value }; })
    .onUpdate((event) => {
      if (event.translationY < 0) {
        translateY.value = Math.max(TOP_SNAP, context.value.y + event.translationY);
        return;
      }
      translateY.value = Math.max(TOP_SNAP, context.value.y + event.translationY);
    })
    .onEnd(() => {
      if (translateY.value > height * 0.4) {
        translateY.value = withSpring(BOTTOM_SNAP, { damping: 20 });
      } else {
        translateY.value = withSpring(TOP_SNAP, { damping: 20 });
      }
    });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [BOTTOM_SNAP, height * 0.4], [1, 0], Extrapolate.CLAMP),
    transform: [{ 
      translateY: interpolate(translateY.value, [BOTTOM_SNAP, height * 0.4], [0, -20], Extrapolate.CLAMP) 
    }]
  }));

  const toggleSave = useCallback(roleId => {
    setSavedRoleIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(roleId)) newIds.delete(roleId);
      else newIds.add(roleId);
      return newIds;
    });
  }, []);

  // const processedRoles = useMemo(() => {
  //   const lowerUserSkills = mySkills.map(s => s.toLowerCase());

  //   let roles = jobRolesData
  //     ? jobRolesData.filter(role =>
  //         role.roleName.toLowerCase().includes(searchText.toLowerCase())
  //       )
  //     : [];

  //   if (activeFilter === 'Saved') {
  //     roles = roles.filter(role => savedRoleIds.has(role.id));
  //   }

  //   roles.sort((a, b) => {
  //     const matchA = a.requiredSkills.filter(s =>
  //       lowerUserSkills.includes(s.toLowerCase())
  //     ).length / a.requiredSkills.length;

  //     const matchB = b.requiredSkills.filter(s =>
  //       lowerUserSkills.includes(s.toLowerCase())
  //     ).length / b.requiredSkills.length;

  //     return matchB - matchA;
  //   });

  //   return roles;
  // }, [jobRolesData, searchText, activeFilter, savedRoleIds, mySkills]);


  const processedRoles = useMemo(() => {
    if (!jobRolesData) return [];
  
    const lowerUserSkills = mySkills.map(s => s.toLowerCase());
  
    // 👉 base filters (search + “Saved”)
    let roles = jobRolesData.filter(role =>
      role.roleName.toLowerCase().includes(searchText.toLowerCase())
    );
    if (activeFilter === 'Saved') {
      roles = roles.filter(role => savedRoleIds.has(role.id));
    }
  
    // 👉 add a score, keep only roles with ≥1 match
    const scored = roles
      .map(role => {
        const matchCount = role.requiredSkills.filter(req =>
          lowerUserSkills.includes(req.toLowerCase())
        ).length;
  
        return {
          ...role,
          _score: matchCount / role.requiredSkills.length,
        };
      })
      .filter(r => r._score > 0);        // drop roles with zero overlap
  
    // 👉 highest‐score first
    scored.sort((a, b) => b._score - a._score);
  
    return scored;
  }, [jobRolesData, searchText, activeFilter, savedRoleIds, mySkills]); 

  return (
    <View style={styles.screenContainer}>
      <SkillPath skillsPathData={skillsPathData} />

      <Animated.View style={[styles.headerOverlay, animatedHeaderStyle]}>
        <SafeAreaView>
          
          <SearchBar searchText={searchText} setSearchText={setSearchText} />
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.pillsContainer}
          >
            {/* {categoryPillsData.map(pill => (
              <TouchableOpacity 
                key={pill.label} 
                style={[styles.pillButton, activeFilter === pill.filter && styles.activePillButton]} 
                onPress={() => setActiveFilter(pill.filter)}
              >
                <LinearGradient
                  colors={activeFilter === pill.filter ? THEME.GRADIENT : ['transparent', 'transparent']}
                  style={styles.pillGradient}
                >
                  <MaterialCommunityIcons 
                    name={pill.icon} 
                    size={18} 
                    color={activeFilter === pill.filter ? THEME.WHITE : THEME.TEXT_SECONDARY} 
                    style={{ marginRight: 6 }} 
                  />
                  <Text style={[styles.pillText, activeFilter === pill.filter && styles.activePillText]}>
                    {pill.label}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ))} */}
          </ScrollView>
        </SafeAreaView>
      </Animated.View>

      <Animated.View style={[styles.bottomSheet, animatedSheetStyle]}>
        <View style={styles.sheetContent}>
          <GestureDetector gesture={panGesture}>
            <View style={styles.handle}>
              <View style={styles.handleBar} />
              <View style={styles.sheetHeader}>
                <View style={styles.sheetTitleContainer}>
                  <MaterialCommunityIcons name="rocket-launch" size={24} color={THEME.PRIMARY} />
                  <Text style={styles.bottomSheetTitle}>Career Roadmap</Text>
                </View>
                <Text style={styles.listHeader}>
                  {processedRoles.length} Recommended Roles
                </Text>
              </View>
            </View>
          </GestureDetector>

          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={THEME.PRIMARY} />
              <Text style={styles.loadingText}>Discovering perfect matches...</Text>
            </View>
          ) : (
            <FlatList
              data={processedRoles}
              keyExtractor={(item, index) => `role-${item.id}-${index}`}
              renderItem={({ item, index }) => (
                <JobRoleCard
                  role={item}
                  mySkills={mySkills}
                  onToggleSave={() => toggleSave(item.id)}
                  isSaved={savedRoleIds.has(item.id)}
                  onPress={() => navigation.navigate('JobMatchView', { item, mySkills })}
                  index={index}
                />
              )}
              contentContainerStyle={{ 
                paddingBottom: 100, 
                paddingTop: 20, 
                paddingHorizontal: 20 
              }}
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { 
    flex: 1, 
    backgroundColor: THEME.BACKGROUND 
  },
  skillPathContainer: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchBarContainer: { 
    marginHorizontal: 20, 
    marginVertical: 15,
    shadowColor: THEME.SHADOW,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.CARD_BG,
    borderRadius: 25,
    paddingHorizontal: 18,
    height: 54,
    borderWidth: 1,
    borderColor: THEME.BORDER,
  },
  searchInput: { 
    flex: 1, 
    fontSize: 16, 
    color: THEME.TEXT_PRIMARY, 
    marginHorizontal: 12,
    fontWeight: '400',
  },
  voiceButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillsContainer: { 
    paddingHorizontal: 20, 
    paddingBottom: 15,
  },
  pillButton: { 
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  pillGradient: {
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 10, 
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: THEME.BORDER,
    borderRadius: 20,
  },
  activePillButton: {
    borderColor: 'transparent',
  },
  pillText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: THEME.TEXT_SECONDARY 
  },
  activePillText: { 
    color: THEME.WHITE,
    fontWeight: '600',
  },
  bottomSheet: { 
    position: 'absolute', 
    width: '100%', 
    height: '100%',
    zIndex: 5,
  },
  sheetContent: {
    flex: 1,
    backgroundColor: THEME.CARD_BG,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 20,
  },
  handle: { 
    paddingTop: 12,
  },
  handleBar: { 
    width: 40, 
    height: 4, 
    backgroundColor: THEME.BORDER, 
    borderRadius: 2, 
    alignSelf: 'center', 
    marginBottom: 20 
  },
  sheetHeader: {
    paddingHorizontal: 20,
  },
  sheetTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bottomSheetTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: THEME.TEXT_PRIMARY,
    marginLeft: 10,
  },
  listHeader: { 
    fontSize: 16, 
    fontWeight: '500', 
    color: THEME.TEXT_SECONDARY,
    marginBottom: 5,
  },
  card: { 
    backgroundColor: THEME.CARD_BG,
    borderRadius: 20, 
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: THEME.BORDER,
    shadowColor: THEME.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardGlow: {
    position: 'absolute',
    top: -1,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: THEME.PRIMARY,
    opacity: 0.8,
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    padding: 20,
  },
  roleTagContainer: {
    marginBottom: 8,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eef2ff', // Light primary background
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.PRIMARY,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: THEME.TEXT_PRIMARY,
    marginBottom: 6,
  },
  cardDescription: { 
    fontSize: 14, 
    color: THEME.TEXT_SECONDARY, 
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skillsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skillsPreviewText: {
    fontSize: 12,
    color: THEME.TEXT_SECONDARY,
    marginLeft: 6,
    fontWeight: '500',
  },
  progressContainer: {
    marginLeft: 10,
  },
  progressTextContainer: { 
    position: 'absolute', 
    justifyContent: 'center', 
    alignItems: 'center', 
    width: '100%', 
    height: '100%', 
    transform: [{ rotate: '90deg' }] 
  },
  progressPercentage: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: THEME.TEXT_PRIMARY 
  },
  progressLabel: { 
    fontSize: 9, 
    color: "blue",
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  saveButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 38,
    height: 38,
    borderRadius: 19,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.BORDER,
    borderRadius: 19,
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  loadingText: { 
    marginTop: 20, 
    color: THEME.TEXT_SECONDARY,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  bubble: { 
    height: 120, 
    width: 120, 
    borderRadius: 60,
    shadowColor: THEME.PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bubbleGradient: { 
    height: '100%', 
    width: '100%', 
    borderRadius: 60, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  bubbleInner: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  skillText: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: THEME.WHITE, 
    textAlign: 'center',
    marginTop: 4,
    letterSpacing: 0.3,
  },
});