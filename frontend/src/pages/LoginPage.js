import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/authContext';
import { useUser } from '../utils/userContext';
import '../styles/LoginPage.css';  // Подключаем CSS файл

const LoginPage = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setCurrentUser } = useUser(); // Извлечение setCurrentUser из контекста

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', { phone, password });
            const { token, user } = response.data;
            localStorage.setItem('authToken', token);
            login(token); // Сохраняем новый токен
            setCurrentUser(user);
            navigate('/profile');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка авторизации');
        }
    };

    return (
        <div className="container">
            <div className="formContainer">
                <h1 className="title">Войти в аккаунт</h1>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleLogin} className="form">
                    <div className="inputGroup">
                        <label htmlFor="phone" className="label">Телефон:</label>
                        <input
                            id="phone"
                            type="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                    <div className="inputGroup">
                        <label htmlFor="password" className="label">Пароль:</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input"
                        />
                    </div>
                    <button type="submit" className="button">Войти</button>
                </form>
                <p className="registerText">
                    Нет аккаунта?{' '}
                    <span
                        onClick={() => navigate('/register')}
                        className="registerLink"
                    >
                        Зарегистрироваться
                    </span>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;