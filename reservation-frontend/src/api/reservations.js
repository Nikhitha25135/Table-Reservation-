import client from './client';

export const checkAvailability = (date, timeSlot, guests) =>
  client.get('/reservations/availability', { params: { date, timeSlot, guests } }).then((r) => r.data);

export const createReservation = (payload) => client.post('/reservations', payload).then((r) => r.data);

export const getMyReservations = () => client.get('/reservations/me').then((r) => r.data);

export const cancelMyReservation = (id) => client.delete(`/reservations/${id}`).then((r) => r.data);
