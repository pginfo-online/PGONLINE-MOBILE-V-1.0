import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/colors';

/**
 * Reusable ScreenHeader component
 * @param {string} title
 * @param {string} subtitle
 * @param {function} onBack - Back button handler
 * @param {React.ReactNode} rightAction
 * @param {boolean} gradient - Use gradient background
 * @param {boolean} transparent
 * @param {'light'|'dark'} textColor
 */
export default function ScreenHeader({
  title,
  subtitle,
  onBack,
  rightAction,
  gradient = false,
  transparent = false,
  textColor = 'dark',
}) {
  const insets = useSafeAreaInsets();
  const isLight = textColor === 'light';

  const content = (
    <View style={[styles.inner, { paddingTop: insets.top + 8 }]}>
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={[styles.backBtn, isLight && styles.backBtnLight]} activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={22} color={isLight ? '#fff' : colors.textPrimary} />
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, isLight && { color: '#fff' }]} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, isLight && { color: 'rgba(255,255,255,0.7)' }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightAction && <View>{rightAction}</View>}
    </View>
  );

  if (gradient) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientMid]} style={styles.container}>
        {content}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.container, transparent ? styles.transparent : styles.solid]}>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  solid: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  transparent: { backgroundColor: 'transparent', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  inner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 14,
  },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 10 },
  backBtn: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnLight: { backgroundColor: 'rgba(255,255,255,0.15)' },
  title: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
});
