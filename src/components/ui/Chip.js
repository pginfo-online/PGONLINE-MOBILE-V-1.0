import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

/**
 * Chip / pill toggle component
 * @param {string} label
 * @param {boolean} selected
 * @param {function} onPress
 * @param {'sm'|'md'} size
 * @param {React.ReactNode} icon
 * @param {object} style
 */
export default function Chip({ label, selected = false, onPress, size = 'md', icon, style }) {
  const isSm = size === 'sm';
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.chip,
        isSm ? styles.sm : styles.md,
        selected ? styles.selected : styles.unselected,
        style,
      ]}
    >
      {icon && <>{icon}</>}
      <Text style={[styles.label, selected ? styles.labelSelected : styles.labelUnselected, icon && { marginLeft: 4 }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 999, borderWidth: 1.5,
  },
  sm: { paddingVertical: 5, paddingHorizontal: 12 },
  md: { paddingVertical: 8, paddingHorizontal: 16 },
  selected: { backgroundColor: '#ede9fe', borderColor: colors.primary },
  unselected: { backgroundColor: colors.surface, borderColor: colors.border },
  label: { fontSize: 13, fontWeight: '600' },
  labelSelected: { color: colors.primary },
  labelUnselected: { color: colors.textSecondary },
});
