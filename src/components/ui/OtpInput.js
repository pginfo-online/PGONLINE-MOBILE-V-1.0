import React, { useRef, useState, useCallback } from 'react';
import {
  View, TextInput, Text, StyleSheet, Pressable, Platform,
} from 'react-native';
import colors from '../../theme/colors';

const OTP_LENGTH = 6;

/**
 * Premium 6-digit OTP input component.
 * Features: auto-focus, backspace navigation, paste support.
 *
 * @param {string}   value       - Controlled value (string of up to 6 chars)
 * @param {function} onChange    - (newValue: string) => void
 * @param {boolean}  disabled    - Disables all inputs
 * @param {boolean}  hasError    - Shows error highlight on all cells
 * @param {object}   style       - Optional outer container style override
 */
export default function OtpInput({ value = '', onChange, disabled = false, hasError = false, style }) {
  const inputRefs = useRef([]);
  const [focusedIdx, setFocusedIdx] = useState(null);

  const digits = Array.from({ length: OTP_LENGTH }, (_, i) => value[i] || '');

  const handleChange = useCallback((text, idx) => {
    // Handle paste — if user pastes multiple digits at once
    const cleaned = text.replace(/\D/g, '').slice(0, OTP_LENGTH - idx);
    if (cleaned.length > 1) {
      const newVal = (value.slice(0, idx) + cleaned).slice(0, OTP_LENGTH);
      onChange(newVal);
      const nextFocus = Math.min(idx + cleaned.length, OTP_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const digit = text.replace(/\D/g, '').slice(-1);
    const arr = [...digits];
    arr[idx] = digit;
    const newVal = arr.join('').slice(0, OTP_LENGTH);
    onChange(newVal);
    if (digit && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  }, [value, digits, onChange]);

  const handleKeyPress = useCallback(({ nativeEvent }, idx) => {
    if (nativeEvent.key === 'Backspace') {
      if (digits[idx]) {
        // Clear current cell
        const arr = [...digits];
        arr[idx] = '';
        onChange(arr.join(''));
      } else if (idx > 0) {
        // Move to previous cell
        inputRefs.current[idx - 1]?.focus();
        const arr = [...digits];
        arr[idx - 1] = '';
        onChange(arr.join(''));
      }
    }
  }, [digits, onChange]);

  return (
    <View style={[styles.row, style]}>
      {digits.map((digit, idx) => {
        const isFocused = focusedIdx === idx;
        const isFilled = !!digit;
        return (
          <Pressable
            key={idx}
            onPress={() => inputRefs.current[idx]?.focus()}
            style={[
              styles.cell,
              isFocused && styles.cellFocused,
              isFilled && !isFocused && styles.cellFilled,
              hasError && styles.cellError,
              disabled && styles.cellDisabled,
            ]}
          >
            <TextInput
              ref={(ref) => (inputRefs.current[idx] = ref)}
              style={styles.cellText}
              value={digit}
              onChangeText={(t) => handleChange(t, idx)}
              onKeyPress={(e) => handleKeyPress(e, idx)}
              onFocus={() => setFocusedIdx(idx)}
              onBlur={() => setFocusedIdx(null)}
              keyboardType="number-pad"
              maxLength={OTP_LENGTH} // allows paste detection
              textAlign="center"
              selectTextOnFocus
              editable={!disabled}
              caretHidden
              selectionColor={colors.primary}
              accessible
              accessibilityLabel={`OTP digit ${idx + 1}`}
            />
            {/* Cursor indicator line when focused and empty */}
            {isFocused && !digit ? (
              <View style={styles.cursor} />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cell: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  cellFocused: {
    borderColor: colors.primary,
    backgroundColor: '#fff',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  cellFilled: {
    borderColor: colors.primary,
    backgroundColor: '#EEF2FF',
  },
  cellError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  cellDisabled: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  cellText: {
    width: '100%',
    height: '100%',
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary || '#1E293B',
    textAlign: 'center',
    padding: 0,
  },
  cursor: {
    position: 'absolute',
    bottom: 12,
    width: 18,
    height: 2,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
