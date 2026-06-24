import api from './api';

export const authService = {
  // ─── Standard Auth (unchanged) ────────────────────────────────────────────
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials);
    return res.data.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', { ...userData, role: 'tenant' });
    return res.data.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data.data.user;
  },

  // ─── OTP Auth (Mobile Tenant Users) ───────────────────────────────────────
  /**
   * Request an OTP to be sent to the user's email
   * @param {string} email
   * @param {'register'|'login'} purpose
   */
  sendOtp: async (email, purpose) => {
    const res = await api.post('/auth/otp/send', { email, purpose });
    return res.data;
  },
  /**
   * Verify OTP and register a new tenant account
   * @param {{ name: string, email: string, phone?: string, otp: string }} userData
   */
  registerWithOtp: async ({ name, email, phone, otp }) => {
    const res = await api.post('/auth/otp/register', { name, email, phone, otp });
    return res.data.data;
  },
  /**
   * Verify OTP and log in to an existing account
   * @param {string} email
   * @param {string} otp
   */
  loginWithOtp: async (email, otp) => {
    const res = await api.post('/auth/otp/login', { email, otp });
    return res.data.data;
  },
};

export default authService;

