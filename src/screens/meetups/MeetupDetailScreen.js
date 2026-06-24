import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Share,
  Linking, Dimensions, ActivityIndicator, FlatList
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import meetupService from '../../services/meetup.service';
import { getMeetupImages, DEFAULT_MEETUP_IMAGE } from '../../utils/meetupHelpers';
import useAuthStore from '../../store/authStore';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Badge from '../../components/ui/Badge';
import { Divider, InfoRow } from '../../components/shared/CommonUI';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HEADER_IMAGE_HEIGHT = 280;

const CATEGORY_COLORS = {
  career: { bg: '#e0f2fe', text: '#0369a1' },
  business: { bg: '#f3e8ff', text: '#6b21a8' },
  community: { bg: '#dcfce7', text: '#15803d' },
  educational: { bg: '#ffedd5', text: '#c2410c' },
  health: { bg: '#ccfbf1', text: '#0f766e' },
  social: { bg: '#fce7f3', text: '#be185d' },
  other: { bg: '#f3f4f6', text: '#374151' },
};

export default function MeetupDetailScreen({ route, navigation }) {
  const { meetupId } = route.params;
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const [meetup, setMeetup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const scrollY = useSharedValue(0);

  const fetchMeetup = useCallback(async () => {
    try {
      setLoading(true);
      const data = await meetupService.getById(meetupId);
      setMeetup(data);
    } catch (err) {
      console.log('Error loading meetup details:', err);
      Toast.show({
        type: 'error',
        text1: 'Error loading meetup',
        text2: err.message || 'Please try again later',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [meetupId, navigation]);

  useEffect(() => {
    fetchMeetup();
  }, [fetchMeetup]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handleShare = async () => {
    if (!meetup) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await Share.share({
        title: meetup.title,
        message: `Join the meetup: "${meetup.title}"!\nDate: ${formatDate(meetup.startDate)}\nLocation: ${meetup.location?.name || meetup.location?.address || 'PG Community'}\n\nShared via PGinfo.online`,
      });
    } catch (err) {
      console.log(err);
    }
  };

  const handleOpenMap = () => {
    if (!meetup?.location?.mapsLink) {
      Toast.show({
        type: 'info',
        text1: 'Map link not available',
      });
      return;
    }
    Linking.openURL(meetup.location.mapsLink).catch(() => {
      Toast.show({
        type: 'error',
        text1: 'Failed to open maps',
      });
    });
  };

  const handleRSVP = async (status) => {
    if (rsvpLoading || !meetup) return;
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setRsvpLoading(true);
      const res = await meetupService.rsvp(meetup._id, status);
      setMeetup((prev) => ({
        ...prev,
        rsvpList: res.rsvpList,
      }));
      Toast.show({
        type: 'success',
        text1: 'RSVP updated!',
      });
    } catch (err) {
      console.log('RSVP error:', err);
      Toast.show({
        type: 'error',
        text1: 'Failed to update RSVP',
        text2: err.message,
      });
    } finally {
      setRsvpLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Determine current user's RSVP status
  const userRsvp = meetup?.rsvpList?.find(
    (r) => (r.user._id || r.user) === user?._id
  );
  const isInterested = userRsvp?.status === 'interested';
  const isGoing = userRsvp?.status === 'going';

  // Count RSVPs
  const interestedCount = meetup?.rsvpList?.filter((r) => r.status === 'interested').length || 0;
  const goingCount = meetup?.rsvpList?.filter((r) => r.status === 'going').length || 0;

  // Animated styles for header overlay
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [-HEADER_IMAGE_HEIGHT, 0, HEADER_IMAGE_HEIGHT],
      [-HEADER_IMAGE_HEIGHT / 2, 0, HEADER_IMAGE_HEIGHT * 0.8],
      Extrapolation.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [-HEADER_IMAGE_HEIGHT, 0],
      [2, 1],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }, { scale }],
    };
  });

  const headerBgAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HEADER_IMAGE_HEIGHT - 120, HEADER_IMAGE_HEIGHT - 60],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  const galleryImages = useMemo(() => (meetup ? getMeetupImages(meetup) : []), [meetup]);
  const hasGallery = galleryImages.length > 0;

  const renderGalleryItem = useCallback(({ item }) => (
    <Image
      source={{ uri: item.url }}
      style={styles.heroImage}
      contentFit="cover"
      placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
      transition={250}
      accessibilityLabel="Meetup photo"
    />
  ), []);

  const onGalleryScroll = useCallback((event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveImageIndex(index);
  }, []);

  if (loading || !meetup) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <ScreenHeader onBack={() => navigation.goBack()} title="Meetup Details" />
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </View>
    );
  }

  const categoryStyle = CATEGORY_COLORS[meetup.category] || CATEGORY_COLORS.other;

  return (
    <View style={styles.container}>
      {/* Floating Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <Animated.View style={[StyleSheet.absoluteFillObject, styles.headerBg, headerBgAnimatedStyle]} />
        <View style={styles.headerInner}>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {meetup.title}
          </Text>
          <TouchableOpacity
            style={styles.circleBtn}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Ionicons name="share-social-outline" size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Banner Hero / Gallery */}
        <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
          {hasGallery && galleryImages.length > 1 ? (
            <>
              <FlatList
                data={galleryImages}
                renderItem={renderGalleryItem}
                keyExtractor={(item, index) => item.publicId || item.url || String(index)}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onGalleryScroll}
                bounces={false}
                accessibilityLabel="Meetup photo gallery"
              />
              <View style={styles.galleryDots} pointerEvents="none">
                {galleryImages.map((_, idx) => (
                  <View
                    key={idx}
                    style={[styles.galleryDot, idx === activeImageIndex && styles.galleryDotActive]}
                  />
                ))}
              </View>
            </>
          ) : (
            <Image
              source={{ uri: hasGallery ? galleryImages[0].url : DEFAULT_MEETUP_IMAGE }}
              style={styles.heroImage}
              contentFit="cover"
              placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
              transition={250}
              accessibilityLabel="Meetup cover photo"
            />
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
            style={StyleSheet.absoluteFillObject}
            pointerEvents="none"
          />
        </Animated.View>

        {/* Content Details */}
        <View style={styles.content}>
          <View style={styles.metaRow}>
            <View style={[styles.categoryChip, { backgroundColor: categoryStyle.bg }]}>
              <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
                {meetup.category ? meetup.category.toUpperCase() : 'EVENT'}
              </Text>
            </View>
            <Text style={styles.viewsCount}>
              <Ionicons name="eye-outline" size={14} color={colors.textMuted} />
              {' '}{meetup.analytics?.views || 0} views
            </Text>
          </View>

          <Text style={styles.title}>{meetup.title}</Text>

          <View style={styles.rsvpStats}>
            <Text style={styles.rsvpStatText}>
              <Text style={styles.rsvpStatNum}>{goingCount}</Text> Going
            </Text>
            <View style={styles.rsvpStatDot} />
            <Text style={styles.rsvpStatText}>
              <Text style={styles.rsvpStatNum}>{interestedCount}</Text> Interested
            </Text>
          </View>

          <Divider />

          {/* Time & Date */}
          <View style={styles.infoSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="calendar" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(meetup.startDate)}</Text>
              {meetup.startTime && (
                <Text style={styles.infoSubValue}>
                  {meetup.startTime} {meetup.endTime ? `to ${meetup.endTime}` : ''}
                </Text>
              )}
            </View>
          </View>

          {/* Location */}
          <View style={styles.infoSection}>
            <View style={styles.iconCircle}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{meetup.location?.name || 'PG Venue'}</Text>
              {meetup.location?.address && (
                <Text style={styles.infoSubValue}>{meetup.location.address}</Text>
              )}
              {meetup.location?.mapsLink && (
                <TouchableOpacity onPress={handleOpenMap} style={styles.mapLinkBtn}>
                  <Text style={styles.mapLinkText}>View on Map</Text>
                  <Ionicons name="open-outline" size={12} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Organizer */}
          {meetup.organizer && (
            <View style={styles.infoSection}>
              <View style={styles.iconCircle}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={styles.infoTextContainer}>
                <Text style={styles.infoLabel}>Organizer</Text>
                <Text style={styles.infoValue}>{meetup.organizer.name || 'PG Owner'}</Text>
                {meetup.organizer.contact && (
                  <Text style={styles.infoSubValue}>{meetup.organizer.contact}</Text>
                )}
                {meetup.organizer.pg && (
                  <Text style={styles.infoSubValue}>PG: {meetup.organizer.pg.name}</Text>
                )}
              </View>
            </View>
          )}

          <Divider />

          {/* About Event */}
          <View style={styles.aboutSection}>
            <Text style={styles.aboutTitle}>About Event</Text>
            <Text style={styles.aboutText}>
              {meetup.description || 'No description provided.'}
            </Text>
          </View>

          {/* Tags */}
          {meetup.tags && meetup.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {meetup.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>

      {/* RSVP Action Footer */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.footerInner}>
          <TouchableOpacity
            style={[
              styles.rsvpBtn,
              styles.interestedBtn,
              isInterested && styles.interestedBtnActive
            ]}
            onPress={() => handleRSVP('interested')}
            disabled={rsvpLoading}
          >
            {rsvpLoading ? (
              <ActivityIndicator size="small" color={isInterested ? '#fff' : colors.primary} />
            ) : (
              <>
                <Ionicons
                  name={isInterested ? "star" : "star-outline"}
                  size={18}
                  color={isInterested ? '#fff' : colors.primary}
                />
                <Text style={[styles.rsvpBtnText, isInterested && styles.rsvpBtnTextActive]}>
                  Interested
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.rsvpBtn,
              styles.goingBtn,
              isGoing && styles.goingBtnActive
            ]}
            onPress={() => handleRSVP('going')}
            disabled={rsvpLoading}
          >
            {rsvpLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons
                  name={isGoing ? "checkmark-circle" : "checkmark-circle-outline"}
                  size={18}
                  color="#fff"
                />
                <Text style={styles.rsvpBtnTextGoing}>
                  {isGoing ? 'Going!' : 'Mark Going'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  headerContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    zIndex: 10,
  },
  headerBg: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 4,
  },
  circleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: HEADER_IMAGE_HEIGHT,
    overflow: 'hidden',
  },
  heroImage: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  galleryDots: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  galleryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  galleryDotActive: {
    backgroundColor: '#ffffff',
    width: 18,
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  viewsCount: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
    lineHeight: 30,
    marginBottom: 10,
  },
  rsvpStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rsvpStatText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  rsvpStatNum: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rsvpStatDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.textMuted,
    marginHorizontal: 10,
  },
  infoSection: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'flex-start',
    gap: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextContainer: {
    flex: 1,
    gap: 2,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  infoSubValue: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  mapLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  mapLinkText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },
  aboutSection: {
    marginVertical: 10,
  },
  aboutTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  tag: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 12,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  footerInner: {
    flexDirection: 'row',
    gap: 12,
  },
  rsvpBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    gap: 6,
  },
  interestedBtn: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: '#ffffff',
  },
  interestedBtnActive: {
    backgroundColor: colors.primary,
  },
  goingBtn: {
    backgroundColor: colors.primary,
  },
  goingBtnActive: {
    backgroundColor: colors.primaryDark,
  },
  rsvpBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  rsvpBtnTextActive: {
    color: '#ffffff',
  },
  rsvpBtnTextGoing: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
