import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import colors from '../../theme/colors';

/**
 * CityDropdown — compact pill trigger that opens a modal list of cities.
 * Designed to sit inline in a single-row toolbar (search | filter | city).
 *
 * @param {string[]} cities
 * @param {string} selectedCity
 * @param {function} onSelect
 * @param {boolean} dark - whether the trigger sits on a dark/gradient background
 */
export default function CityDropdown({ cities, selectedCity, onSelect, dark = true }) {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => {
    Haptics.selectionAsync();
    setOpen(true);
  }, []);

  const handleSelect = useCallback(
    (city) => {
      Haptics.selectionAsync();
      onSelect(city);
      setOpen(false);
    },
    [onSelect]
  );

  const renderItem = useCallback(
    ({ item: city }) => {
      const active = city === selectedCity;
      return (
        <TouchableOpacity
          style={[styles.option, active && styles.optionActive]}
          onPress={() => handleSelect(city)}
          activeOpacity={0.7}
          accessibilityRole="menuitem"
          accessibilityState={{ selected: active }}
        >
          <View style={[styles.optionIconWrap, active && styles.optionIconWrapActive]}>
            <Ionicons
              name="location"
              size={16}
              color={active ? colors.primary : colors.textMuted}
            />
          </View>
          <Text style={[styles.optionText, active && styles.optionTextActive]}>{city}</Text>
          {active && <Ionicons name="checkmark-circle" size={20} color={colors.primary} />}
        </TouchableOpacity>
      );
    },
    [selectedCity, handleSelect]
  );

  return (
    <>
      <TouchableOpacity
        style={[styles.trigger, dark ? styles.triggerDark : styles.triggerLight]}
        onPress={handleOpen}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Selected city: ${selectedCity}. Tap to change city.`}
      >
        <Ionicons
          name="location-sharp"
          size={15}
          color={dark ? '#fff' : colors.primary}
        />
        <Text style={[styles.triggerText, dark ? styles.triggerTextDark : styles.triggerTextLight]} numberOfLines={1}>
          {selectedCity}
        </Text>
        <Ionicons
          name="chevron-down"
          size={14}
          color={dark ? 'rgba(255,255,255,0.85)' : colors.textMuted}
        />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Choose a city</Text>
            <FlatList
              data={cities}
              keyExtractor={(item) => item}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              contentContainerStyle={styles.listContent}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 38,
    paddingHorizontal: 10,
    borderRadius: 19,
    maxWidth: 108,
  },
  triggerDark: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  triggerLight: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  triggerTextDark: { color: '#fff' },
  triggerTextLight: { color: colors.textPrimary },

  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    paddingHorizontal: 20,
    maxHeight: '60%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  listContent: { paddingVertical: 4 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  optionActive: {},
  optionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconWrapActive: {
    backgroundColor: colors.primary + '15',
  },
  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  separator: {
    height: 1,
    backgroundColor: colors.borderLight,
  },
});