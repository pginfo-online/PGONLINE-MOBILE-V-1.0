import api from './api';

export const pgService = {
  getAll: async (params = {}) => {
    const res = await api.get('/pg', { params });
    return { pgs: res.data.data, pagination: res.data.pagination };
  },
  getById: async (id) => {
    const res = await api.get(`/pg/${id}`);
    return res.data.data.pg;
  },
  aiSearch: async (query) => {
    const res = await api.get('/pg/ai-search', { params: { q: query } });
    return res.data.data;
  },
  getSuggestions: async (query) => {
    const res = await api.get('/pg/suggestions', { params: { q: query } });
    return res.data.data.suggestions;
  },
};

export default pgService;
