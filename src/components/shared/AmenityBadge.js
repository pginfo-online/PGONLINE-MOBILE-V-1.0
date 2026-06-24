import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

/**
 * Reusable AmenityBadge — small pill showing a facility
 * @param {string} name - Facility name
 * @param {string} iconName - Ionicons name
 * @param {boolean} active
 */
export function AmenityBadge({ name, iconName, active = true }) {
  return (
    <View style={[styles.badge, !active && styles.inactive]}>
      <Ionicons name={iconName || 'checkmark-circle'} size={14} color={active ? colors.primary : colors.textMuted} />
      <Text style={[styles.badgeText, !active && { color: colors.textMuted }]}>{name}</Text>
    </View>
  );
}

// Mapping of facility names to icons
const facilityIcons = {
  WiFi: 'wifi', Laundry: 'shirt-outline', Parking: 'car-outline',
  Gym: 'barbell-outline', CCTV: 'videocam-outline', 'Power Backup': 'flash-outline',
  'Hot Water': 'water-outline', Housekeeping: 'sparkles-outline', TV: 'tv-outline',
  Refrigerator: 'cube-outline', 'RO Water': 'water', 'Study Room': 'book-outline',
  Lift: 'arrow-up-outline', 'Security Guard': 'shield-outline', 'Kitchen Access': 'restaurant-outline',
};

/**
 * Amenities Grid — displays a grid of facility badges
 * @param {string[]} facilities
 * @param {boolean} horizontal - Horizontal scroll
 */
export function AmenitiesGrid({ facilities = [], horizontal = false }) {
  const items = facilities.map((f) => (
    <AmenityBadge key={f} name={f} iconName={facilityIcons[f]} active />
  ));

  if (horizontal) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
        {items}
      </ScrollView>
    );
  }

  return <View style={styles.grid}>{items}</View>;
}

/**
 * Filter Chip — toggleable pill used in filter/search
 * @param {string} label
 * @param {boolean} selected
 * @param {function} onPress
 */
export function FilterChip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 12,
    backgroundColor: '#ede9fe', borderRadius: 8,
  },
  inactive: { backgroundColor: colors.surfaceAlt },
  badgeText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  hScroll: { gap: 8, paddingVertical: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 16,
    borderRadius: spacing.borderRadiusFull,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5, borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: '#ede9fe',
    borderColor: colors.primary,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.textSecondary },
  chipTextSelected: { color: colors.primary, fontWeight: '600' },
});
