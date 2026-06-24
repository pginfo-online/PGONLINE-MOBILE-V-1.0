import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

/**
 * Suggestion item for the search dropdown
 */
export default function SearchSuggestionItem({ item, onPress, onFill }) {
  const isArea = item.type === 'area';
  const icon = isArea ? 'location-outline' : 'business-outline';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color={colors.textSecondary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.mainText} numberOfLines={1}>{item.text}</Text>
        <Text style={styles.subText}>{isArea ? `Area in ${item.city}` : 'PG Name'}</Text>
      </View>
      {onFill && (
        <TouchableOpacity style={styles.fillButton} onPress={() => onFill(item.text)}>
          <Ionicons name="return-up-back-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderLight,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  mainText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  subText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  fillButton: {
    padding: 8,
  },
});
