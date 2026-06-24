import React from 'react';
import { View, TouchableOpacity, Text, Linking, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

/**
 * ContactActions — WhatsApp + Call + Visit buttons for PG detail
 * @param {string} phone - Contact phone number
 * @param {string} whatsapp - WhatsApp number (defaults to phone)
 * @param {string} pgId - PG ID for visit booking
 * @param {function} onBookVisit - Navigate to visit booking
 */
export default function ContactActions({ phone, whatsapp, onBookVisit, style }) {
  const wp = whatsapp || phone;

  const handleCall = () => {
    const url = `tel:+91${phone}`;
    Linking.canOpenURL(url).then((can) => {
      if (can) Linking.openURL(url);
      else Alert.alert('Error', 'Cannot make a call from this device');
    });
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/91${wp}?text=Hi, I found your PG on PGinfo.online. I am interested in visiting.`;
    Linking.canOpenURL(url).then((can) => {
      if (can) Linking.openURL(url);
      else Alert.alert('WhatsApp not installed', 'Please install WhatsApp to use this feature.');
    });
  };

  return (
    <View style={[styles.container, style]}>
      {/* WhatsApp CTA */}
      <TouchableOpacity style={[styles.btn, styles.whatsapp]} onPress={handleWhatsApp} activeOpacity={0.8}>
        <Ionicons name="logo-whatsapp" size={22} color="#fff" />
        <Text style={styles.btnText}>WhatsApp</Text>
      </TouchableOpacity>

      {/* Call CTA */}
      <TouchableOpacity style={[styles.btn, styles.call]} onPress={handleCall} activeOpacity={0.8}>
        <Ionicons name="call-outline" size={22} color="#fff" />
        <Text style={styles.btnText}>Call Now</Text>
      </TouchableOpacity>

      {/* Book Visit */}
      {onBookVisit && (
        <TouchableOpacity style={[styles.btn, styles.visit]} onPress={onBookVisit} activeOpacity={0.8}>
          <Ionicons name="calendar-outline" size={22} color={colors.primary} />
          <Text style={[styles.btnText, { color: colors.primary }]}>Book Visit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 12,
  },
  btnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  whatsapp: { backgroundColor: '#25D366' },
  call: { backgroundColor: colors.primary },
  visit: {
    backgroundColor: '#ede9fe',
    borderWidth: 1.5, borderColor: colors.primary,
  },
});
