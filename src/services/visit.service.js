import api from './api';

export const visitService = {
  create: async (data) => {
    const res = await api.post('/visit', data);
    return res.data.data.visit;
  },
  getMy: async () => {
    const res = await api.get('/visit/my');
    return res.data.data.visits;
  },
};

export default visitService;
