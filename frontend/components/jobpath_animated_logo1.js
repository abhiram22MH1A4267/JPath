import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Svg, { Path } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const JobPathAnimatedLogo = () => {
  const [letterVisible, setLetterVisible] = useState(Array(7).fill(false));
  
  // Animation values
  const outerRotation = useRef(new Animated.Value(0)).current;
  const middleRotation = useRef(new Animated.Value(0)).current;
  const innerRotation = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const letterAnimations = useRef(
    Array.from({ length: 7 }, () => new Animated.Value(0))
  ).current;
  const particleAnimations = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Start letter animations
    letterVisible.forEach((_, index) => {
      setTimeout(() => {
        setLetterVisible(prev => {
          const newVisible = [...prev];
          newVisible[index] = true;
          return newVisible;
        });
        
        // Animate letter appearance
        Animated.timing(letterAnimations[index], {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      }, 800 + index * 100);
    });

    // Start rotation animations
    Animated.loop(
      Animated.timing(outerRotation, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(middleRotation, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();

    Animated.loop(
      Animated.timing(innerRotation, {
        toValue: 1,
        duration: 15000,
        useNativeDriver: true,
      })
    ).start();

    // Start bounce animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Start particle animations
    particleAnimations.forEach((anim, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 3000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, []);

  const letters = ['J', 'o', 'b', 'P', 'a', 't', 'h'];

  // Rotation interpolations
  const outerRotateInterpolate = outerRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const middleRotateInterpolate = middleRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const innerRotateInterpolate = innerRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bounceInterpolate = bounceAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -8],
  });

  return (
    <LinearGradient
      colors={['#fff', '#fff']}
      style={styles.container}
    >
      <View style={styles.logoContainer}>
        {/* Animated rotating paths */}
        <View style={styles.pathContainer}>
          {/* Outer ring */}
          <Animated.View
            style={[
              styles.outerRing,
              {
                transform: [{ rotate: outerRotateInterpolate }],
              },
            ]}
          />
          
          {/* Middle ring */}
          <Animated.View
            style={[
              styles.middleRing,
              {
                transform: [{ rotate: middleRotateInterpolate }],
              },
            ]}
          />
          
          {/* Inner ring */}
          <Animated.View
            style={[
              styles.innerRing,
              {
                transform: [{ rotate: innerRotateInterpolate }],
              },
            ]}
          />
          
          {/* Center logo/person */}
          <Animated.View
            style={[
              styles.centerLogo,
              {
                transform: [{ translateY: bounceInterpolate }],
              },
            ]}
          >
            <LinearGradient
              colors={['#6366f1', '#8b5cf6']}
              style={styles.centerGradient}
            >
              <View style={styles.centerIcon}>
                <Svg width="20" height="20" viewBox="0 0 20 20" fill="white">
                  <Path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </Svg>
              </View>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Animated text */}
        <View style={styles.textContainer}>
          {letters.map((letter, index) => (
            <MaskedView
              key={index}
              maskElement={
                <Animated.Text
                  style={[
                    styles.letter,
                    {
                      opacity: letterAnimations[index],
                      transform: [
                        {
                          translateY: letterAnimations[index].interpolate({
                            inputRange: [0, 1],
                            outputRange: [20, 0],
                          }),
                        },
                      ],
                    },
                  ]}
                >
                  {letter}
                </Animated.Text>
              }
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.letterGradient}
              >
                <Text style={[styles.letter, { opacity: 0 }]}>{letter}</Text>
              </LinearGradient>
            </MaskedView>
          ))}
        </View>

        {/* Subtitle */}
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Your Career Journey Starts Here</Text>
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, { backgroundColor: '#6366f1' }]} />
            <View style={[styles.dot, { backgroundColor: '#8b5cf6' }]} />
            <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
          </View>
        </View>
      </View>

      {/* Floating particles */}
      {particleAnimations.map((anim, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              left: `${20 + index * 15}%`,
              top: `${30 + (index % 3) * 20}%`,
              transform: [
                {
                  translateY: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -10],
                  }),
                },
                {
                  rotate: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '180deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['#6366f1', '#8b5cf6']}
            style={styles.particleGradient}
          />
        </Animated.View>
      ))}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
  },
  pathContainer: {
    width: 256,
    height: 256,
    marginBottom: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerRing: {
    position: 'absolute',
    width: 256,
    height: 256,
    borderRadius: 128,
    borderWidth: 8,
    borderTopColor: '#667eea',
    borderRightColor: '#667eea',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  middleRing: {
    position: 'absolute',
    width: 208,
    height: 208,
    borderRadius: 104,
    borderWidth: 8,
    borderTopColor: '#764ba2',
    borderRightColor: '#764ba2',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  innerRing: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 8,
    borderTopColor: '#6366f1',
    borderRightColor: '#6366f1',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  centerLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  centerGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerIcon: {
    width: 32,
    height: 32,
    backgroundColor: 'white',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  letter: {
    fontSize: 48,
    fontWeight: '700',
    marginHorizontal: 1,
    textAlign: 'center',
  },
  letterGradient: {
    paddingHorizontal: 1,
  },
  subtitleContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    opacity: 0.7,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.2,
  },
  particleGradient: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default JobPathAnimatedLogo;