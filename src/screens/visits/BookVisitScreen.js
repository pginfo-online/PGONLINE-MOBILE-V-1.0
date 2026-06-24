import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { visitService } from '../../services/visit.service';

import ScreenHeader from '../../components/layout/ScreenHeader';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { PGCard } from '../../components/ui/Card';
import { DatePicker, TimePicker } from '../../components/pickers';
import { getTodayString, isValidFutureDate } from '../../utils/dateUtils';

export default function BookVisitScreen({ route, navigation }) {
  const { pg } = route.params;
  const insets = useSafeAreaInsets();
  const [form, setForm] = useState({ date: '', time: '', message: '' });
  const [loading, setLoading] = useState(false);

  const todayStr = getTodayString();

  const handleBook = async () => {
    // Enhanced validation
    if (!form.date) {
      Toast.show({ type: 'error', text1: 'Missing date', text2: 'Please select a visit date' });
      return;
    }
    if (!isValidFutureDate(form.date)) {
      Toast.show({ type: 'error', text1: 'Invalid date', text2: 'Please select a date not in the past' });
      return;
    }
    if (!form.time) {
      Toast.show({ type: 'error', text1: 'Missing time', text2: 'Please select a time slot' });
      return;
    }

    setLoading(true);
    try {
      await visitService.create({
        pgId: pg._id,
        scheduledDate: form.date,      // YYYY-MM-DD
        scheduledTime: form.time,      // e.g. "10:30 AM"
        message: form.message,
      });
      Toast.show({ type: 'success', text1: 'Visit Requested!', text2: 'The owner will confirm soon.' });
      navigation.goBack();
    } catch (e) {
      // The backend might return an error message; display it
      const errorMessage = e?.response?.data?.message || e.message || 'Something went wrong';
      Toast.show({ type: 'error', text1: 'Failed to request visit', text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScreenHeader title="Schedule Visit" onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginBottom: 10 }}>Booking visit for:</Text>
          <PGCard pg={pg} onPress={() => {}} />
        </View>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>When would you like to visit?</Text>

          <DatePicker
            label="Select Date"
            value={form.date}
            onChange={(v) => setForm({ ...form, date: v })}
            placeholder="Pick a date"
            minDate={todayStr}
            // Example: disable specific dates (public holidays, owner's off days)
            disabledDates={[]}
          />

          <TimePicker
            label="Select Time"
            value={form.time}
            onChange={(v) => setForm({ ...form, time: v })}
            placeholder="Pick a time"
            startTime="09:00"
            endTime="20:00"
            interval={30}
            disabledSlots={[]} // could be fetched from backend
          />

          <Input
            label="Message for Owner (Optional)"
            placeholder="I will be coming with my parents..."
            value={form.message}
            onChangeText={(v) => setForm({ ...form, message: v })}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom || 16 }]}>
        <Button
          title="Request Visit"
          onPress={handleBook}
          loading={loading}
          fullWidth
          size="lg"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screenPadding },
  formCard: {
    backgroundColor: colors.surface,
    padding: 20, borderRadius: 16,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 16 },
  footer: {
    padding: spacing.screenPadding, paddingTop: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
  },
});