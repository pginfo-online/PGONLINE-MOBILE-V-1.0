import api from './api';

export const leadService = {
  addLead: async (pgId, type = 'inquiry', message = '') => {
    const res = await api.post('/lead', { pgId, type, message });
    return res.data;
  },
  getMyWishlist: async () => {
    const res = await api.get('/lead/my', { params: { type: 'wishlist' } });
    return res.data.data.leads;
  },
};

export default leadService;
