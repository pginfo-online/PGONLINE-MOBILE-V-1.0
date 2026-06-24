import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import meetupService from '../../services/meetup.service';
import { getMeetupCoverUrl, DEFAULT_MEETUP_IMAGE } from '../../utils/meetupHelpers';
import useAuthStore from '../../store/authStore';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/shared/EmptyState';

const CATEGORY_COLORS = {
  career: { bg: '#e0f2fe', text: '#0369a1' },
  business: { bg: '#f3e8ff', text: '#6b21a8' },
  community: { bg: '#dcfce7', text: '#15803d' },
  educational: { bg: '#ffedd5', text: '#c2410c' },
  health: { bg: '#ccfbf1', text: '#0f766e' },
  social: { bg: '#fce7f3', text: '#be185d' },
  other: { bg: '#f3f4f6', text: '#374151' },
};

const TABS = ['All', 'Going', 'Interested'];

export default function MyMeetupsScreen({ navigation }) {
  const { user } = useAuthStore();
  const [meetups, setMeetups] = useState([]);
  const [filteredMeetups, setFilteredMeetups] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRSVPedMeetups = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      // Fetch all published meetups
      const { meetups: allMeetups } = await meetupService.getAll({ limit: 100 });
      
      // Filter those where the current user has RSVPed
      const rsvped = (allMeetups || []).filter((meetup) => {
        return meetup.rsvpList?.some(
          (rsvp) => (rsvp.user._id || rsvp.user) === user?._id
        );
      });

      setMeetups(rsvped);
    } catch (err) {
      console.log('Error fetching RSVPs:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to load meetups',
        text2: err.message,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?._id]);

  useEffect(() => {
    fetchRSVPedMeetups();
  }, [fetchRSVPedMeetups]);

  useEffect(() => {
    if (activeTab === 'All') {
      setFilteredMeetups(meetups);
    } else {
      const statusToFilter = activeTab.toLowerCase(); // 'going' or 'interested'
      const filtered = meetups.filter((meetup) => {
        const userRsvp = meetup.rsvpList?.find(
          (r) => (r.user._id || r.user) === user?._id
        );
        return userRsvp?.status === statusToFilter;
      });
      setFilteredMeetups(filtered);
    }
  }, [activeTab, meetups, user?._id]);

  const handleRefresh = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchRSVPedMeetups(true);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderMeetupItem = ({ item: meetup }) => {
    const userRsvp = meetup.rsvpList?.find(
      (r) => (r.user._id || r.user) === user?._id
    );
    const isGoing = userRsvp?.status === 'going';
    const categoryStyle = CATEGORY_COLORS[meetup.category] || CATEGORY_COLORS.other;

    return (
      <TouchableOpacity
        style={styles.meetupCard}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('MeetupDetail', { meetupId: meetup._id })}
      >
        <Image
          source={{ uri: getMeetupCoverUrl(meetup) || DEFAULT_MEETUP_IMAGE }}
          style={styles.cardImage}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={200}
        />
        
        <View style={styles.cardInfo}>
          <View style={styles.badgeRow}>
            <View style={[styles.categoryChip, { backgroundColor: categoryStyle.bg }]}>
              <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
                {meetup.category ? meetup.category.toUpperCase() : 'EVENT'}
              </Text>
            </View>
            <Badge
              text={isGoing ? 'Going' : 'Interested'}
              variant={isGoing ? 'success' : 'info'}
              icon={
                <Ionicons
                  name={isGoing ? 'checkmark-circle' : 'star'}
                  size={12}
                  color="#fff"
                />
              }
            />
          </View>

          <Text style={styles.title} numberOfLines={1}>
            {meetup.title}
          </Text>

          <Text style={styles.date} numberOfLines={1}>
            <Ionicons name="calendar-outline" size={13} color={colors.textMuted} />
            {' '}{formatDate(meetup.startDate)}
          </Text>

          <Text style={styles.location} numberOfLines={1}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            {' '}{meetup.location?.name || meetup.location?.city || 'PG Community'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="My RSVPs" onBack={() => navigation.goBack()} />

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              Haptics.selectionAsync();
              setActiveTab(tab);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Main List */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredMeetups}
          renderItem={renderMeetupItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="calendar-outline"
              title="No Meetups Found"
              description={
                activeTab === 'All'
                  ? "You haven't RSVPed to any meetups yet. Go to Home to find community events!"
                  : `You have no meetups marked as "${activeTab}".`
              }
              actionText={activeTab === 'All' ? 'Explore Events' : null}
              onAction={activeTab === 'All' ? () => navigation.navigate('Home') : null}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: spacing.screenPadding,
    gap: 12,
  },
  meetupCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardImage: {
    width: 100,
    height: 108,
  },
  cardInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
    gap: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 8,
    fontWeight: '800',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  location: {
    fontSize: 12,
    color: colors.textMuted,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
