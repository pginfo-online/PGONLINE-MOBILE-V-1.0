import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import ScreenHeader from '../../components/layout/ScreenHeader';

const SUPPORT_PHONE = '9545351234';
const SUPPORT_EMAIL = 'support@pg.online';
const WHATSAPP_MESSAGE = 'Hi, I need support with the PG App.';

const FAQS = [
  {
    q: 'How do I book a visit?',
    a: "Navigate to a PG detail page and click 'Book Visit'. Select your preferred date and time, and the owner will confirm it.",
  },
  {
    q: 'Are the PGs verified?',
    a: "We personally visit and verify properties marked with the blue 'Verified' badge to ensure they match the photos and amenities listed.",
  },
  {
    q: 'How do I contact the PG owner?',
    a: "Once you shortlist or book a visit for a PG, you will be able to see the owner's contact details in your 'Visits' tab.",
  },
  {
    q: 'Can I cancel my visit?',
    a: "Yes, you can easily cancel or reschedule your visit from the 'Visits' tab in the app up to 2 hours before the scheduled time.",
  },
];

export default function SupportScreen() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleAction = async (type) => {
    let url = '';

    switch (type) {
      case 'whatsapp':
        url = `whatsapp://send?phone=${SUPPORT_PHONE}&text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
        break;
      case 'email':
        url = `mailto:${SUPPORT_EMAIL}?subject=PG App Support`;
        break;
      case 'call':
        url = `tel:${SUPPORT_PHONE}`;
        break;
    }

    try {
      if (type === 'call') {
        // Direct handling for dialer fallback transparency
        await Linking.openURL(url);
        return;
      }

      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'App Not Installed',
          `Could not open ${type === 'whatsapp' ? 'WhatsApp' : 'Email'}. Please ensure the app is configured on your device.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Support Interaction Error:', error);
      Alert.alert('Error', 'Unable to initiate connection. Please try again.');
    }



  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Support" subtitle="We're here to help you 24/7" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Support Person Profile */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={64} color={colors.primary} />
            <View style={styles.onlineBadge} />
          </View>
          <Text style={styles.profileName}>Priya Sharma</Text>
          <Text style={styles.profileRole}>Senior Support Specialist</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Available now</Text>
          </View>
        </View>

        {/* Contact Cards */}
        <Text style={styles.sectionTitle}>Get in touch</Text>
        <View style={styles.cardsContainer}>
          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.7}
            onPress={() => handleAction('whatsapp')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#e8f9ed' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>WhatsApp Chat</Text>
              <Text style={styles.cardSubtitle}>Quick replies within minutes</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.7}
            onPress={() => handleAction('call')}
          >
            <View style={[styles.cardIcon, { backgroundColor: colors.infoBg }]}>
              <Ionicons name="call" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Call us</Text>
              <Text style={styles.cardSubtitle}>+91 {SUPPORT_PHONE}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactCard}
            activeOpacity={0.7}
            onPress={() => handleAction('email')}
          >
            <View style={[styles.cardIcon, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="mail" size={24} color={colors.error} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Email support</Text>
              <Text style={styles.cardSubtitle}>Replies within 24 hours</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqContainer}>
          {FAQS.map((faq, index) => {
            const isExpanded = expandedFaq === index;
            return (
              <View key={index} style={styles.faqItem}>
                <TouchableOpacity
                  style={styles.faqQuestion}
                  onPress={() => toggleFaq(index)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.faqQuestionText,
                      isExpanded && styles.faqQuestionActive,
                    ]}
                  >
                    {faq.q}
                  </Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={isExpanded ? colors.primary : colors.textMuted}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.a}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPadding,
    paddingBottom: 40,
  },
  /* ---------- Profile Card ---------- */
  profileCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 14,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 10,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.success,
  },
  /* ---------- Section Titles ---------- */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  /* ---------- Contact Cards ---------- */
  cardsContainer: {
    gap: 12,
    marginBottom: 36,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textMuted,
  },
  /* ---------- FAQ ---------- */
  faqContainer: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 12,
  },
  faqQuestionActive: {
    color: colors.primary,
  },
  faqAnswer: {
    paddingHorizontal: 18,
    paddingBottom: 18,
  },
  faqAnswerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});