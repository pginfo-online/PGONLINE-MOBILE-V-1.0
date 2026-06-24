import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Pressable,
} from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

/**
 * Generates a list of time strings in "h:mm A" format.
 * @param {string} start - e.g. "09:00"
 * @param {string} end - e.g. "18:00"
 * @param {number} interval - minutes
 */
const generateTimeSlots = (start = '09:00', end = '18:00', interval = 30) => {
  const slots = [];
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);
  const startTotal = startH * 60 + startM;
  const endTotal = endH * 60 + endM;

  for (let total = startTotal; total <= endTotal; total += interval) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    const hour12 = h % 12 || 12;
    const ampm = h < 12 ? 'AM' : 'PM';
    const timeStr = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
    slots.push(timeStr);
  }
  return slots;
};

const TimePicker = ({
  value,
  onChange,
  startTime = '09:00',
  endTime = '18:00',
  interval = 30,
  disabledSlots = [],
  placeholder = 'Select a time',
  label,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const slots = useMemo(
    () => generateTimeSlots(startTime, endTime, interval),
    [startTime, endTime, interval]
  );

  const handleSlotPress = useCallback(
    (slot) => {
      if (disabledSlots.includes(slot)) return;
      onChange(slot);
      setModalVisible(false);
    },
    [disabledSlots, onChange]
  );

  const displayText = value || placeholder;

  const renderSlot = ({ item }) => {
    const isDisabled = disabledSlots.includes(item);
    const isSelected = item === value;
    return (
      <TouchableOpacity
        style={[
          styles.slot,
          isSelected && styles.selectedSlot,
          isDisabled && styles.disabledSlot,
        ]}
        disabled={isDisabled}
        onPress={() => handleSlotPress(item)}
        accessibilityLabel={`Time slot ${item}`}
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.slotText,
            isSelected && styles.selectedSlotText,
            isDisabled && styles.disabledSlotText,
          ]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={() => setModalVisible(true)}
        style={styles.trigger}
        accessibilityRole="button"
        accessibilityLabel={`${label || 'Time'}: ${displayText}`}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
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
            <Text style={styles.modalTitle}>Choose a Time</Text>
            <FlatList
              data={slots}
              renderItem={renderSlot}
              keyExtractor={(item) => item}
              style={styles.slotList}
              showsVerticalScrollIndicator={false}
              initialNumToRender={12}
              getItemLayout={(_, index) => ({
                length: 48,
                offset: 48 * index,
                index,
              })}
            />
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
    justifyContent: 'flex-end', // bottom sheet style
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  slotList: { marginBottom: 16 },
  slot: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  selectedSlot: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  disabledSlot: {
    opacity: 0.4,
  },
  slotText: {
    fontSize: 16,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  selectedSlotText: { color: '#fff', fontWeight: '700' },
  disabledSlotText: { color: colors.textDisabled },
  closeButton: {
    marginTop: 8,
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  closeText: { fontSize: 16, color: colors.primary },
});

export default TimePicker;