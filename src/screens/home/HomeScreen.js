import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  RefreshControl, FlatList, Dimensions, Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolation,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import useAuthStore from '../../store/authStore';
import usePGStore from '../../store/pgStore';
import useWishlistStore from '../../store/wishlistStore';
import pgService from '../../services/pg.service';
import leadService from '../../services/lead.service';

import { PGCard } from '../../components/ui/Card';
import { PGCardSkeleton } from '../../components/ui/Skeleton';
import Avatar from '../../components/ui/Avatar';
import WishlistButton from '../../components/shared/WishlistButton';
import { SectionHeader } from '../../components/shared/CommonUI';
import FilterSheet from '../../components/shared/FilterSheet';
import MeetupsCarousel from '../../components/shared/MeetupsCarousel';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CITIES = ['Pune', 'Mumbai', 'Delhi'];
const HEADER_MAX_HEIGHT = 140;
const HEADER_MIN_HEIGHT = 55;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const SEARCH_BAR_COLLAPSE_START = 30;
const SEARCH_BAR_COLLAPSE_END = 100;

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { pgs, setPGs, filters, setFilters, clearFilters } = usePGStore();
  const { wishlist, isWishlisted, addToWishlist, removeFromWishlist, setWishlist } = useWishlistStore();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedCity, setSelectedCity] = useState(CITIES[0]);

  // ─── Animated Values ──────────────────────────────────────────────
  const scrollY = useSharedValue(0);
  const searchBarScale = useSharedValue(1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // ─── Data Loading ─────────────────────────────────────────────────
  const loadData = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      const pgData = await pgService.getAll({ ...filters, city: selectedCity, limit: 10 });
      setPGs(pgData.pgs, pgData.pagination);

      if (!isRefresh) {
        const wlData = await leadService.getMyWishlist();
        setWishlist(wlData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedCity, filters])
  );

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    loadData(true);
  }, [selectedCity, filters]);

  const toggleWishlist = async (pgId) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isWishlisted(pgId)) {
        removeFromWishlist(pgId);
      } else {
        addToWishlist({ pg: pgId });
      }
      // Backend handles add/remove toggle dynamically
      await leadService.addLead(pgId, 'wishlist');
    } catch (err) {
      console.log('Wishlist error:', err);
    }
  };

  const handleSearchPress = useCallback(() => {
    // Animate press feedback
    searchBarScale.value = withSpring(0.96, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      searchBarScale.value = withSpring(1, { damping: 15, stiffness: 400 });
      navigation.navigate('SearchDedicated');
    }, 80);
  }, [navigation]);

  const activeFiltersCount = Object.keys(filters).length;

  // ─── Animated Styles ──────────────────────────────────────────────

  // Header gradient collapse animation (Absolute positioning to prevent FlatList thrashing)
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const headerHeight = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT + insets.top, HEADER_MIN_HEIGHT + insets.top],
      Extrapolation.CLAMP
    );

    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      height: headerHeight,
      overflow: 'hidden',
    };
  });

  // Greeting text fade out on scroll
  const greetingAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 50],
      [1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, 50],
      [0, -15],
      Extrapolation.CLAMP
    );

    return { opacity, transform: [{ translateY }] };
  });

  // City chips fade out on scroll
  const cityChipsAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SEARCH_BAR_COLLAPSE_START, SEARCH_BAR_COLLAPSE_END],
      [1, 0.6, 0],
      Extrapolation.CLAMP
    );
    const height = interpolate(
      scrollY.value,
      [0, SEARCH_BAR_COLLAPSE_END],
      [44, 0],
      Extrapolation.CLAMP
    );

    return { opacity, height, overflow: 'hidden' };
  });

  // Search bar stays visible, moves up, and scales slightly when at top
  const searchBarAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, SEARCH_BAR_COLLAPSE_END],
      [1, 0.96],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [0, -45], // Move up to cover the fading greeting row
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateY },
        { scale: scale * searchBarScale.value }
      ],
    };
  });

  // Avatar fade
  const avatarAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, 40],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  // ─── FlatList Components ──────────────────────────────────────────

  const ListHeader = useMemo(() => (
    <View style={styles.listHeader}>
      <MeetupsCarousel navigation={navigation} />
      <SectionHeader
        title={`Top PGs in ${selectedCity}`}
        actionText={activeFiltersCount > 0 ? 'Clear Filters' : 'See All'}
        onAction={() => activeFiltersCount > 0 ? clearFilters() : navigation.navigate('SearchDedicated')}
      />
    </View>
  ), [selectedCity, activeFiltersCount, navigation]);

  const ListFooter = useMemo(() => (
    <TouchableOpacity style={styles.aiBanner} onPress={() => navigation.navigate('AIChat')} activeOpacity={0.9}>
      <LinearGradient
        colors={['#8b5cf6', '#6d28d9']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.aiGradient}
      >
        <View style={styles.aiIconWrapper}>
          <Ionicons name="sparkles" size={24} color="#8b5cf6" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.aiTitle}>Try AI Search</Text>
          <Text style={styles.aiSub}>Tell us exactly what you need</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={28} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  ), []);

  const EmptyComponent = useMemo(() => (
    <View style={styles.empty}>
      <View style={styles.emptyIconWrapper}>
        <Ionicons name="home-outline" size={40} color={colors.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>No PGs found</Text>
      <Text style={styles.emptyText}>Try changing your city or adjusting filters</Text>
    </View>
  ), []);

  const LoadingComponent = useMemo(() => (
    <>
      <PGCardSkeleton />
      <PGCardSkeleton />
      <PGCardSkeleton />
    </>
  ), []);

  const renderPGCard = useCallback(({ item: pg }) => (
    <PGCard
      pg={pg}
      onPress={() => navigation.navigate('PGDetail', { pgId: pg._id })}
      style={{ marginBottom: 16 }}
      rightAction={
        <WishlistButton
          isWishlisted={isWishlisted(pg._id)}
          onPress={() => toggleWishlist(pg._id)}
        />
      }
    />
  ), [isWishlisted, wishlist]);

  const keyExtractor = useCallback((item) => item._id, []);

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <View style={styles.container}>
      {/* Animated Gradient Header */}
      <Animated.View style={headerAnimatedStyle}>
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientMid]}
          style={[styles.gradientHeader, { paddingTop: insets.top }]}
        >
          {/* Top Row: Greeting + Avatar */}




          <Animated.View style={[styles.header, greetingAnimatedStyle]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
              <Text style={styles.subGreeting}>Find your next home</Text>
            </View>
            <Animated.View style={avatarAnimatedStyle}>
              <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                <Avatar name={user?.name} size="sm" color="rgba(255,255,255,0.2)" />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>




          

          {/* Search Bar — Pressable, navigates to dedicated search */}
          <Animated.View style={[styles.searchContainer, searchBarAnimatedStyle]}>
            <TouchableOpacity
              style={styles.fakeSearchBar}
              onPress={handleSearchPress}
              activeOpacity={0.85}
            >
              <View style={styles.fakeSearchInner}>
                <Ionicons name="search-outline" size={18} color={colors.textMuted} />
                <Text style={styles.fakeSearchText}>Search by area, PG name...</Text>
              </View>
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={() => setShowFilter(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="options-outline" size={18} color={colors.primary} />
                {activeFiltersCount > 0 && (
                  <View style={styles.filterBadge}>
                    <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>

          {/* City Selector Chips */}
          <Animated.View style={cityChipsAnimatedStyle}>
            <Animated.ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.cityScroll}
            >
              {CITIES.map((city) => (
                <TouchableOpacity
                  key={city}
                  style={[styles.cityChip, selectedCity === city && styles.cityChipActive]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedCity(city);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="location" size={12} color={selectedCity === city ? colors.primary : '#fff'} />
                  <Text style={[styles.cityText, selectedCity === city && styles.cityTextActive]}>
                    {city}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.ScrollView>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* Main Content — Virtualized FlatList */}
      {loading ? (
        <View style={[styles.content, { paddingTop: HEADER_MAX_HEIGHT + insets.top + 20 }]}>{LoadingComponent}</View>
      ) : (
        <AnimatedFlatList
          style={styles.list}
          data={pgs}
          renderItem={renderPGCard}
          keyExtractor={keyExtractor}
          contentContainerStyle={[styles.content, { paddingTop: HEADER_MAX_HEIGHT + insets.top + 16 }]}
          scrollIndicatorInsets={{ top: HEADER_MAX_HEIGHT + insets.top }}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          ListHeaderComponent={ListHeader}
          ListFooterComponent={ListFooter}
          ListEmptyComponent={EmptyComponent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
              progressViewOffset={HEADER_MAX_HEIGHT + insets.top + 10}
            />
          }
          // Performance optimizations
          removeClippedSubviews={Platform.OS !== 'web'}
          maxToRenderPerBatch={5}
          windowSize={5}
          initialNumToRender={4}
          updateCellsBatchingPeriod={50}
        />
      )}

      {/* Filter Modal */}
      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onApply={(f) => setFilters(f)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  gradientHeader: {
    flex: 1,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.screenPadding, paddingBottom: 10, paddingTop: 8,
  },
  greeting: { fontSize: 17, fontWeight: '800', color: '#fff' },
  subGreeting: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  // Search Bar (Pressable Fake)
  searchContainer: { paddingHorizontal: spacing.screenPadding, paddingBottom: 12 },
  fakeSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fakeSearchInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24, // Pill shape
    height: 38, // Redesigned height
    paddingHorizontal: 12,
    gap: 6, // Compact spacing
    // Premium subtle shadow instead of border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  fakeSearchText: {
    fontSize: 14,
    color: colors.textMuted,
    flex: 1,
  },
  filterBtn: {
    width: 38, height: 38, // Redesigned height
    borderRadius: 19, // Pill shape
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    // Premium subtle shadow instead of border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  filterBadge: {
    position: 'absolute', top: -2, right: -2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center', justifyContent: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  // City Chips
  cityScroll: { paddingHorizontal: spacing.screenPadding, paddingBottom: 12, gap: 10 },
  cityChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 6, paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  cityChipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  cityText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cityTextActive: { color: colors.primary },

  // Content
  list: { flex: 1 },
  content: { padding: spacing.screenPadding, paddingBottom: 40 },
  listHeader: { marginBottom: 4 },

  // Empty State
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyIconWrapper: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },

  // AI Banner
  aiBanner: {
    marginTop: 8, marginBottom: 20,
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#8b5cf6', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  aiGradient: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  aiIconWrapper: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  aiTitle: { fontSize: 16, fontWeight: '700', color: '#fff' },
  aiSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
});
