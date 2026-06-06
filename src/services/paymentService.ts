import api from '../lib/api';

export const getPayments = () => api.get('/payments');
export const getPayment = (id: number) => api.get(`/payments/${id}`);
export const createPayment = (data: object) => api.post('/payments', data);
export const updatePayment = (id: number, data: object) => api.put(`/payments/${id}`, data);
export const deletePayment = (id: number) => api.delete(`/payments/${id}`);
