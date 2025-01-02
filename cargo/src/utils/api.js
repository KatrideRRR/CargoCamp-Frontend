import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Адрес вашего бэкенда
});

export const fetchOrders = async () => {
  const response = await API.get('/orders');
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await API.post('/orders', orderData);
  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await API.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export default API;
