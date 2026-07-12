import client from './client';

export const registerUser = (payload) => client.post('/auth/register', payload).then((r) => r.data);

export const loginUser = (payload) => client.post('/auth/login', payload).then((r) => r.data);

export const fetchMe = () => client.get('/auth/me').then((r) => r.data);
