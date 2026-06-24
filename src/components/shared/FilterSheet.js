import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Dimensions
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import Button from '../ui/Button';
import Chip from '../ui/Chip';
import { SectionHeader, Divider } from './CommonUI';
import PriceRangeSlider from '../ui/PriceRangeSlider';

const CITIES = ['Pune', 'Mumbai', 'Delhi'];
const AREAS_BY_CITY = {
  Pune: ['Hinjewadi', 'Wakad', 'Baner', 'Kothrud', 'Viman Nagar', 'Hadapsar'],
  Mumbai: ['Andheri', 'BKC', 'Thane', 'Powai', 'Goregaon'],
  Delhi: ['Noida', 'Gurugram', 'Dwarka', 'Lajpat Nagar'],
};
const FOOD_OPTIONS = [
  { label: 'Veg', value: 'veg' },
  { label: 'Non-Veg', value: 'nonveg' },
  { label: 'Both', value: 'both' },
  { label: 'Not Required', value: 'none' },
];
const SHARING_OPTIONS = [
  { label: 'Single', value: 'single' },
  { label: 'Double', value: 'double' },
  { label: 'Triple', value: 'triple' },
];
const GENDER_OPTIONS = [
  { label: 'Any', value: 'any' },
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'rent_asc' },
  { label: 'Price: High to Low', value: 'rent_desc' },
  { label: 'Most Popular', value: 'popular' },
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * FilterSheet — bottom sheet for PG search filters
 * @param {boolean} visible
 * @param {function} onClose
 * @param {object} filters - Current filter values
 * @param {function} onApply - Called with new filter object
 */
export default function FilterSheet({ visible, onClose, filters = {}, onApply }) {
  const [local, setLocal] = useState(filters);
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);

  // Sync incoming filters
  useEffect(() => {
    if (visible) {
      setLocal(filters);
      opacity.value = withTiming(1, { duration: 250 });
      translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
        opacity.value = 0;
      });
    }
  }, [visible, filters]);

  const update = (key, val) => {
    Haptics.selectionAsync();
    setLocal((p) => ({ ...p, [key]: val }));
  };

  const handleClose = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, () => {
        runOnJS(onClose)();
    });
  };

  const handleApply = () => {
    onApply(local);
    handleClose();
  };

  const handleReset = () => {
    const empty = {};
    setLocal(empty);
    onApply(empty);
    handleClose();
  };

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity style={styles.backdropTouch} onPress={handleClose} activeOpacity={1} />
      </Animated.View>
      
      <Animated.View style={[styles.sheet, sheetStyle]}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Filter PGs</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* Sort By */}
          <SectionHeader title="Sort By" />
          <View style={styles.chipRow}>
            {SORT_OPTIONS.map((s) => (
              <Chip
                key={s.value} label={s.label}
                selected={local.sort === s.value || (!local.sort && s.value === 'newest')}
                onPress={() => update('sort', s.value)}
              />
            ))}
          </View>
          
          <Divider />

          {/* Price Range */}
          <SectionHeader title="Monthly Rent" />
          <PriceRangeSlider 
            minRent={local.minRent}
            maxRent={local.maxRent}
            onValuesChange={(min, max) => {
              setLocal(p => ({...p, minRent: min, maxRent: max}));
            }}
          />

          <Divider />

          {/* City */}
          <SectionHeader title="City" />
          <View style={styles.chipRow}>
            {CITIES.map((c) => (
              <Chip
                key={c} label={c}
                selected={local.city === c}
                onPress={() => update('city', local.city === c ? undefined : c)}
              />
            ))}
          </View>

          {/* Area */}
          {local.city && (
            <>
              <Divider />
              <SectionHeader title="Area" />
              <View style={styles.chipRow}>
                {(AREAS_BY_CITY[local.city] || []).map((a) => (
                  <Chip
                    key={a} label={a}
                    selected={local.area === a}
                    onPress={() => update('area', local.area === a ? undefined : a)}
                    size="sm"
                  />
                ))}
              </View>
            </>
          )}

          <Divider />

          {/* Sharing type */}
          <SectionHeader title="Sharing Type" />
          <View style={styles.chipRow}>
            {SHARING_OPTIONS.map((s) => (
              <Chip
                key={s.value} label={s.label}
                selected={local.sharingType === s.value}
                onPress={() => update('sharingType', local.sharingType === s.value ? undefined : s.value)}
              />
            ))}
          </View>

          <Divider />

          {/* Gender */}
          <SectionHeader title="PG Type" />
          <View style={styles.chipRow}>
            {GENDER_OPTIONS.map((g) => (
              <Chip
                key={g.value} label={g.label}
                selected={local.gender === g.value}
                onPress={() => update('gender', local.gender === g.value ? undefined : g.value)}
              />
            ))}
          </View>

          <Divider />

          {/* Food */}
          <SectionHeader title="Food Preference" />
          <View style={styles.chipRow}>
            {FOOD_OPTIONS.map((f) => (
              <Chip
                key={f.value} label={f.label}
                selected={local.food === f.value}
                onPress={() => update('food', local.food === f.value ? undefined : f.value)}
              />
            ))}
          </View>

          <Divider />

          {/* Amenities & verification */}
          <SectionHeader title="Amenities & More" />
          <View style={styles.chipRow}>
            <Chip label="AC" selected={local.ac === 'true'} onPress={() => update('ac', local.ac === 'true' ? undefined : 'true')} icon={<Ionicons name="snow-outline" size={14} color={local.ac === 'true' ? colors.primary : colors.textSecondary} />} />
            <Chip label="Non-AC" selected={local.ac === 'false'} onPress={() => update('ac', local.ac === 'false' ? undefined : 'false')} />
            <Chip
              label="Verified Only"
              selected={local.isVerified === 'true'}
              onPress={() => update('isVerified', local.isVerified === 'true' ? undefined : 'true')}
              icon={<Ionicons name="shield-checkmark" size={14} color={local.isVerified === 'true' ? colors.primary : colors.textSecondary} />}
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Button title="Reset" variant="secondary" onPress={handleReset} style={{ flex: 1 }} />
          <Button title="Apply Filters" onPress={handleApply} style={{ flex: 2 }} />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backdropTouch: {
      flex: 1,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    paddingHorizontal: spacing.screenPadding,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center', marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  closeBtn: {
      padding: 4,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  footer: {
    flexDirection: 'row', gap: 12, paddingVertical: 16,
    borderTopWidth: 1, borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});
