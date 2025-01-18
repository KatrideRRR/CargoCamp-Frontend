import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000/api', // Укажите базовый URL вашего API
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken'); // Берём токен из локального хранилища
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Добавляем токен в заголовки
        }
        return config;
    },
    (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && error.response.data.message === 'Токен истёк' && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const refreshResponse = await axios.post('http://localhost:5000/api/token', { token: refreshToken });
                const newAccessToken = refreshResponse.data.accessToken;

                localStorage.setItem('authToken', newAccessToken); // Обновляем токен
                axiosInstance.defaults.headers['Authorization'] = `Bearer ${newAccessToken}`; // Добавляем в заголовки

                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`; // Повторяем запрос с новым токеном
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                console.error('Ошибка обновления токена:', refreshError);
                localStorage.removeItem('authToken'); // Удаляем токен
                localStorage.removeItem('refreshToken');
                window.location.href = '/login'; // Переадресация на страницу входа
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
