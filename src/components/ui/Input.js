import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

/**
 * Reusable Input component
 * @param {string} label
 * @param {string} placeholder
 * @param {string} value
 * @param {function} onChangeText
 * @param {boolean} secureTextEntry - Password mode (adds eye toggle)
 * @param {string} error - Error message
 * @param {string} keyboardType
 * @param {string} autoCapitalize
 * @param {boolean} multiline
 * @param {number} numberOfLines
 * @param {React.ReactNode} leftIcon
 * @param {boolean} editable
 * @param {object} style
 * @param {object} inputStyle
 * @param {object} inputRef
 */
export default function Input({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  error,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  leftIcon,
  editable = true,
  style,
  inputStyle,
  inputRef,
  onFocus,
  onBlur,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={inputRef}
        style={{
          height: 50,
          backgroundColor: '#fff',
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          paddingHorizontal: 12,
          color: '#000',
        }}
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry && !showPassword}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        onFocus={onFocus}
        onBlur={onBlur}
        {...rest}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.base },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.borderRadius,
    backgroundColor: colors.surface,
  },
  focused: {
    borderColor: colors.primary,
  },
  errorBorder: { borderColor: colors.error },
  disabledBg: { backgroundColor: colors.surfaceAlt, opacity: 0.7 },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.textPrimary,
  },
  leftIcon: { paddingLeft: 14 },
  eyeBtn: { paddingRight: 14, paddingVertical: 12 },
  errorText: { fontSize: 12, color: colors.error, marginTop: 4 },
});
