import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  _hasHydrated: false,

  setAuth: async (user, token) => {
    await SecureStore.setItemAsync('pginfo_token', token);
    await SecureStore.setItemAsync('pginfo_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('pginfo_token');
    await SecureStore.deleteItemAsync('pginfo_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  hydrate: async () => {
    try {
      const token = await SecureStore.getItemAsync('pginfo_token');
      const userStr = await SecureStore.getItemAsync('pginfo_user');
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
      }
    } catch (e) {
      console.log('Hydration failed:', e);
    }
    set({ _hasHydrated: true });
  },

  updateUser: (updatedUser) =>
    set((state) => ({ user: { ...state.user, ...updatedUser } })),
}));

export default useAuthStore;
