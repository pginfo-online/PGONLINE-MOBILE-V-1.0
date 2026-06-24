import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import colors from '../../theme/colors';

const SLIDER_WIDTH = 280;
const THUMB_SIZE = 24;
const MIN_PRICE = 2000;
const MAX_PRICE = 30000;
const STEP = 500;

export default function PriceRangeSlider({ minRent, maxRent, onValuesChange }) {
  const [minLabel, setMinLabel] = useState(minRent || MIN_PRICE);
  const [maxLabel, setMaxLabel] = useState(maxRent || MAX_PRICE);

  // Convert initial values to pixel positions
  const initialMinPos = ((minLabel - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * SLIDER_WIDTH;
  const initialMaxPos = ((maxLabel - MIN_PRICE) / (MAX_PRICE - MIN_PRICE)) * SLIDER_WIDTH;

  const minPos = useSharedValue(initialMinPos);
  const maxPos = useSharedValue(initialMaxPos);
  
  const minStartPos = useSharedValue(initialMinPos);
  const maxStartPos = useSharedValue(initialMaxPos);

  const updateLabels = (min, max) => {
    // Calculate values based on positions
    const minVal = MIN_PRICE + Math.round((min / SLIDER_WIDTH) * (MAX_PRICE - MIN_PRICE));
    const maxVal = MIN_PRICE + Math.round((max / SLIDER_WIDTH) * (MAX_PRICE - MIN_PRICE));

    // Snap to step
    const snappedMin = Math.round(minVal / STEP) * STEP;
    const snappedMax = Math.round(maxVal / STEP) * STEP;

    setMinLabel(snappedMin);
    setMaxLabel(snappedMax);
  };

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const minGesture = Gesture.Pan()
    .onStart(() => {
      minStartPos.value = minPos.value;
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      let newPos = minStartPos.value + event.translationX;
      if (newPos < 0) newPos = 0;
      if (newPos > maxPos.value - THUMB_SIZE) newPos = maxPos.value - THUMB_SIZE;
      minPos.value = newPos;
      runOnJS(updateLabels)(newPos, maxPos.value);
    })
    .onEnd(() => {
      runOnJS(onValuesChange)(minLabel, maxLabel);
    });

  const maxGesture = Gesture.Pan()
    .onStart(() => {
      maxStartPos.value = maxPos.value;
      runOnJS(triggerHaptic)();
    })
    .onUpdate((event) => {
      let newPos = maxStartPos.value + event.translationX;
      if (newPos > SLIDER_WIDTH) newPos = SLIDER_WIDTH;
      if (newPos < minPos.value + THUMB_SIZE) newPos = minPos.value + THUMB_SIZE;
      maxPos.value = newPos;
      runOnJS(updateLabels)(minPos.value, newPos);
    })
    .onEnd(() => {
      runOnJS(onValuesChange)(minLabel, maxLabel);
    });

  const trackAnimatedStyle = useAnimatedStyle(() => {
    return {
      left: minPos.value,
      width: maxPos.value - minPos.value,
    };
  });

  const minThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: minPos.value }],
    };
  });

  const maxThumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: maxPos.value }],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.labelsContainer}>
        <Text style={styles.labelText}>₹{minLabel.toLocaleString('en-IN')}</Text>
        <Text style={styles.labelText}>₹{maxLabel.toLocaleString('en-IN')}</Text>
      </View>

      <View style={styles.sliderContainer}>
        <View style={styles.backgroundTrack} />
        <Animated.View style={[styles.activeTrack, trackAnimatedStyle]} />

        <GestureDetector gesture={minGesture}>
          <Animated.View style={[styles.thumb, minThumbStyle]} />
        </GestureDetector>

        <GestureDetector gesture={maxGesture}>
          <Animated.View style={[styles.thumb, maxThumbStyle]} />
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: SLIDER_WIDTH + THUMB_SIZE,
    marginBottom: 16,
  },
  labelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  sliderContainer: {
    width: SLIDER_WIDTH + THUMB_SIZE,
    height: THUMB_SIZE,
    justifyContent: 'center',
  },
  backgroundTrack: {
    position: 'absolute',
    left: THUMB_SIZE / 2,
    right: THUMB_SIZE / 2,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: 2,
  },
  activeTrack: {
    position: 'absolute',
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginLeft: THUMB_SIZE / 2, // Offset for thumb center
  },
  thumb: {
    position: 'absolute',
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
});
