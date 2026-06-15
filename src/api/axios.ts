import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const portail = localStorage.getItem('portail');
      localStorage.removeItem('token');
      localStorage.removeItem('portail');
      localStorage.removeItem('role');
      window.location.href = portail === 'AR' ? '/ar/login' : '/login';
    }
    return Promise.reject(error);
  }
);

export const searchEleveByMatricule = async (matricule: string) => {
  const response = await api.get(`/eleves/matricule/${matricule}`);
  return response.data;
};

export default api;
