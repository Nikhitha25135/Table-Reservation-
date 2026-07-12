import client from './client';

export const getTables = (includeInactive = false) =>
  client.get('/tables', { params: includeInactive ? { includeInactive: true } : {} }).then((r) => r.data);

export const createTable = (payload) => client.post('/tables', payload).then((r) => r.data);

export const updateTable = (id, payload) => client.put(`/tables/${id}`, payload).then((r) => r.data);

export const deleteTable = (id) => client.delete(`/tables/${id}`).then((r) => r.data);
