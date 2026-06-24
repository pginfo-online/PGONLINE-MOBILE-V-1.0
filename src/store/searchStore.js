import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_SEARCHES_KEY = 'pginfo_recent_searches';
const MAX_RECENT_SEARCHES = 10;

const useSearchStore = create((set, get) => ({
  // ─── State ──────────────────────────────────────────────────────────
  recentSearches: [],
  suggestions: [],
  searchResults: [],
  filters: {},
  sortBy: 'newest',
  isSearching: false,
  hasSearched: false,
  resultsPagination: null,

  // ─── Recent Searches (AsyncStorage-persisted) ────────────────────
  loadRecentSearches: async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        set({ recentSearches: JSON.parse(stored) });
      }
    } catch (e) {
      console.log('Failed to load recent searches:', e);
    }
  },

  addRecentSearch: async (query) => {
    if (!query?.trim()) return;
    const trimmed = query.trim();

    set((state) => {
      // Remove duplicate if exists, add to front, cap at max
      const filtered = state.recentSearches.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      // Persist async (fire and forget)
      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)).catch(() => {});

      return { recentSearches: updated };
    });
  },

  removeRecentSearch: async (query) => {
    set((state) => {
      const updated = state.recentSearches.filter(
        (s) => s.toLowerCase() !== query.toLowerCase()
      );

      AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated)).catch(() => {});

      return { recentSearches: updated };
    });
  },

  clearRecentSearches: async () => {
    set({ recentSearches: [] });
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.log('Failed to clear recent searches:', e);
    }
  },

  // ─── Suggestions ────────────────────────────────────────────────
  setSuggestions: (suggestions) => set({ suggestions }),
  clearSuggestions: () => set({ suggestions: [] }),

  // ─── Search Results ─────────────────────────────────────────────
  setSearchResults: (results, pagination = null) =>
    set({ searchResults: results, resultsPagination: pagination, hasSearched: true }),

  clearSearchResults: () =>
    set({ searchResults: [], resultsPagination: null, hasSearched: false }),

  // ─── Filters & Sort ─────────────────────────────────────────────
  setFilters: (filters) => set({ filters }),
  setSortBy: (sortBy) => set({ sortBy }),
  clearFilters: () => set({ filters: {}, sortBy: 'newest' }),

  // ─── Loading ────────────────────────────────────────────────────
  setIsSearching: (isSearching) => set({ isSearching }),

  // ─── Reset ──────────────────────────────────────────────────────
  resetSearch: () =>
    set({
      suggestions: [],
      searchResults: [],
      filters: {},
      sortBy: 'newest',
      isSearching: false,
      hasSearched: false,
      resultsPagination: null,
    }),
}));

export default useSearchStore;
