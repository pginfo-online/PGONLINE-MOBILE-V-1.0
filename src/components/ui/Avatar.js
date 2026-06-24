import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import colors from '../../theme/colors';

/**
 * Avatar component with image or initials fallback
 * @param {string} uri - Image URI
 * @param {string} name - User name (for initials)
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} size
 * @param {string} color - Background color for initials
 */
export default function Avatar({ uri, name, size = 'md', color, style }) {
  const sizes = { xs: 28, sm: 36, md: 44, lg: 56, xl: 72 };
  const fontSizes = { xs: 11, sm: 13, md: 16, lg: 20, xl: 26 };
  const dim = sizes[size] || sizes.md;
  const fontSize = fontSizes[size] || fontSizes.md;

  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  const bgColor = color || colors.primary;

  return (
    <View
      style={[
        styles.container,
        { width: dim, height: dim, borderRadius: dim / 2, backgroundColor: bgColor },
        style,
      ]}
    >
      {uri ? (
        <Image source={{ uri }} style={{ width: dim, height: dim, borderRadius: dim / 2 }} />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  initials: { color: '#fff', fontWeight: '700' },
});
