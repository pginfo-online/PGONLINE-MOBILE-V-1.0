import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

/**
 * Reusable Badge component
 * @param {string} text
 * @param {'primary'|'success'|'warning'|'error'|'info'|'verified'|'pending'|'approved'|'rejected'} variant
 * @param {'sm'|'md'} size
 * @param {React.ReactNode} icon
 */
export default function Badge({ text, variant = 'primary', size = 'sm', icon, style }) {
  const variantStyles = {
    primary: { bg: '#ede9fe', text: '#5b21b6' },
    success: { bg: colors.successBg, text: '#065f46' },
    warning: { bg: colors.warningBg, text: '#92400e' },
    error: { bg: colors.errorBg, text: '#991b1b' },
    info: { bg: colors.infoBg, text: '#1e40af' },
    verified: { bg: colors.verifiedBg, text: colors.verified },
    pending: { bg: '#fef3c7', text: '#92400e' },
    approved: { bg: '#d1fae5', text: '#065f46' },
    rejected: { bg: '#fee2e2', text: '#991b1b' },
  };

  const v = variantStyles[variant] || variantStyles.primary;
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, isSmall ? styles.sm : styles.md, style]}>
      {icon && <View style={{ marginRight: 4 }}>{icon}</View>}
      <Text style={[styles.text, { color: v.text }, isSmall ? styles.textSm : styles.textMd]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', borderRadius: 999, alignSelf: 'flex-start' },
  sm: { paddingVertical: 3, paddingHorizontal: 10 },
  md: { paddingVertical: 5, paddingHorizontal: 12 },
  text: { fontWeight: '600' },
  textSm: { fontSize: 11 },
  textMd: { fontSize: 13 },
});
