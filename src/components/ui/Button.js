import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

/**
 * Reusable Button component
 * @param {string} title - Button text
 * @param {function} onPress - Press handler
 * @param {'primary'|'secondary'|'outline'|'danger'|'ghost'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading - Show spinner
 * @param {boolean} disabled
 * @param {boolean} fullWidth
 * @param {React.ReactNode} icon - Left icon
 * @param {React.ReactNode} iconRight - Right icon
 * @param {object} style - Extra styles
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  style,
}) {
  const sizeStyles = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 },
    md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: 15 },
    lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: 17 },
  };

  const s = sizeStyles[size];
  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[fullWidth && { width: '100%' }, style]}
      >
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.base,
            { paddingVertical: s.paddingVertical, paddingHorizontal: s.paddingHorizontal },
            isDisabled && styles.disabled,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              {icon}
              <Text style={[styles.textPrimary, { fontSize: s.fontSize }, icon && { marginLeft: 8 }]}>{title}</Text>
              {iconRight}
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: { bg: colors.surfaceAlt, text: colors.textPrimary, border: colors.border },
    outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
    danger: { bg: colors.errorBg, text: colors.error, border: colors.error },
    ghost: { bg: 'transparent', text: colors.textSecondary, border: 'transparent' },
  };

  const v = variantStyles[variant] || variantStyles.secondary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[
        styles.base,
        {
          paddingVertical: s.paddingVertical,
          paddingHorizontal: s.paddingHorizontal,
          backgroundColor: v.bg,
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: v.border,
        },
        isDisabled && styles.disabled,
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.text} size="small" />
      ) : (
        <>
          {icon}
          <Text style={[{ color: v.text, fontSize: s.fontSize, fontWeight: '600' }, icon && { marginLeft: 8 }]}>{title}</Text>
          {iconRight}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.borderRadius,
  },
  textPrimary: {
    color: '#fff',
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
});
