import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

/**
 * Reusable CTA Row — used for contact actions (Call, WhatsApp)
 * @param {string} iconName
 * @param {string} label
 * @param {string} sublabel
 * @param {function} onPress
 * @param {string} color
 */
export function CTAButton({ iconName, label, sublabel, onPress, color = colors.primary }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.ctaBtn, { borderColor: color + '30' }]}>
      <View style={[styles.ctaIcon, { backgroundColor: color + '15' }]}>
        <Ionicons name={iconName} size={22} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.ctaLabel}>{label}</Text>
        {sublabel && <Text style={styles.ctaSublabel}>{sublabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

/**
 * Section Header — reusable header for screen sections
 * @param {string} title
 * @param {string} actionText
 * @param {function} onAction
 */
export function SectionHeader({ title, actionText, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {actionText && (
        <TouchableOpacity onPress={onAction}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Divider — simple horizontal line
 */
export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

/**
 * InfoRow — key-value display
 * @param {string} label
 * @param {string} value
 * @param {string} iconName
 */
export function InfoRow({ label, value, iconName }) {
  return (
    <View style={styles.infoRow}>
      {iconName && <Ionicons name={iconName} size={16} color={colors.textMuted} />}
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  ctaIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  ctaLabel: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  ctaSublabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 14, marginTop: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  sectionAction: { fontSize: 14, fontWeight: '600', color: colors.primary },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
  infoRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.borderLight,
  },
  infoLabel: { flex: 1, fontSize: 14, color: colors.textSecondary },
  infoValue: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },
});
