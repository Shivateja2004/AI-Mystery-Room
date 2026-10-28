import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api', timeout: 30000 });

export function messageFrom(error) {
  return error.response?.data?.error?.message || 'Something went wrong. Please try again.';
}

export const createCase = (input) => api.post('/cases', input).then((response) => response.data.case);
export const getCase = (id) => api.get(`/cases/${id}`).then((response) => response.data.case);
export const discoverClue = (id, clueId) => api.post(`/cases/${id}/clues/${clueId}/discover`).then((response) => response.data);
export const requestHint = (id) => api.post(`/cases/${id}/hints`).then((response) => response.data);
export const accuse = (id, suspectId) => api.post(`/cases/${id}/accuse`, { suspectId }).then((response) => response.data.result);
export const getResult = (id) => api.get(`/cases/${id}/result`).then((response) => response.data.result);
