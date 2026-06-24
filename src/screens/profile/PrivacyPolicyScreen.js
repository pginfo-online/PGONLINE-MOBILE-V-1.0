import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from '../../components/layout/ScreenHeader';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Privacy Policy" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: June 23, 2026</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to PGinfo.online. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect personal information that you voluntarily provide to us when registering at the App, expressing an interest in obtaining information about us or our products and services, or participating in activities on the App (such as hosting or attending meetups, wishlist actions, or booking visits).
        </Text>

        <Text style={styles.subSectionTitle}>• Personal Data</Text>
        <Text style={styles.paragraph}>
          This may include your name, email address, telephone number, user role (Tenant, Owner, Admin), and authentication credentials.
        </Text>

        <Text style={styles.subSectionTitle}>• Usage and Device Information</Text>
        <Text style={styles.paragraph}>
          We automatically collect certain information when you visit, use, or navigate the App. This information does not reveal your specific identity but may include device and usage information, such as IP address, browser and device characteristics, operating system, and system activity.
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use personal information collected via our App for a variety of business purposes described below:
        </Text>
        <Text style={styles.bulletItem}>• To facilitate account creation and logon process.</Text>
        <Text style={styles.bulletItem}>• To post and manage PG listings and community meetups.</Text>
        <Text style={styles.bulletItem}>• To send administrative information to you.</Text>
        <Text style={styles.bulletItem}>• To connect tenant leads with PG owners.</Text>
        <Text style={styles.bulletItem}>• To manage RSVPs and coordinate event logistics.</Text>

        <Text style={styles.sectionTitle}>4. Sharing Your Information</Text>
        <Text style={styles.paragraph}>
          We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. For instance, when you express interest in a PG, your contact information is shared with the respective owner to facilitate booking.
        </Text>

        <Text style={styles.sectionTitle}>5. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions or comments about this policy, you may email us at support@pginfo.online or reach out via the Support tab in the App.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.screenPadding,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 20,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 20,
    marginBottom: 8,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginTop: 10,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletItem: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginLeft: 12,
    marginBottom: 6,
  },
});
