import client from './client';

export const getAllReservations = (filters = {}) =>
  client.get('/admin/reservations', { params: filters }).then((r) => r.data);

export const getReservationById = (id) => client.get(`/admin/reservations/${id}`).then((r) => r.data);

export const updateReservation = (id, payload) => client.put(`/admin/reservations/${id}`, payload).then((r) => r.data);

export const cancelReservation = (id) => client.delete(`/admin/reservations/${id}`).then((r) => r.data);
