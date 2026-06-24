import api from './api';

export const meetupService = {
  getAll: async (params = {}) => {
    const res = await api.get('/meetups', { params });
    return { meetups: res.data.data, pagination: res.data.pagination };
  },
  getUpcoming: async (params = {}) => {
    const res = await api.get('/meetups/upcoming', { params });
    return res.data.data.meetups;
  },
  getById: async (id) => {
    const res = await api.get(`/meetups/${id}`);
    return res.data.data.meetup;
  },
  rsvp: async (id, status) => {
    const res = await api.post(`/meetups/${id}/rsvp`, { status });
    return res.data.data; // returns { rsvpList }
  },
};

export default meetupService;
