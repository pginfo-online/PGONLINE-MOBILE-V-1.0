import React, { useRef, useCallback, memo } from 'react';
import { View, FlatList, Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import colors from '../../theme/colors';

const PLACEHOLDER_URI = 'https://via.placeholder.com/400x200?text=PG';
const MAX_PHOTOS = 5;

const springConfig = { damping: 15, stiffness: 150 };

/**
 * PGCardCarousel — horizontal image carousel for PG cards.
 * Features:
 *  - Snap-to-page scrolling
 *  - Animated pagination dots (active dot scales/expands)
 *  - Photo counter badge
 *  - Lazy loading with expo-image blur-up placeholders
 *  - Capped at 5 images for card-level performance
 *
 * @param {Array<{url: string, publicId: string, isMain: boolean}>} photos
 * @param {number} height - Image height
 * @param {number} width - Card width (defaults to screen width - padding)
 */
function PGCardCarousel({ photos = [], height = 180, width: cardWidth, onPress }) {
  const scrollX = useSharedValue(0);
  const activeIndexRef = useRef(0);

  // Determine card width — default to available screen width minus padding
  const containerWidth = cardWidth || Dimensions.get('window').width - 40;

  // Sort: main photo first, cap at MAX_PHOTOS
  const sortedPhotos = React.useMemo(() => {
    if (photos.length === 0) return [{ url: PLACEHOLDER_URI, publicId: 'placeholder' }];
    const mainIdx = photos.findIndex((p) => p.isMain);
    const sorted = [...photos];
    if (mainIdx > 0) {
      const [main] = sorted.splice(mainIdx, 1);
      sorted.unshift(main);
    }
    return sorted.slice(0, MAX_PHOTOS);
  }, [photos]);

  const totalPhotos = photos.length; // Original count for badge
  const displayPhotos = sortedPhotos;

  const handleScroll = useCallback((event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    activeIndexRef.current = Math.round(offsetX / containerWidth);
  }, [containerWidth]);

  const getItemLayout = useCallback((_, index) => ({
    length: containerWidth,
    offset: containerWidth * index,
    index,
  }), [containerWidth]);

  const renderImage = useCallback(({ item }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
      <Image
        source={{ uri: item.url }}
        style={{ width: containerWidth, height }}
        contentFit="cover"
        placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        transition={200}
        recyclingKey={item.publicId}
      />
    </TouchableOpacity>
  ), [containerWidth, height, onPress]);

  const keyExtractor = useCallback((item, index) => item.publicId || `photo-${index}`, []);

  return (
    <View>
      <FlatList
        data={displayPhotos}
        renderItem={renderImage}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        getItemLayout={getItemLayout}
        bounces={false}
        decelerationRate="fast"
        removeClippedSubviews
      />

      {/* Animated Pagination Dots */}
      {displayPhotos.length > 1 && (
        <View style={styles.dotsContainer}>
          <View style={styles.dotsWrapper}>
            {displayPhotos.map((_, index) => (
              <PaginationDot
                key={index}
                index={index}
                scrollX={scrollX}
                pageWidth={containerWidth}
              />
            ))}
          </View>
        </View>
      )}

      {/* Photo Counter Badge */}
      {totalPhotos > 1 && (
        <View style={styles.counterBadge}>
          <Animated.Text style={styles.counterText}>
            {Math.min(displayPhotos.length, totalPhotos)} photos
          </Animated.Text>
        </View>
      )}
    </View>
  );
}

/** Individual animated pagination dot */
const PaginationDot = memo(({ index, scrollX, pageWidth }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * pageWidth,
      index * pageWidth,
      (index + 1) * pageWidth,
    ];

    const dotWidth = interpolate(
      scrollX.value,
      inputRange,
      [6, 20, 6],
      Extrapolation.CLAMP
    );

    const dotOpacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      Extrapolation.CLAMP
    );

    const dotScale = interpolate(
      scrollX.value,
      inputRange,
      [0.8, 1, 0.8],
      Extrapolation.CLAMP
    );

    return {
      width: withSpring(dotWidth, springConfig),
      opacity: dotOpacity,
      transform: [{ scale: dotScale }],
    };
  });

  return (
    <Animated.View style={[styles.dot, animatedStyle]} />
  );
});

const styles = StyleSheet.create({
  dotsContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  dotsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  counterBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  counterText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default memo(PGCardCarousel);
