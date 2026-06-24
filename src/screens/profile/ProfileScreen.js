import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import useAuthStore from '../../store/authStore';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';

export default function ProfileScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
   // Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    logout();
  };

  const handleShareApp = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      await Share.share({
        title: 'PGinfo.online',
        message: 'Find verified, premium PGs with zero brokerage and amazing amenities at PGinfo.online. Download the app today!',
      });
    } catch (err) {
      console.log(err);
    }
  };

  const ProfileOptionRow = ({ icon, label, value, onPress, isDestructive = false, isLast = false }) => (
    <TouchableOpacity
      style={[styles.optionRow, isLast && styles.optionRowLast]}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      activeOpacity={0.6}
    >
      <View style={styles.optionLeft}>
        <View style={[styles.iconContainer, isDestructive && styles.iconContainerDestructive]}>
          <Ionicons
            name={icon}
            size={18}
            color={isDestructive ? colors.error : colors.primary}
          />
        </View>
        <Text style={[styles.optionLabel, isDestructive && styles.optionLabelDestructive]}>
          {label}
        </Text>
      </View>
      <View style={styles.optionRight}>
        {value && <Text style={styles.optionValue}>{value}</Text>}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={isDestructive ? colors.error : colors.textMuted}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScreenHeader title="Profile" />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info Header */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <Avatar name={user?.name} size="xl" />
            <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8} onPress={() => Toast.show({ type: 'info', text1: 'Edit profile coming soon' })}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user?.name || 'User Account'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              {user?.role ? user.role.toUpperCase() : 'TENANT'}
            </Text>
          </View>
        </View>

        {/* My Activity Section */}
        <Text style={styles.sectionHeader}>My Activity</Text>
        <View style={styles.optionsBlock}>
          <ProfileOptionRow
            icon="heart-outline"
            label="My Wishlist"
            onPress={() => navigation.navigate('Wishlist')}
          />
          <ProfileOptionRow
            icon="calendar-outline"
            label="My Visits"
            onPress={() => navigation.navigate('Visits')}
          />
          <ProfileOptionRow
            icon="sparkles-outline"
            label="AI Search Chat"
            onPress={() => navigation.navigate('AIChat')}
            isLast={true}
          />
        </View>

        {/* Meetups Section */}
        <Text style={styles.sectionHeader}>Meetups & Community</Text>
        <View style={styles.optionsBlock}>
          <ProfileOptionRow
            icon="people-outline"
            label="My RSVPs"
            onPress={() => navigation.navigate('MyMeetups')}
            isLast={true}
          />
        </View>

        {/* Settings & Info Section */}
        <Text style={styles.sectionHeader}>Settings & Preferences</Text>
        <View style={styles.optionsBlock}>
          <ProfileOptionRow
            icon="person-circle-outline"
            label="Edit Profile"
            onPress={() => Toast.show({ type: 'info', text1: 'Profile editing is coming soon' })}
          />
          <ProfileOptionRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => Toast.show({ type: 'info', text1: 'Notification settings coming soon' })}
            isLast={true}
          />
        </View>

        {/* Legal & Support Section */}
        <Text style={styles.sectionHeader}>Legal & Support</Text>
        <View style={styles.optionsBlock}>
          <ProfileOptionRow
            icon="headset-outline"
            label="Help & Support"
            onPress={() => navigation.navigate('Support')}
          />
          <ProfileOptionRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <ProfileOptionRow
            icon="document-text-outline"
            label="Terms of Service"
            onPress={() => navigation.navigate('Terms')}
            isLast={true}
          />
        </View>

        {/* App Actions Section */}
        <Text style={styles.sectionHeader}>App Actions</Text>
        <View style={styles.optionsBlock}>
          <ProfileOptionRow
            icon="share-social-outline"
            label="Share App"
            onPress={handleShareApp}
          />
          <ProfileOptionRow
            icon="log-out-outline"
            label="Log Out"
            onPress={handleLogout}
            isDestructive={true}
            isLast={true}
          />
        </View>

        <Text style={styles.versionText}>PGinfo.online v1.0.0 (Expo Dev)</Text>
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
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 14,
  },
  email: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight + '15',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  optionsBlock: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  optionRowLast: {
    borderBottomWidth: 0,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainerDestructive: {
    backgroundColor: '#fee2e2',
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  optionLabelDestructive: {
    color: colors.error,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  optionValue: {
    fontSize: 13,
    color: colors.textMuted,
  },
  versionText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 32,
    marginBottom: 10,
  },
});
