import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import colors from '../../theme/colors';

/**
 * Full-screen loading overlay
 * @param {boolean} visible
 * @param {string} message
 * @param {boolean} transparent - Use modal overlay vs inline
 */
export function LoadingOverlay({ visible, message = 'Loading...' }) {
  if (!visible) return null;
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

/**
 * Inline loading spinner (centered)
 * @param {string} color
 * @param {'small'|'large'} size
 * @param {string} message
 */
export function LoadingSpinner({ color = colors.primary, size = 'large', message, style }) {
  return (
    <View style={[styles.spinnerContainer, style]}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.spinnerText}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  box: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 28, alignItems: 'center', gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15, shadowRadius: 20, elevation: 10,
  },
  message: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  spinnerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  spinnerText: { fontSize: 14, color: colors.textMuted, marginTop: 12 },
});
