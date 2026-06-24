import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { meetupService } from '../../services/meetup.service';
import { getMeetupCoverUrl, DEFAULT_MEETUP_IMAGE } from '../../utils/meetupHelpers';
import { Skeleton } from '../ui/Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CAROUSEL_ITEM_WIDTH = SCREEN_WIDTH - 32;
const CARD_GAP = 12;
const CAROUSEL_HEIGHT = 204;
const AUTO_PLAY_INTERVAL = 4500;

const CATEGORY_COLORS = {
  career: { bg: '#e0f2fe', text: '#0369a1' },
  business: { bg: '#f3e8ff', text: '#6b21a8' },
  community: { bg: '#dcfce7', text: '#15803d' },
  educational: { bg: '#ffedd5', text: '#c2410c' },
  health: { bg: '#ccfbf1', text: '#0f766e' },
  social: { bg: '#fce7f3', text: '#be185d' },
  other: { bg: '#f3f4f6', text: '#374151' },
};

const formatDate = (dateStr) => {
  if (!dateStr) return 'Date TBA';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return 'Date TBA';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const MeetupCard = memo(function MeetupCard({ meetup, navigation }) {
  const categoryStyle = CATEGORY_COLORS[meetup.category] || CATEGORY_COLORS.other;
  const venue = meetup.location?.name || meetup.location?.city || 'PG Community';

  return (
    <TouchableOpacity
      style={styles.cardContainer}
      activeOpacity={0.94}
      onPress={() => navigation.navigate('MeetupDetail', { meetupId: meetup._id })}
      accessibilityRole="button"
      accessibilityLabel={`${meetup.title}, ${formatDate(meetup.startDate)}`}
    >
      <Image
        source={{ uri: getMeetupCoverUrl(meetup) || DEFAULT_MEETUP_IMAGE }}
        style={styles.bannerImage}
        contentFit="cover"
        cachePolicy="memory-disk"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        transition={180}
      />
      <LinearGradient
        colors={['rgba(5,8,22,0.08)', 'rgba(5,8,22,0.22)', 'rgba(5,8,22,0.92)']}
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
          <Ionicons name="people" size={12} color="#fff" />
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.datePill}>
          <Ionicons name="calendar-outline" size={12} color="#bae6fd" />
          <Text style={styles.dateText} numberOfLines={1}>
            {formatDate(meetup.startDate)}
          </Text>
        </View>
        <Text style={styles.titleText} numberOfLines={2}>
          {meetup.title || 'Community meetup'}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={13} color="rgba(255,255,255,0.78)" />
          <Text style={styles.locationText} numberOfLines={1}>
            {venue}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

function MeetupsCarousel({ navigation }) {
  const [meetups, setMeetups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const flatListRef = useRef(null);
  const autoPlayTimerRef = useRef(null);
  const isUserInteractingRef = useRef(false);
  const hasContentRef = useRef(false);

  const fetchUpcomingMeetups = useCallback(async () => {
    try {
      if (!hasContentRef.current) setLoading(true);
      setError(null);
      const data = await meetupService.getUpcoming();
      const safeData = data || [];
      hasContentRef.current = safeData.length > 0;
      setMeetups(safeData);
      setActiveIndex(0);
    } catch (err) {
      console.log('Error fetching upcoming meetups for carousel:', err);
      setError(err);
      if (!hasContentRef.current) setMeetups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUpcomingMeetups();
  }, [fetchUpcomingMeetups]);

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

  const handleMomentumScrollEnd = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextIndex = Math.round(offsetX / (CAROUSEL_ITEM_WIDTH + CARD_GAP));
    setActiveIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    isUserInteractingRef.current = true;
    stopAutoPlay();
  }, [stopAutoPlay]);

  const handleScrollEndDrag = useCallback(() => {
    isUserInteractingRef.current = false;
    startAutoPlay();
  }, [startAutoPlay]);

  const renderItem = useCallback(({ item: meetup }) => (
    <MeetupCard meetup={meetup} navigation={navigation} />
  ), [navigation]);

  const keyExtractor = useCallback((item) => item._id, []);

  const getItemLayout = useCallback((_, index) => ({
    length: CAROUSEL_ITEM_WIDTH + CARD_GAP,
    offset: (CAROUSEL_ITEM_WIDTH + CARD_GAP) * index,
    index,
  }), []);

  const sectionTitle = 'Upcoming Meetups';

  if (loading) {
    return (
      <View style={styles.skeletonContainer}>
        <View style={styles.skeletonHeader}>
          <Skeleton width="44%" height={20} borderRadius={6} />
          <Skeleton width="22%" height={16} borderRadius={6} />
        </View>
        <Skeleton width={CAROUSEL_ITEM_WIDTH} height={CAROUSEL_HEIGHT} borderRadius={18} style={{ marginLeft: 16 }} />
      </View>
    );
  }

  if (!loading && meetups.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            <Text style={styles.sectionSubtitle}>Connect with your community</Text>
          </View>
        </View>
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name={error ? 'cloud-offline-outline' : 'calendar-clear-outline'} size={22} color={colors.primary} />
          </View>
          <View style={styles.emptyCopy}>
            <Text style={styles.emptyTitle}>
              {error ? 'Meetups could not load' : 'No meetups scheduled'}
            </Text>
            <Text style={styles.emptyText} numberOfLines={2}>
              {error ? 'Pull to refresh or try again later.' : 'New community events will appear here when available.'}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
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

      <View style={styles.carouselFrame}>
        <FlatList
          ref={flatListRef}
          data={meetups}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CAROUSEL_ITEM_WIDTH + CARD_GAP}
          decelerationRate="fast"
          disableIntervalMomentum
          contentContainerStyle={styles.listContent}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          scrollEventThrottle={32}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          getItemLayout={getItemLayout}
          bounces={false}
          removeClippedSubviews={Platform.OS !== 'web'}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={3}
        />

        {meetups.length > 1 && (
          <View style={styles.indicatorContainer} pointerEvents="none">
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 18,
    marginHorizontal: -20,
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
    letterSpacing: 0,
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
  carouselFrame: {
    position: 'relative',
  },
  listContent: {
    paddingHorizontal: 16,
    gap: CARD_GAP,
  },
  cardContainer: {
    width: CAROUSEL_ITEM_WIDTH,
    height: CAROUSEL_HEIGHT,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#000',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
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
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  liveBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    gap: 7,
  },
  datePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(14,165,233,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(186,230,253,0.18)',
  },
  dateText: {
    color: '#e0f2fe',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0,
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
    fontWeight: '600',
    flexShrink: 1,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  indicatorDotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  skeletonContainer: {
    marginTop: 8,
    marginBottom: 18,
    marginHorizontal: -20,
    gap: 10,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  emptyState: {
    marginHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.infoBg,
  },
  emptyCopy: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  emptyText: {
    fontSize: 12.5,
    lineHeight: 17,
    color: colors.textMuted,
    marginTop: 2,
  },
});

export default memo(MeetupsCarousel);
