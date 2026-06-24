import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, FlatList, StyleSheet,
  TouchableOpacity, Keyboard, Platform, KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import pgService from '../../services/pg.service';
import leadService from '../../services/lead.service';
import useWishlistStore from '../../store/wishlistStore';
import useSearchStore from '../../store/searchStore';
import { useDebounce } from '../../utils/useDebounce';

import PGListItem from '../../components/shared/PGListItem';
import { ListRowSkeleton, SuggestionSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import FilterSheet from '../../components/shared/FilterSheet';
import SearchSuggestionItem from '../../components/shared/SearchSuggestionItem';
import RecentSearchChip from '../../components/shared/RecentSearchChip';

export default function SearchScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);
  
  // Search Store
  const {
    recentSearches, loadRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches,
    suggestions, setSuggestions, clearSuggestions,
    searchResults, setSearchResults, clearSearchResults,
    filters, setFilters, sortBy, setSortBy,
    isSearching, setIsSearching, hasSearched
  } = useSearchStore();

  const { isWishlisted, addToWishlist, removeFromWishlist } = useWishlistStore();

  // Local State
  const [query, setQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  // Initialize
  useEffect(() => {
    loadRecentSearches();
    // Auto-focus input on mount if we haven't searched yet
    if (!hasSearched) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  // Fetch Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2 || hasSearched) {
        clearSuggestions();
        setIsFetchingSuggestions(false);
        return;
      }
      setIsFetchingSuggestions(true);
      try {
        const suggs = await pgService.getSuggestions(debouncedQuery);
        setSuggestions(suggs);
      } catch (e) {
        console.error('Error fetching suggestions', e);
      } finally {
        setIsFetchingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [debouncedQuery]);

  // Execute Search
  const executeSearch = useCallback(async (searchQuery = query) => {
    if (!searchQuery.trim() && Object.keys(filters).length === 0) return;
    
    Keyboard.dismiss();
    setIsFocused(false);
    setIsSearching(true);
    setQuery(searchQuery);
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
    }

    try {
      const result = await pgService.getAll({ q: searchQuery, ...filters, sort: sortBy });
      setSearchResults(result.pgs, result.pagination);
    } catch (e) {
      console.error('Search error', e);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [filters, sortBy]);

  // Re-run search when filters or sort change
  useEffect(() => {
    if (hasSearched) {
      executeSearch(query);
    }
  }, [filters, sortBy]);

  const handleSuggestionPress = (item) => {
    setQuery(item.text);
    executeSearch(item.text);
  };

  const handleClear = () => {
    setQuery('');
    clearSearchResults();
    clearSuggestions();
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const toggleWishlist = async (pgId) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isWishlisted(pgId)) removeFromWishlist(pgId);
      else {
        addToWishlist({ pg: pgId });
        await leadService.addLead(pgId, 'wishlist');
      }
    } catch (e) {}
  };

  const activeFiltersCount = Object.keys(filters).length;

  // ─── Render Components ───────────────────────────────────────────

  const renderRecentSearches = () => {
    if (recentSearches.length === 0 || hasSearched || (query.length > 0 && isFocused)) return null;

    return (
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.sectionTitle}>Recent Searches</Text>
          <TouchableOpacity onPress={clearRecentSearches}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.chipsContainer}>
          {recentSearches.map((s) => (
            <RecentSearchChip
              key={s}
              query={s}
              onPress={executeSearch}
              onRemove={removeRecentSearch}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderSuggestions = () => {
    if (!isFocused || query.length < 2 || hasSearched) return null;

    if (isFetchingSuggestions) {
      return (
        <View style={styles.suggestionsContainer}>
          <SuggestionSkeleton />
          <SuggestionSkeleton />
          <SuggestionSkeleton />
        </View>
      );
    }

    if (suggestions.length === 0) {
        return (
            <View style={styles.suggestionsContainer}>
                <Text style={styles.noSuggestionsText}>No suggestions found</Text>
            </View>
        );
    }

    return (
      <ScrollView style={styles.suggestionsContainer} keyboardShouldPersistTaps="handled">
        {suggestions.map((item, index) => (
          <SearchSuggestionItem
            key={`${item.type}-${index}`}
            item={item}
            onPress={handleSuggestionPress}
            onFill={(text) => setQuery(text)}
          />
        ))}
      </ScrollView>
    );
  };

  const renderResults = () => {
    if (!hasSearched && !isSearching) return null;

    return (
      <FlatList
        data={searchResults}
        keyExtractor={(i) => i._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          searchResults.length > 0 ? (
             <View style={styles.resultsHeader}>
                <Text style={styles.resultsCount}>{searchResults.length} results found</Text>
             </View>
          ) : null
        }
        ListEmptyComponent={
          isSearching ? (
            <View>
              <ListRowSkeleton /><ListRowSkeleton /><ListRowSkeleton />
            </View>
          ) : (
            <EmptyState
              icon="search-outline"
              title="No results found"
              message="Try adjusting your search or filters."
            />
          )
        }
        renderItem={({ item }) => (
          <PGListItem
            pg={item}
            onPress={() => navigation.navigate('PGDetail', { pgId: item._id })}
            isWishlisted={isWishlisted(item._id)}
            onWishlist={() => toggleWishlist(item._id)}
          />
        )}
      />
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { paddingTop: insets.top }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Search Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search by area, PG name..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={(text) => {
                setQuery(text);
                if (hasSearched) clearSearchResults();
            }}
            onFocus={() => setIsFocused(true)}
            returnKeyType="search"
            onSubmitEditing={() => executeSearch()}
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
          <Ionicons name="options-outline" size={22} color={colors.primary} />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.content}>
        {renderRecentSearches()}
        {renderSuggestions()}
        {renderResults()}
      </View>

      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        filters={filters}
        onApply={(f) => setFilters(f)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    zIndex: 10,
  },
  backBtn: {
    padding: 8,
    marginRight: 4,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: spacing.borderRadius,
    height: 44,
  },
  searchIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: colors.textPrimary,
  },
  clearBtn: {
    padding: 10,
  },
  filterBtn: {
    padding: 10,
    marginLeft: 4,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  recentSection: {
    padding: 20,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  clearText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  suggestionsContainer: {
    backgroundColor: colors.surface,
    flex: 1,
  },
  noSuggestionsText: {
      padding: 20,
      textAlign: 'center',
      color: colors.textMuted,
      fontSize: 14,
  },
  list: {
    padding: spacing.screenPadding,
    paddingBottom: 40,
  },
  resultsHeader: {
      marginBottom: 12,
  },
  resultsCount: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
  }
});
