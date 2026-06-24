import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

/**
 * Chip to display a recent search query
 */
export default function RecentSearchChip({ query, onPress, onRemove }) {
  return (
    <TouchableOpacity
      style={styles.chip}
      onPress={() => onPress(query)}
      activeOpacity={0.7}
      onLongPress={() => onRemove(query)}
    >
      <Ionicons name="time-outline" size={14} color={colors.textSecondary} style={styles.icon} />
      <Text style={styles.text} numberOfLines={1}>{query}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    fontSize: 13,
    color: colors.textPrimary,
  },
});
