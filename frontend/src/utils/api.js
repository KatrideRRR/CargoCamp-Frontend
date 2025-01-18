import axios from 'axios';

const API_URL = "http://localhost:5000/api";

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // Замените на URL вашего сервера
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProfile = async (token) => {
  const response = await fetch('http://localhost:5000/api/profile', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile data');
  }

  return response.json();
};



// Регистрация пользователя
export const registerUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/register`, { username, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Ошибка регистрации";
  }
};

// Авторизация пользователя
export const loginUser = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || "Ошибка авторизации";
  }
};



export default API;
