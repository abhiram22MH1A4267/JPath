import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const CircularPersentage = ({ percentage = 0, radius = 35, strokeWidth = 6 }) => {
  const innerRadius = radius - strokeWidth / 2;
  const size = radius * 2;
  const circumference = 2 * Math.PI * innerRadius;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          stroke="#b7ead9"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Foreground Circle */}
        <Circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          stroke="#10b981"
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin={`${radius}, ${radius}`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.text}>{percentage}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
  },
});

export default CircularPersentage;
