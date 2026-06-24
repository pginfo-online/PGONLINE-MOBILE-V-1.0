import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import colors from '../../theme/colors';
import meetupService from '../../services/meetup.service';
import { getMeetupCoverUrl, DEFAULT_MEETUP_IMAGE } from '../../utils/meetupHelpers';
import { Skeleton } from '../ui/Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 56; // leaves a peek of the next card
const CARD_GAP = 14;
const CAROUSEL_HEIGHT = 188;
const AUTO_PLAY_INTERVAL = 4000;

const CATEGORY_COLORS = {
  career: { bg: '#e0f2fe', text: '#0369a1' },
  business: { bg: '#f3e8ff', text: '#6b21a8' },
  community: { bg: '#dcfce7', text: '#15803d' },
  educational: { bg: '#ffedd5', text: '#c2410c' },
  health: { bg: '#ccfbf1', text: '#0f766e' },
  social: { bg: '#fce7f3', text: '#be185d' },
  other: { bg: '#f3f4f6', text: '#374151' },
};

function MeetupsCarousel({ navigation }) {
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const flatListRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const isUserInteractingRef = useRef(false);

  const fetchUpcomingMeetups = async () => {
    try {
      setLoading(true);
      const data = await meetupService.getUpcoming();
      setMeetups(data || []);
    } catch (err) {
      console.log('Error fetching upcoming meetups for carousel:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingMeetups();
  }, []);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  }, []);

  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    if (meetups.length <= 1) return;

    autoPlayTimerRef.current = setInterval(() => {
      if (isUserInteractingRef.current) return;

      setActiveIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % meetups.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_PLAY_INTERVAL);
  }, [meetups.length, stopAutoPlay]);

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, [startAutoPlay, stopAutoPlay]);

  const handleScroll = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CAROUSEL_ITEM_WIDTH + CARD_GAP));
    setActiveIndex(index);
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    isUserInteractingRef.current = true;
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handleScrollEndDrag = useCallback(() => {
    isUserInteractingRef.current = false;
    startAutoPlay();
  }, [startAutoPlay]);

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

  const renderItem = useCallback(({ item: meetup }) => {
    const categoryStyle = CATEGORY_COLORS[meetup.category] || CATEGORY_COLORS.other;

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={0.95}
        onPress={() => navigation.navigate('MeetupDetail', { meetupId: meetup._id })}
        accessibilityRole="button"
        accessibilityLabel={`${meetup.title}, ${formatDate(meetup.startDate)}`}
      >
        <Image
          source={{ uri: getMeetupCoverUrl(meetup) || DEFAULT_MEETUP_IMAGE }}
          style={styles.bannerImage}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={250}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.05)', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.92)']}
          locations={[0, 0.45, 1]}
          style={styles.gradientOverlay}
        />

        <View style={styles.cardHeader}>
          <View style={[styles.categoryChip, { backgroundColor: categoryStyle.bg }]}>
            <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
              {meetup.category ? meetup.category.toUpperCase() : 'EVENT'}
            </Text>
          </View>
          <View style={styles.liveBadge}>
            <Ionicons name="people" size={11} color="#fff" />
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={12} color="#38bdf8" />
            <Text style={styles.dateText} numberOfLines={1}>
              {formatDate(meetup.startDate)}
            </Text>
          </View>
          <Text style={styles.titleText} numberOfLines={2}>
            {meetup.title}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.75)" />
            <Text style={styles.locationText} numberOfLines={1}>
              {meetup.location?.name || meetup.location?.city || 'PG Community'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [navigation]);

  const keyExtractor = useCallback((item) => item._id, []);

  const getItemLayout = useCallback((_, index) => ({
    length: CAROUSEL_ITEM_WIDTH + CARD_GAP,
    offset: (CAROUSEL_ITEM_WIDTH + CARD_GAP) * index,
    index,
  }), []);

  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonHeader}>
          <Skeleton width="44%" height={20} borderRadius={6} />
          <Skeleton width="22%" height={16} borderRadius={6} />
        </View>
        <Skeleton width={CAROUSEL_ITEM_WIDTH} height={CAROUSEL_HEIGHT} borderRadius={20} style={{ marginLeft: 20 }} />
      </View>
    );
  }

  if (meetups.length === 0) {
    return null; // Don't show carousel if no upcoming meetups
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Upcoming Meetups</Text>
          <Text style={styles.sectionSubtitle}>Connect with your community</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('MyMeetups')}
          activeOpacity={0.7}
          style={styles.seeAllBtn}
        >
          <Text style={styles.seeAllText}>My RSVPs</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={meetups}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CAROUSEL_ITEM_WIDTH + CARD_GAP}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        getItemLayout={getItemLayout}
        bounces={false}
        removeClippedSubviews={Platform.OS !== 'web'}
        initialNumToRender={3}
        windowSize={3}
      />

      {meetups.length > 1 && (
        <View style={styles.indicatorContainer}>
          {meetups.map((_, i) => (
            <View
              key={i}
              style={[
                styles.indicatorDot,
                activeIndex === i ? styles.indicatorDotActive : null,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingTop: 4,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: 20,
    gap: CARD_GAP,
  },
  cardContainer: {
    width: CAROUSEL_ITEM_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  cardHeader: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    gap: 5,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  titleText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 23,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  locationText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  indicatorDotActive: {
    width: 16,
    backgroundColor: colors.primary,
  },
  skeletonContainer: {
    marginVertical: 16,
    gap: 10,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
});

export default memo(MeetupsCarousel);