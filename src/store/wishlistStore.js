import { create } from 'zustand';

const useWishlistStore = create((set, get) => ({
  wishlist: [],

  setWishlist: (list) => set({ wishlist: list }),

  isWishlisted: (pgId) => get().wishlist.some((w) => w.pg?._id === pgId || w.pg === pgId),

  addToWishlist: (item) =>
    set((state) => ({ wishlist: [item, ...state.wishlist] })),

  removeFromWishlist: (pgId) =>
    set((state) => ({
      wishlist: state.wishlist.filter((w) => (w.pg?._id || w.pg) !== pgId),
    })),
}));

export default useWishlistStore;
