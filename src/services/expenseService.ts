import api from '../lib/api';

export const getExpenses = () => api.get('/expenses');
export const getExpense = (id: number) => api.get(`/expenses/${id}`);
export const createExpense = (data: object) => api.post('/expenses', data);
export const updateExpense = (id: number, data: object) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id: number) => api.delete(`/expenses/${id}`);
