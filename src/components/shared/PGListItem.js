import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import Badge from '../ui/Badge';
import WishlistButton from './WishlistButton';

/**
 * PGListItem — compact horizontal list row for search results
 * @param {object} pg
 * @param {function} onPress
 * @param {boolean} isWishlisted
 * @param {function} onWishlist
 */
export default function PGListItem({ pg, onPress, isWishlisted, onWishlist }) {
  const photo = pg.photos?.find((p) => p.isMain) || pg.photos?.[0];
  const minRent = Math.min(
    pg.rent?.single || Infinity,
    pg.rent?.double || Infinity,
    pg.rent?.triple || Infinity
  );

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Thumbnail */}
      <View style={styles.imgWrap}>
        <Image
          source={{ uri: photo?.url || 'https://via.placeholder.com/100?text=PG' }}
          style={styles.img}
          resizeMode="cover"
        />
        {pg.isVerified && (
          <View style={styles.verifiedDot}>
            <Ionicons name="shield-checkmark" size={10} color="#fff" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{pg.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={12} color={colors.textMuted} />
          <Text style={styles.location} numberOfLines={1}>{pg.area}, {pg.city}</Text>
        </View>

        <View style={styles.infoRow}>
          {pg.food && pg.food !== 'none' && (
            <View style={styles.tag}>
              <Ionicons name="restaurant-outline" size={11} color={colors.textMuted} />
              <Text style={styles.tagText}>{pg.food === 'both' ? 'Veg+NV' : pg.food}</Text>
            </View>
          )}
          {pg.ac && (
            <View style={styles.tag}>
              <Ionicons name="snow-outline" size={11} color={colors.textMuted} />
              <Text style={styles.tagText}>AC</Text>
            </View>
          )}
        </View>

        <Text style={styles.rent}>
          {minRent < Infinity ? `₹${minRent.toLocaleString('en-IN')}/mo` : 'Price on request'}
        </Text>
      </View>

      {/* Right */}
      <View style={styles.right}>
        {onWishlist && (
          <WishlistButton isWishlisted={isWishlisted} onPress={onWishlist} size={18} />
        )}
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginTop: 'auto' }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', gap: 12,
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius,
    padding: 12,
    borderWidth: 1, borderColor: colors.borderLight,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
    marginBottom: 10,
  },
  imgWrap: { position: 'relative' },
  img: { width: 90, height: 90, borderRadius: 10 },
  verifiedDot: {
    position: 'absolute', bottom: 4, right: 4,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.verified,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1, justifyContent: 'center', gap: 3 },
  name: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  location: { fontSize: 12, color: colors.textMuted, flex: 1 },
  infoRow: { flexDirection: 'row', gap: 8 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  tagText: { fontSize: 11, color: colors.textMuted, fontWeight: '500', textTransform: 'capitalize' },
  rent: { fontSize: 15, fontWeight: '800', color: colors.primary },
  right: { alignItems: 'flex-end', justifyContent: 'space-between', paddingVertical: 2 },
});
