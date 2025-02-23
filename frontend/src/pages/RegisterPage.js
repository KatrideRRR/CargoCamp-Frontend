import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [captchaValue, setCaptchaValue] = useState(null);

    const handleCaptchaChange = (value) => {
        setCaptchaValue(value);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', { username, phone, password, captchaToken: captchaValue
            });
            const { token } = response.data;
            localStorage.setItem('authToken', token); // Сохраняем токен
            alert('Пользователь успешно создан');
            navigate('/profile'); // Перенаправление на профиль
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Ошибка регистрации');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h1 style={styles.title}>Регистрация</h1>
                {error && <p style={styles.error}>{error}</p>}
                <form onSubmit={handleRegister} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label htmlFor="username" style={styles.label}>Имя пользователя:</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="phone" style={styles.label}>Телефон:</label>
                        <input
                            id="phone"
                            type="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label htmlFor="password" style={styles.label}>Пароль:</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                        />
                    </div>
                    <ReCAPTCHA
                        sitekey="6LeZUOAqAAAAAO8RbiFwH4WsUXxQgt9TUzeGrghl"
                        onChange={handleCaptchaChange}
                    />

                    <button type="submit" disabled={!captchaValue} style={styles.button}>Зарегистрироваться</button>
                </form>
                <p style={styles.loginText}>
                    Уже есть аккаунт?{' '}
                    <span
                        onClick={() => navigate('/login')}
                        style={styles.loginLink}
                    >
                        Войти
                    </span>
                </p>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f2f2f2',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        textAlign: 'center',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#333',
    },
    error: {
        color: 'red',
        marginBottom: '15px',
        fontSize: '14px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
    label: {
        fontSize: '14px',
        marginBottom: '5px',
        color: '#555',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
    button: {
        padding: '10px 20px',
        fontSize: '16px',
        color: '#fff',
        backgroundColor: '#007aff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
    },
    loginText: {
        marginTop: '15px',
        fontSize: '14px',
        color: '#555',
    },
    loginLink: {
        color: '#007aff',
        cursor: 'pointer',
        textDecoration: 'underline',
    },
};

export default RegisterPage;
