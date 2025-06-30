// import React, { useRef } from 'react';
// import {Animated,ScrollView,View,Text,Dimensions,StyleSheet,ImageBackground,} from 'react-native';
// import Svg, { Path } from 'react-native-svg';

// const { width } = Dimensions.get('window');
// const skills = ['C++', 'Python', 'JavaScript JavaScript', 'Hyper text markup language', 'CSS', 'Java', 'React', 'Node', 'SQL','node.js','❌','X'];
// // const skills = ['Python','❌','X'];
// // const skills = ['Python'];

// const SkillPath = () => {
//   const scrollY = useRef(new Animated.Value(0)).current;
//   const itemHeight = 165;
//   const padding = 100;

//   const zigzagPath = () => {
//     const pathStartY = padding;
//     let path = `M ${width / 2} ${pathStartY} `;
//     for (let i = 0; i < skills.length; i++) {
//       const y = pathStartY + i * itemHeight;
//       const x = i % 2 === 0 ? width * 0.3 : width * 0.7;
//       path += `L ${x} ${y} `;
//     }
//     return path;
//   };

//   return (
//     <View style={{ flex: 1, backgroundColor: 'rgba(250, 190, 255, 0.74)' }}>
//       <Animated.ScrollView
//         contentContainerStyle={{ height: skills.length * itemHeight + padding * 2 }}
//         showsVerticalScrollIndicator={false}
//         onScroll={Animated.event(
//           [{ nativeEvent: { contentOffset: { y: scrollY } } }],
//           { useNativeDriver: true }
//         )}
//         scrollEventThrottle={16}
//       >
//         {/* Path that scrolls with content */}
//         <Svg
//           height={skills.length * itemHeight + padding * 2}
//           width={width}
//           style={{ position: 'absolute' }}
//         >
//           <Path  d={zigzagPath()}  stroke="white"  strokeWidth={15}  fill="none" />
//           <Path  d={zigzagPath()}  stroke="rgb(184, 3, 239)"  strokeWidth={15}  fill="none"  strokeDasharray="20 10"/>
//         </Svg>

//         {/* Bubbles aligned with path */}
//         {skills.map((skill, index) => {
//           const y = padding + index * itemHeight;
//           const x = index % 2 === 0 ? width * 0.3 : width * 0.7;

//           const inputRange = [
//             (index - 1) * itemHeight,
//             index * itemHeight,
//             (index + 1) * itemHeight,
//           ];

//           const scale = scrollY.interpolate({
//             inputRange,
//             outputRange: [0.8, 1.2, 0.8],
//             extrapolate: 'clamp',
//           });

//           return (
//             <Animated.View
//               key={index}
//               style={[
//                 styles.bubble,
//                 {
//                   position: 'absolute',
//                   top: y - 50, // center vertically (100/2)
//                   left: x - 50, // center horizontally (100/2)
//                   transform: [{ scale }],
//                 },
//               ]}
//             >
//               <ImageBackground  source={require('../assets/bubble2.png')}  style={styles.backgroundImage}  resizeMode="cover">
//                 <Text style={styles.skillText}>{skill}</Text>
//               </ImageBackground>
//             </Animated.View>
//           );
//         })}
//       </Animated.ScrollView>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   bubble: {
//     height: 90,
//     width: 110,
//     borderRadius: 50,
//     // backgroundColor: 'red',
//     backgroundColor: 'rgba(238, 0, 255, 0.42)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: 'red',
//     shadowOffset: { width: 0, height: 3 },
//     shadowOpacity: 1,
//     shadowRadius: 1,
//     elevation: 20,
//   },
//   skillText: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#f0f0f0',
//   },
//   backgroundImage: {
//     flex: 1,
//     height: 90,
//     width: 110,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding:5
//   },
// });

// export default SkillPath;




// components/SkillPath.js
// import React, { useEffect, useMemo, useState } from 'react';
// import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
// import Animated, {
//   useAnimatedRef,
//   useScrollViewOffset,
//   useAnimatedStyle,
//   interpolate,
//   Extrapolate,
// } from 'react-native-reanimated';
// import Svg, { Path } from 'react-native-svg';
// import { LinearGradient } from 'expo-linear-gradient';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// // import { ScrollView } from 'react-native-gesture-handler';
// import { getUserSkillsApi } from '../Screens/ApiCalls/SignIn_Api';
// // import styles from '../styles/jobMatcherStyles';

import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedRef,
  useScrollViewOffset,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserSkillsApi } from '../Screens/ApiCalls/SignIn_Api';

const { width, height } = require('react-native').Dimensions.get('window');
const THEME = {
  PRIMARY: '#E91E63',
  PRIMARY_DARK: '#C2185B',
  PRIMARY_LIGHT: '#F8BBD0',
  PRIMARY_TINT: 'rgba(233, 30, 99, 0.1)',
  TEXT_MUTED: '#64748B',
};

const SkillPath = () => {
  const scrollRef = useAnimatedRef();
  const scrollY = useScrollViewOffset(scrollRef);
  const itemHeight = 225;
  const padding = 200;

  const [skillsPathData, setSkillsPathData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userSkills = async () => {
      try {
        const userDetails = await AsyncStorage.getItem('userDetails');
        const user = JSON.parse(userDetails);
        const userSkills = await getUserSkillsApi(user.Email);
        setSkillsPathData(userSkills);
      } catch (error) {
        console.error('Failed to fetch user skills:', error);
      } finally {
        setIsLoading(false);
      }
    };
    userSkills();
  }, []);

  const contentHeight = useMemo(() => (
    skillsPathData.length * itemHeight + padding * 2
  ), [skillsPathData]);

  const zigzagPath = useMemo(() => {
    let path = `M ${width / 2} ${padding} `;
    skillsPathData.forEach((_, i) => {
      path += `L ${i % 2 === 0 ? width * 0.3 : width * 0.7} ${padding + i * itemHeight} `;
    });
    return path;
  }, [skillsPathData]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.PRIMARY_TINT }}>
        <ActivityIndicator size="large" color={THEME.PRIMARY} />
        <Text style={{ color: THEME.TEXT_MUTED, marginTop: 10 }}>Loading skills...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: THEME.PRIMARY_TINT }}>
      <Animated.ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ height: contentHeight }}
      >
        <Svg height={contentHeight} width={width} style={{ position: 'absolute' }}>
          <Path d={zigzagPath} stroke={THEME.PRIMARY_LIGHT} strokeWidth={15} fill="none" />
          <Path d={zigzagPath} stroke={THEME.PRIMARY} strokeWidth={15} fill="none" strokeDasharray="20 10" />
        </Svg>

        {skillsPathData.map((skill, index) => {
          const y = padding + index * itemHeight;
          const x = index % 2 === 0 ? width * 0.3 : width * 0.7;

          const animatedBubbleStyle = useAnimatedStyle(() => {
            const scale = interpolate(
              scrollY.value,
              [(index - 1) * itemHeight, index * itemHeight, (index + 1) * itemHeight],
              [0.8, 1.2, 0.8],
              Extrapolate.CLAMP
            );
            return { transform: [{ scale }] };
          });

          return (
            <Animated.View
              key={index}
              style={[styles.bubble, { position: 'absolute', top: y - 55, left: x - 60 }, animatedBubbleStyle]}
            >
              <LinearGradient
                colors={[`${THEME.PRIMARY}e0`, THEME.PRIMARY_DARK]}
                style={styles.bubbleGradient}
              >
                <Text style={styles.skillText}>{skill}</Text>
              </LinearGradient>
            </Animated.View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: THEME.BACKGROUND },
  // CORRECTED: Header is now an overlay
  headerOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      backgroundColor: THEME.BACKGROUND, // Give it a background to hide the path behind it
  },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.WHITE, borderRadius: 28, marginHorizontal: 16, marginTop: 16, paddingHorizontal: 16, height: 56, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 5 },
  searchInput: { flex: 1, fontSize: 16, color: THEME.TEXT_PRIMARY, marginHorizontal: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: THEME.PRIMARY_LIGHT, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: THEME.PRIMARY_DARK, fontWeight: 'bold' },
  pillsContainer: { paddingHorizontal: 16, paddingVertical: 10 },
  pillButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: THEME.WHITE, borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, marginRight: 8, borderWidth: 1.5, borderColor: THEME.PRIMARY_LIGHT },
  activePillButton: { backgroundColor: THEME.PRIMARY, borderColor: THEME.PRIMARY_DARK },
  pillText: { fontSize: 14, fontWeight: '500', color: THEME.PRIMARY },
  activePillText: { color: THEME.WHITE },
  fabContainer: { position: 'absolute', bottom: height * 0.30 - 60, right: 16, zIndex: 20 },
  fabLocation: { width: 56, height: 56, borderRadius: 28, backgroundColor: THEME.WHITE, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
  // Bottom Sheet
  bottomSheet: { flex: 1, overflow: 'hidden', position: 'absolute', width: '100%', height: '100%', backgroundColor: THEME.WHITE, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10, zIndex: 5 },
  handle: { width: 36, height: 5, backgroundColor: '#DADCE0', borderRadius: 2.5, alignSelf: 'center', marginTop: 8, marginBottom: 12 },
  bottomSheetTitle: { fontSize: 24, fontWeight: 'bold', color: THEME.TEXT_PRIMARY, paddingHorizontal: 4 },
  mySkillsSection: { marginVertical: 20, backgroundColor: THEME.PRIMARY_TINT, borderRadius: 12, padding: 15, borderWidth: 1, borderColor: THEME.PRIMARY_LIGHT },
  sectionHeader: { fontSize: 16, fontWeight: 'bold', color: THEME.PRIMARY_DARK, marginBottom: 10 },
  sectionSubheader: { fontSize: 12, color: THEME.PRIMARY, fontWeight: 'normal' },
  skillsGridContainer: { flexDirection: 'row', flexWrap: 'wrap', margin: -4 },
  noSkillsText: { color: THEME.TEXT_MUTED, fontStyle: 'italic', paddingVertical: 10 },
  candyWrapper: { margin: 4 },
  candy: { paddingVertical: 8, paddingHorizontal: 14, backgroundColor: THEME.PRIMARY, borderRadius: 16 },
  candyText: { color: THEME.WHITE, fontWeight: '600' },
  listHeader: { fontSize: 18, fontWeight: '600', color: '#3c4043', marginBottom: 12, paddingHorizontal: 4 },
  // Job Card
  card: { backgroundColor: THEME.WHITE, borderRadius: 16, marginBottom: 15, overflow: 'hidden', borderWidth: 1, borderColor: THEME.BORDER },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 15, paddingRight: 5, paddingBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: THEME.TEXT_PRIMARY },
  cardDescription: { fontSize: 14, color: THEME.TEXT_SECONDARY, marginTop: 4 },
  progressTextContainer: { position: 'absolute', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', transform: [{ rotate: '90deg' }] },
  progressPercentage: { fontSize: 16, fontWeight: 'bold', color: THEME.TEXT_PRIMARY },
  progressLabel: { fontSize: 10, color: THEME.TEXT_MUTED },
  // Job Detail Screen
  detailContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: THEME.BACKGROUND, zIndex: 100 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: THEME.BORDER, backgroundColor: THEME.WHITE },
  backButton: { padding: 4, },
  detailTitle: { fontSize: 20, fontWeight: 'bold', color: THEME.TEXT_PRIMARY, textAlign: 'center', flex: 1, marginHorizontal: 10 },
  detailScrollView: { padding: 20, paddingBottom: 50 },
  detailSectionTitle: { fontSize: 18, fontWeight: '700', color: '#334155', marginBottom: 12, marginTop: 16 },
  detailDescriptionText: { fontSize: 16, lineHeight: 24, color: THEME.TEXT_SECONDARY },
  skillAnalysisBox: { backgroundColor: THEME.WHITE, borderRadius: 12, padding: 16, marginTop: 8, borderWidth: 1, borderColor: THEME.BORDER },
  skillAnalysisHeader: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 12 },
  skillPillsContainer: { flexDirection: 'row', flexWrap: 'wrap', margin: -4 },
  matchPill: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, margin: 4 },
  matchedPill: { backgroundColor: THEME.SUCCESS_LIGHT, borderWidth: 1, borderColor: '#86EFAC' },
  missingPill: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: THEME.BORDER },
  matchPillText: { fontSize: 14, fontWeight: '500' },
  matchedPillText: { color: THEME.SUCCESS },
  missingPillText: { color: THEME.TEXT_SECONDARY },
  noSkillsMatchText: { color: THEME.TEXT_MUTED, fontStyle: 'italic', padding: 4 },
  // SkillPath (Background)
  bubble: { height: 100, width: 100, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: THEME.PRIMARY_DARK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 10 },
  bubbleGradient: { height: '100%', width: '100%', borderRadius: 60, justifyContent: 'center', alignItems: 'center', padding: 8 },
  skillText: { fontSize: 16, fontWeight: 'bold', color: THEME.WHITE, textAlign: 'center', },
});

export default SkillPath;