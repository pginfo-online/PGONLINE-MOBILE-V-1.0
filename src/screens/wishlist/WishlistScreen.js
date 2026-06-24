import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import leadService from '../../services/lead.service';
import useWishlistStore from '../../store/wishlistStore';

import ScreenHeader from '../../components/layout/ScreenHeader';
import PGListItem from '../../components/shared/PGListItem';
import EmptyState from '../../components/shared/EmptyState';
import { ListRowSkeleton } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';

export default function WishlistScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const { wishlist, setWishlist, isWishlisted, removeFromWishlist } = useWishlistStore();

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const data = await leadService.getMyWishlist();
      setWishlist(data);
    } catch (e) {
    } finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { loadWishlist(); }, []));

  const handleRemove = async (pgId) => {
    try {
      removeFromWishlist(pgId);
      // Backend toggle removes the wishlist lead
      await leadService.addLead(pgId, 'wishlist');
    } catch (error) {
      console.log('Failed to remove from backend', error);
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Wishlist" subtitle="Your favorite PGs saved for later" />

      <FlatList
        data={wishlist}
        keyExtractor={(item, index) => item._id || item.pg?._id || item.pg || `wl-${index}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View><ListRowSkeleton /><ListRowSkeleton /></View>
          ) : (
            <EmptyState
              icon="heart-outline"
              title="Your wishlist is empty"
              message="Save PGs you like to easily find them later."
              action={<Button title="Browse PGs" onPress={() => navigation.navigate('Home')} />}
            />
          )
        }
        renderItem={({ item }) => {
          if (!item.pg) return null; // Defensive check
          return (
            <PGListItem
              pg={item.pg}
              onPress={() => navigation.navigate('PGDetail', { pgId: item.pg._id })}
              isWishlisted={isWishlisted(item.pg._id)}
              onWishlist={() => handleRemove(item.pg._id)}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.screenPadding },
});
