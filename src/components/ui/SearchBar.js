import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

/**
 * Reusable SearchBar component
 * @param {string} value
 * @param {function} onChangeText
 * @param {string} placeholder
 * @param {function} onSubmit
 * @param {function} onClear
 * @param {function} onFilterPress
 * @param {boolean} showFilter
 * @param {object} style
 */
export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search PGs...',
  onSubmit,
  onClear,
  onFilterPress,
  showFilter = false,
  style,
}) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputWrapper}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          onSubmitEditing={onSubmit}
          autoCapitalize="none"
        />
        {value?.length > 0 && (
          <TouchableOpacity onPress={onClear} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {showFilter && (
        <TouchableOpacity onPress={onFilterPress} style={styles.filterBtn} activeOpacity={0.7}>
          <Ionicons name="options-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius,
    borderWidth: 1.5,
    borderColor: colors.border,
    height: 46,
  },
  searchIcon: { marginLeft: 14 },
  input: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 15,
    color: colors.textPrimary,
  },
  clearBtn: { paddingRight: 12 },
  filterBtn: {
    width: 46, height: 46,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.surface,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
});
