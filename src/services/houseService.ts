import api from '../lib/api';

export const getHouses = () => api.get('/houses');
export const getHouse = (id: number) => api.get(`/houses/${id}`);
export const createHouse = (data: object) => api.post('/houses', data);
export const updateHouse = (id: number, data: object) => api.put(`/houses/${id}`, data);
export const deleteHouse = (id: number) => api.delete(`/houses/${id}`);
