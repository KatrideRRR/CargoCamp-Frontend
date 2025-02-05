import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../utils/authContext";
import axios from "axios";
import { ModalContext } from '../utils/modalContext';
import '../styles/ProfilePage.css';  // Импортируем CSS файл

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { logout, isAuthenticated } = useAuth();
    const { openModal } = useContext(ModalContext);

    useEffect(() => {
        let isMounted = true;

        const fetchProfileData = async () => {
            const token = localStorage.getItem('authToken');
            console.log('Токен на странице профиля:', token);

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const response = await axios.get('http://localhost:5000/api/auth/profile', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log('Данные профиля:', response.data);

                if (isMounted) {
                    setProfile(response.data);
                }
                navigate('/profile');
            } catch (err) {
                console.error('Ошибка:', err.response?.status, err.message);
                if (isMounted) {
                    setError('Не удалось загрузить данные профиля.');
                    navigate('/login');
                }
            }
        };

        fetchProfileData();

        return () => {
            isMounted = false;
        };
    }, [isAuthenticated, navigate]);

    const handleLogout = () => {
        logout(); // Удаляем токен и сбрасываем состояние авторизации
        navigate('/login');
    };

    const handleUploadDocuments = () => {
        navigate('/upload-documents');
    };

    if (error) {
        return (
            <div className="error-container">
                <p className="error-text">{error}</p>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="profile-container">
                {profile ? (
                    <>
                        <div className="section">
                            <h2 className="subtitle">Имя пользователя:</h2>
                            <p className="info">{profile.username}</p>
                        </div>
                        <div className="section">
                            <h2 className="subtitle">Рейтинг:</h2>
                            <p className="info">{profile.rating || 'Нет рейтинга'}</p>
                        </div>
                        <div className="section">
                            <h2 className="subtitle">История заказов:</h2>
                            <ul className="order-list">
                                {profile.orders && profile.orders.length > 0 ? (
                                    profile.orders.map((order) => (
                                        <li key={order.id} className="order-item">
                                            {order.description} — {order.status || 'В ожидании'}
                                        </li>
                                    ))
                                ) : (
                                    <li className="info">Нет заказов</li>
                                )}
                            </ul>
                        </div>
                        <div className="section">
                            <h2 className="subtitle">Верификация:</h2>
                            <p className="info">
                                {profile.verified ? 'Пройдена' : 'Не пройдена'}
                            </p>
                            {!profile.verified && (
                                <button
                                    onClick={handleUploadDocuments}
                                    className="upload-button"
                                >
                                    Загрузить документы
                                </button>
                            )}
                        </div>
                        <button onClick={handleLogout} className="logout-button">
                            Выйти
                        </button>
                    </>
                ) : (
                    <p className="info">Загрузка данных профиля...</p>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;
