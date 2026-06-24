import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Linking, Alert, Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import ScreenHeader from '../../components/layout/ScreenHeader';

// Dummy support details — replace with real ones later
const SUPPORT_PHONE = '+919999999999';
const SUPPORT_EMAIL = 'support@worknai.com';
const WHATSAPP_MESSAGE = 'Hi, I need support with the PG App.';

const FAQS = [
  {
    q: "How do I book a visit?",
    a: "Navigate to a PG detail page and click 'Book Visit'. Select your preferred date and time, and the owner will confirm it.",
  },
  {
    q: "Are the PGs verified?",
    a: "We personally visit and verify properties marked with the blue 'Verified' badge to ensure they match the photos and amenities listed.",
  },
  {
    q: "How do I contact the PG owner?",
    a: "Once you shortlist or book a visit for a PG, you will be able to see the owner's contact details in your 'Visits' tab.",
  },
  {
    q: "Can I cancel my visit?",
    a: "Yes, you can easily cancel or reschedule your visit from the 'Visits' tab in the app up to 2 hours before the scheduled time.",
  }
];

export default function SupportScreen() {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const handleAction = async (type) => {
    Haptics.selectionAsync();
    
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
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'App Not Installed',
          `Could not open ${type}. Make sure you have the required app installed.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('An error occurred', error);
      Alert.alert('Error', 'Something went wrong while trying to open the app.');
    }
  };

  const toggleFaq = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Support" subtitle="We're here to help you 24/7" />

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Contact Cards */}
        <View style={styles.cardsContainer}>
          <TouchableOpacity 
            style={[styles.contactCard, { borderColor: '#25D366' }]} 
            activeOpacity={0.8}
            onPress={() => handleAction('whatsapp')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#e8f9ed' }]}>
              <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Chat on WhatsApp</Text>
              <Text style={styles.cardSubtitle}>Usually replies instantly</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.contactCard, { borderColor: colors.primary }]} 
            activeOpacity={0.8}
            onPress={() => handleAction('call')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: colors.surfaceAlt }]}>
              <Ionicons name="call" size={24} color={colors.primary} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Call Us Directly</Text>
              <Text style={styles.cardSubtitle}>Available 9 AM to 9 PM</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.contactCard} 
            activeOpacity={0.8}
            onPress={() => handleAction('email')}
          >
            <View style={[styles.iconWrapper, { backgroundColor: '#fef2f2' }]}>
              <Ionicons name="mail" size={24} color={colors.error} />
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardTitle}>Send an Email</Text>
              <Text style={styles.cardSubtitle}>Expect a reply within 24 hours</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <Text style={styles.faqHeader}>Frequently Asked Questions</Text>
          
          <View style={styles.faqList}>
            {FAQS.map((faq, index) => {
              const isExpanded = expandedFaq === index;
              return (
                <View key={index} style={styles.faqItem}>
                  <TouchableOpacity 
                    style={styles.faqQuestion} 
                    onPress={() => toggleFaq(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.faqQuestionText, isExpanded && styles.faqQuestionActive]}>
                      {faq.q}
                    </Text>
                    <Ionicons 
                      name={isExpanded ? "chevron-up" : "chevron-down"} 
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
    padding: spacing.screenPadding,
    paddingBottom: 40,
  },
  cardsContainer: {
    marginTop: 10,
    gap: 12,
    marginBottom: 30,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
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
    color: colors.textMuted,
    fontWeight: '500',
  },
  faqSection: {
    marginTop: 10,
  },
  faqHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  faqList: {
    backgroundColor: colors.surface,
    borderRadius: 16,
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
    padding: 16,
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
    paddingRight: 16,
  },
  faqQuestionActive: {
    color: colors.primary,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
