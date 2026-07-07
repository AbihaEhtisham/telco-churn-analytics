import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchKPIs = () => api.get('/analytics/kpis');
export const fetchChurnAnalysis = () => api.get('/analytics/churn');
export const fetchRevenueAnalysis = () => api.get('/analytics/revenue');
export const fetchDemographicsAnalysis = () => api.get('/analytics/demographics');
export const fetchServiceAnalysis = () => api.get('/analytics/services');
export const fetchCustomers = (params) => api.get('/customers', { params });
export const fetchCustomerById = (id) => api.get(`/customers/${id}`);
export const fetchSegments = () => api.get('/customers/segments');

export default api;