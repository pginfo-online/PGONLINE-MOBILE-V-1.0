import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

/**
 * VisitCard — shows a single visit request with status
 * @param {object} visit - Visit request data
 * @param {function} onPress
 */
export default function VisitCard({ visit, onPress }) {
  const statusConfig = {
    pending:   { variant: 'warning',  icon: 'time-outline',         label: 'Pending' },
    confirmed: { variant: 'success',  icon: 'checkmark-circle',     label: 'Confirmed' },
    cancelled: { variant: 'error',    icon: 'close-circle-outline',  label: 'Cancelled' },
    completed: { variant: 'success',  icon: 'checkmark-done-circle', label: 'Completed' },
  };

  const cfg = statusConfig[visit.status] || statusConfig.pending;
  const pgName = visit.pg?.name || 'PG';
  const pgLocation = visit.pg ? `${visit.pg.area}, ${visit.pg.city}` : '';
  const date = visit.scheduledDate
    ? new Date(visit.scheduledDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconCol}>
        <View style={[styles.iconCircle, { backgroundColor: cfg.variant === 'success' ? colors.successBg : cfg.variant === 'error' ? colors.errorBg : colors.warningBg }]}>
          <Ionicons name={cfg.icon} size={22} color={cfg.variant === 'success' ? colors.success : cfg.variant === 'error' ? colors.error : colors.warning} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.pgName} numberOfLines={1}>{pgName}</Text>
        {pgLocation ? <Text style={styles.location}>{pgLocation}</Text> : null}
        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
          <Text style={styles.date}>{date} · {visit.scheduledTime}</Text>
        </View>
        {visit.message ? <Text style={styles.message} numberOfLines={2}>"{visit.message}"</Text> : null}
      </View>

      <View style={styles.right}>
        <Badge text={cfg.label} variant={visit.status === 'confirmed' || visit.status === 'completed' ? 'success' : visit.status === 'cancelled' ? 'error' : 'warning'} />
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginTop: 8 }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', gap: 12,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadiusLg,
    padding: spacing.cardPadding,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
    marginBottom: 12,
  },
  iconCol: { paddingTop: 2 },
  iconCircle: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1 },
  pgName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
  location: { fontSize: 13, color: colors.textMuted, marginBottom: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  date: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  message: { fontSize: 13, color: colors.textMuted, fontStyle: 'italic', marginTop: 2 },
  right: { alignItems: 'flex-end' },
});
