import React, { useState, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import { visitService } from '../../services/visit.service';
import ScreenHeader from '../../components/layout/ScreenHeader';
import VisitCard from '../../components/shared/VisitCard';
import EmptyState from '../../components/shared/EmptyState';
import { ListRowSkeleton } from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';

export default function MyVisitsScreen({ navigation }) {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadVisits = async () => {
    setLoading(true);
    try {
      const data = await visitService.getMy();
      setVisits(data);
    } catch (e) {
    } finally { setLoading(false); }
  };

  useFocusEffect(useCallback(() => { loadVisits(); }, []));

  return (
    <View style={styles.container}>
      <ScreenHeader title="My Visits" subtitle="Track your scheduled visits" />

      <FlatList
        data={visits}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loading ? (
            <View><ListRowSkeleton /><ListRowSkeleton /></View>
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No visits scheduled"
              message="You haven't requested to visit any PGs yet."
              action={<Button title="Explore PGs" onPress={() => navigation.navigate('Home')} />}
            />
          )
        }
        renderItem={({ item }) => (
          <VisitCard
            visit={item}
            onPress={() => navigation.navigate('PGDetail', { pgId: item.pg?._id })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.screenPadding },
});
