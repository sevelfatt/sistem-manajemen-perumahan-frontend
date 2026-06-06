import api from '../lib/api';

export const getResidents = () => api.get('/residents');
export const getResident = (id: number) => api.get(`/residents/${id}`);
export const createResident = (data: FormData | object) => {
  if (data instanceof FormData) {
    return api.post('/residents', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.post('/residents', data);
};
export const updateResident = (id: number, data: FormData | object) => {
  if (data instanceof FormData) {
    // Laravel doesn't support PUT with FormData, use POST with _method
    data.append('_method', 'PUT');
    return api.post(`/residents/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
  return api.put(`/residents/${id}`, data);
};
export const deleteResident = (id: number) => api.delete(`/residents/${id}`);
