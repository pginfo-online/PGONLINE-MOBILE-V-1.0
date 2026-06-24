import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import ScreenHeader from '../../components/layout/ScreenHeader';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

export default function TermsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScreenHeader title="Terms of Service" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.lastUpdated}>Last Updated: June 23, 2026</Text>

        <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
        <Text style={styles.paragraph}>
          These Terms of Service constitute a legally binding agreement made between you, whether personally or on behalf of an entity, and PGinfo.online, concerning your access to and use of our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>2. User Account</Text>
        <Text style={styles.paragraph}>
          To access certain features of the App, you may be required to register for an account. You agree to keep your password confidential and will be responsible for all use of your account and password. We reserve the right to remove, reclaim, or change a username you select if we determine it is inappropriate.
        </Text>

        <Text style={styles.sectionTitle}>3. Prohibited Activities</Text>
        <Text style={styles.paragraph}>
          You may not access or use the App for any purpose other than that for which we make the App available. The App may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
        </Text>
        <Text style={styles.paragraph}>
          Prohibited activity includes, but is not limited to: uploading inaccurate PG details, spamming other users, hosting fraudulent meetups, and bypassing authentication mechanisms.
        </Text>

        <Text style={styles.sectionTitle}>4. Meetup Guidelines</Text>
        <Text style={styles.paragraph}>
          When participating in meetups (either creating or RSVPing), you agree to act respectfully toward other participants. PGinfo.online acts as a facilitator and does not take responsibility for the actions of users at physical meetup events. Please exercise caution and common sense.
        </Text>

        <Text style={styles.sectionTitle}>5. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, loss of data, or other damages arising from your use of the App.
        </Text>

        <Text style={styles.sectionTitle}>6. Term and Termination</Text>
        <Text style={styles.paragraph}>
          These Terms of Service shall remain in full force and effect while you use the App. Without limiting any other provision of these terms, we reserve the right to, in our sole discretion and without notice or liability, deny access to and use of the App to any person for any reason.
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
  paragraph: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
});
