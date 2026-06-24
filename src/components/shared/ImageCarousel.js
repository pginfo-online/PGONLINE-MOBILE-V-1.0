import React, { useState, useRef } from 'react';
import {
  View, ScrollView, Image, TouchableOpacity,
  Dimensions, Text, StyleSheet, Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * ImageCarousel — horizontal scrolling photo gallery
 * @param {Array<{url: string, publicId: string}>} photos
 * @param {number} height
 * @param {boolean} fullscreenEnabled
 */
export default function ImageCarousel({ photos = [], height = 260, fullscreenEnabled = true }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const scrollRef = useRef(null);

  if (photos.length === 0) {
    return (
      <View style={[styles.placeholder, { height }]}>
        <Ionicons name="image-outline" size={40} color={colors.textMuted} />
        <Text style={styles.placeholderText}>No photos available</Text>
      </View>
    );
  }

  const handleScroll = (e) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(idx);
  };

  return (
    <>
      <View>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
        >
          {photos.map((photo, i) => (
            <TouchableOpacity
              key={photo.publicId || i}
              activeOpacity={0.95}
              onPress={() => fullscreenEnabled && setFullscreen(true)}
            >
              <Image
                source={{ uri: photo.url }}
                style={{ width: SCREEN_WIDTH, height }}
                resizeMode="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Dots */}
        {photos.length > 1 && (
          <View style={styles.dots}>
            {photos.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === activeIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}

        {/* Counter */}
        <View style={styles.counter}>
          <Text style={styles.counterText}>{activeIndex + 1} / {photos.length}</Text>
        </View>
      </View>

      {/* Fullscreen modal */}
      <Modal visible={fullscreen} transparent animationType="fade">
        <View style={styles.fullscreenBg}>
          <TouchableOpacity style={styles.closeBtn} onPress={() => setFullscreen(false)}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            contentOffset={{ x: activeIndex * SCREEN_WIDTH, y: 0 }}
          >
            {photos.map((photo, i) => (
              <Image
                key={i}
                source={{ uri: photo.url }}
                style={{ width: SCREEN_WIDTH, height: '100%' }}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderText: { fontSize: 14, color: colors.textMuted },
  dots: {
    position: 'absolute', bottom: 12,
    left: 0, right: 0,
    flexDirection: 'row',
    justifyContent: 'center', gap: 6,
  },
  dot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: '#fff', width: 18 },
  counter: {
    position: 'absolute', top: 12, right: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 20, paddingVertical: 4, paddingHorizontal: 10,
  },
  counterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  fullscreenBg: { flex: 1, backgroundColor: '#000' },
  closeBtn: {
    position: 'absolute', top: 50, right: 20, zIndex: 10,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
});
