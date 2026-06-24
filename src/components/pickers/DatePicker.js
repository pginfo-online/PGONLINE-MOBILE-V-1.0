import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { getTodayString, parseDate, formatDateDisplay } from '../../utils/dateUtils';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DatePicker = ({
  value,
  onChange,
  minDate,
  maxDate,
  disabledDates = [],
  placeholder = 'Select a date',
  label,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const selectedDate = value; // YYYY-MM-DD

  // Determine the initial month/year to show
  const initialDate = useMemo(() => {
    if (selectedDate) {
      const d = parseDate(selectedDate);
      if (d && !isNaN(d.getTime())) return d;
    }
    return new Date();
  }, [selectedDate]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11

  const todayStr = getTodayString();

  // Build the days matrix for the current view month
  const daysMatrix = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const matrix = [];
    let row = [];

    // Fill in previous month's trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      row.push({
        day: daysInPrevMonth - i,
        month: viewMonth - 1,
        year: viewMonth === 0 ? viewYear - 1 : viewYear,
        isCurrentMonth: false,
      });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      row.push({ day: d, month: viewMonth, year: viewYear, isCurrentMonth: true });
      if (row.length === 7) {
        matrix.push(row);
        row = [];
      }
    }

    // Fill remaining cells with next month
    let nextDay = 1;
    while (row.length < 7) {
      row.push({
        day: nextDay,
        month: viewMonth + 1,
        year: viewMonth === 11 ? viewYear + 1 : viewYear,
        isCurrentMonth: false,
      });
      nextDay++;
    }
    if (row.length) matrix.push(row);

    return matrix;
  }, [viewYear, viewMonth]);

  // Helper to convert a day object to YYYY-MM-DD
  const dayToDateStr = useCallback(({ year, month, day }) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }, []);

  // Check if a day is selectable
  const isDisabled = useCallback(
    (dateObj) => {
      const dateStr = dayToDateStr(dateObj);
      if (disabledDates.includes(dateStr)) return true;
      if (minDate && dateStr < minDate) return true;
      if (maxDate && dateStr > maxDate) return true;
      return false;
    },
    [dayToDateStr, disabledDates, minDate, maxDate]
  );

  const handleDayPress = useCallback(
    (dateObj) => {
      if (isDisabled(dateObj)) return;
      const dateStr = dayToDateStr(dateObj);
      onChange(dateStr);
      setModalVisible(false);
    },
    [isDisabled, dayToDateStr, onChange]
  );

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const isSelected = useCallback(
    (dateObj) => dayToDateStr(dateObj) === selectedDate,
    [dayToDateStr, selectedDate]
  );

  const displayText = selectedDate ? formatDateDisplay(selectedDate) : placeholder;

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel={`${label || 'Date'}: ${displayText}`}
      >
        <Text style={[styles.triggerText, !selectedDate && styles.placeholder]}>
          {displayText}
        </Text>
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="none"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={goToPrevMonth} accessibilityLabel="Previous month">
                <Text style={styles.navArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity onPress={goToNextMonth} accessibilityLabel="Next month">
                <Text style={styles.navArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Days of week */}
            <View style={styles.daysRow}>
              {DAYS_OF_WEEK.map((d) => (
                <Text key={d} style={styles.dayLabel}>{d}</Text>
              ))}
            </View>

            {/* Calendar grid */}
            {daysMatrix.map((row, rIdx) => (
              <View key={rIdx} style={styles.daysRow}>
                {row.map((dateObj, cIdx) => {
                  const disabled = isDisabled(dateObj);
                  const selected = isSelected(dateObj);
                  return (
                    <TouchableOpacity
                      key={cIdx}
                      style={[
                        styles.dayCell,
                        !dateObj.isCurrentMonth && styles.outsideMonth,
                        disabled && styles.disabledDay,
                        selected && styles.selectedDay,
                      ]}
                      disabled={disabled}
                      onPress={() => handleDayPress(dateObj)}
                      accessibilityLabel={`${dateObj.day} ${MONTH_NAMES[dateObj.month]} ${dateObj.year}`}
                      accessibilityRole="button"
                    >
                      <Text
                        style={[
                          styles.dayText,
                          !dateObj.isCurrentMonth && styles.outsideMonthText,
                          disabled && styles.disabledText,
                          selected && styles.selectedDayText,
                        ]}
                      >
                        {dateObj.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}

            {/* Close */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  wrapper: { marginBottom: 20 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  trigger: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  triggerText: {
    fontSize: 16,
    color: colors.textPrimary,
  },
  placeholder: { color: colors.textSecondary },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navArrow: { fontSize: 28, color: colors.primary, paddingHorizontal: 10 },
  monthTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayLabel: {
    width: 36,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  outsideMonth: { opacity: 0.3 },
  outsideMonthText: { color: colors.textSecondary },
  disabledDay: { opacity: 0.4 },
  disabledText: { color: colors.textDisabled },
  selectedDay: { backgroundColor: colors.primary },
  selectedDayText: { color: '#fff', fontWeight: '700' },
  closeButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  closeText: { fontSize: 16, color: colors.primary },
});

export default DatePicker;