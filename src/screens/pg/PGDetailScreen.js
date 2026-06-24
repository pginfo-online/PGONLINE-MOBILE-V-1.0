import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import pgService from '../../services/pg.service';
import leadService from '../../services/lead.service';
import useWishlistStore from '../../store/wishlistStore';

import ScreenHeader from '../../components/layout/ScreenHeader';
import ImageCarousel from '../../components/shared/ImageCarousel';
import { AmenitiesGrid } from '../../components/shared/AmenityBadge';
import RentDisplay from '../../components/ui/RentDisplay';
import ContactActions from '../../components/shared/ContactActions';
import { SectionHeader, Divider, InfoRow } from '../../components/shared/CommonUI';
import { LoadingSpinner } from '../../components/ui/LoadingOverlay';
import Badge from '../../components/ui/Badge';
import WishlistButton from '../../components/shared/WishlistButton';
import Toast from 'react-native-toast-message';

export default function PGDetailScreen({ route, navigation }) {
  const { pgId } = route.params;
  const insets = useSafeAreaInsets();
  const [pg, setPg] = useState(null);
  const [loading, setLoading] = useState(true);

  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlistStore();
  const wishlisted = isWishlisted(pgId);

  useEffect(() => {
    pgService.getById(pgId)
      .then(setPg)
      .catch((e) => {
        Toast.show({ type: 'error', text1: 'Error loading PG', text2: e.message });
        navigation.goBack();
      })
      .finally(() => setLoading(false));
  }, [pgId]);

  const toggleWishlist = async () => {
    try {
      if (wishlisted){
        removeFromWishlist(pgId);
        await leadService.addLead(pgId, 'wishlist');

      } 

      
      else {
        addToWishlist({ pg: pgId });
        await leadService.addLead(pgId, 'wishlist');
      }
    } catch (e) {}
  };

  if (loading || !pg) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <ScreenHeader onBack={() => navigation.goBack()} transparent textColor="light" />
        <LoadingSpinner message="Loading PG Details..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header overlaid on image */}
      <ScreenHeader
        onBack={() => navigation.goBack()}
        rightAction={<WishlistButton isWishlisted={wishlisted} onPress={toggleWishlist} />}
        transparent
        textColor="light"
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        <ImageCarousel photos={pg.photos} />

        <View style={styles.content}>
          {/* Title & Status */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{pg.name}</Text>
            {pg.isVerified && <Badge text="Verified" variant="verified" icon={<Ionicons name="shield-checkmark" size={12} color="#fff" />} />}
          </View>
          <Text style={styles.location}>
            <Ionicons name="location-outline" size={14} /> {pg.address}, {pg.area}, {pg.city}
          </Text>
          <View style={styles.tagsRow}>
            {pg.gender && <Badge text={pg.gender.charAt(0).toUpperCase() + pg.gender.slice(1)} variant="primary" />}
            {pg.food !== 'none' && <Badge text={pg.food === 'both' ? 'Veg+NV' : pg.food} variant="warning" />}
            {pg.ac && <Badge text="AC" variant="info" />}
          </View>

          <Divider />

          {/* Rent Options */}
          <SectionHeader title="Monthly Rent" />
          <RentDisplay rent={pg.rent} layout="grid" />

          <Divider />

          {/* Amenities */}
          <SectionHeader title="Amenities" />
          {pg.facilities?.length > 0 ? (
            <AmenitiesGrid facilities={pg.facilities} />
          ) : (
            <Text style={{ color: colors.textMuted }}>No amenities listed.</Text>
          )}

          <Divider />

          {/* Info Details */}
          <SectionHeader title="Details" />
          <View style={{ backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16 }}>
            <InfoRow label="Available Rooms" value={pg.availableRooms || '0'} iconName="bed-outline" />
            <InfoRow label="Food Included" value={pg.foodIncluded ? 'Yes' : 'No'} iconName="restaurant-outline" />
            <InfoRow label="Owner" value={pg.owner?.name} iconName="person-outline" />
            {pg.description && (
              <View style={{ paddingVertical: 12 }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 22 }}>{pg.description}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Contact Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || 16 }]}>
        <ContactActions
          phone={pg.contactPhone}
          whatsapp={pg.contactWhatsapp}
          onBookVisit={() => navigation.navigate('BookVisit', { pg })}
          style={{ width: '100%' }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.screenPadding, marginTop: -20, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.background },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, flex: 1 },
  location: { fontSize: 14, color: colors.textSecondary, marginBottom: 12, lineHeight: 20 },
  tagsRow: { flexDirection: 'row', gap: 8 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1, borderTopColor: colors.borderLight,
    paddingHorizontal: spacing.screenPadding, paddingTop: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 10,
  },
});
