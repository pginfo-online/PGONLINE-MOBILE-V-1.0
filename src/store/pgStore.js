import { create } from 'zustand';

const usePGStore = create((set) => ({
  pgs: [],
  pagination: null,
  currentPG: null,
  loading: false,
  searchQuery: '',
  filters: {},

  setPGs: (pgs, pagination) => set({ pgs, pagination }),
  setCurrentPG: (pg) => set({ currentPG: pg }),
  setLoading: (loading) => set({ loading }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {}, searchQuery: '' }),
  appendPGs: (newPGs, pagination) =>
    set((state) => ({ pgs: [...state.pgs, ...newPGs], pagination })),
}));

export default usePGStore;
