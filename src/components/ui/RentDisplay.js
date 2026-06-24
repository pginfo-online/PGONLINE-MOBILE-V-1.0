import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

/**
 * RentDisplay — shows single/double/triple rent tiers
 * @param {{ single?: number, double?: number, triple?: number }} rent
 * @param {'row'|'grid'} layout
 */
export default function RentDisplay({ rent = {}, layout = 'row' }) {
  const tiers = [
    { key: 'single', label: 'Single', value: rent.single },
    { key: 'double', label: 'Double', value: rent.double },
    { key: 'triple', label: 'Triple', value: rent.triple },
  ].filter((t) => t.value);

  if (tiers.length === 0) return null;

  return (
    <View style={[styles.container, layout === 'grid' && styles.grid]}>
      {tiers.map((tier) => (
        <View key={tier.key} style={styles.tier}>
          <Text style={styles.tierLabel}>{tier.label}</Text>
          <Text style={styles.tierValue}>₹{tier.value.toLocaleString('en-IN')}</Text>
          <Text style={styles.tierSuffix}>/mo</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 12 },
  grid: { flexWrap: 'wrap' },
  tier: {
    flex: 1, backgroundColor: '#ede9fe', borderRadius: 10,
    padding: 12, alignItems: 'center', minWidth: 80,
  },
  tierLabel: { fontSize: 11, color: colors.accent, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  tierValue: { fontSize: 18, fontWeight: '800', color: colors.primary, marginTop: 4 },
  tierSuffix: { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
});
