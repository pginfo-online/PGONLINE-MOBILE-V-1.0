import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import colors from '../../theme/colors';

/**
 * Animated Skeleton loader with shimmer pulse effect.
 * Uses Reanimated for smooth 60fps opacity animation.
 * @param {number|string} width
 * @param {number} height
 * @param {number} borderRadius
 * @param {object} style
 */
export function Skeleton({ width, height = 16, borderRadius = 8, style }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.8, { duration: 900, easing: Easing.bezier(0.4, 0, 0.6, 1) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width || '100%', height, borderRadius },
        animatedStyle,
        style,
      ]}
    />
  );
}

/** Skeleton for a PG Card — matches PGCard layout */
export function PGCardSkeleton() {
  return (
    <View style={styles.pgSkeleton}>
      <Skeleton height={180} borderRadius={0} />
      <View style={{ padding: 14 }}>
        <Skeleton width="65%" height={18} style={{ marginBottom: 8 }} />
        <Skeleton width="45%" height={14} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Skeleton width={80} height={22} />
          <Skeleton width={60} height={16} />
        </View>
      </View>
    </View>
  );
}

/** Skeleton for a list row — matches PGListItem layout */
export function ListRowSkeleton() {
  return (
    <View style={styles.rowSkeleton}>
      <Skeleton width={90} height={90} borderRadius={10} />
      <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
        <Skeleton width="55%" height={16} />
        <Skeleton width="75%" height={13} />
        <Skeleton width="40%" height={13} />
        <Skeleton width={80} height={18} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

/** Skeleton for search suggestion rows */
export function SuggestionSkeleton() {
  return (
    <View style={styles.suggestionSkeleton}>
      <Skeleton width={36} height={36} borderRadius={18} />
      <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
        <Skeleton width="60%" height={15} />
        <Skeleton width="35%" height={12} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.shimmer,
  },
  pgSkeleton: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  rowSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 10,
  },
  suggestionSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
