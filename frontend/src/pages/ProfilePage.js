import React, {  useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../utils/authContext";
import axios from "axios";
import '../styles/ProfilePage.css';  // Импортируем CSS файл

const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { logout, isAuthenticated } = useAuth();

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
                    setLoading(false);
                }
            } catch (err) {
                console.error('Ошибка:', err.response?.status, err.message);
                if (isMounted) {
                    setError('Не удалось загрузить данные профиля.');
                    setLoading(false);
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
        logout();
        navigate('/login');
    };

    const handleUploadDocuments = () => {
        navigate('/upload-documents');
    };

    const handleMyComplaints = () => {
        if (profile) {
            navigate(`/complaints/${profile.id}`);
        }
    };
    const handleOrderHistory = () => {
        if (profile) {
            navigate(`/orders-history/${profile.id}`);
        }
    };
    // Функция рендера звездочек
    const renderStars = (rating) => {
        const maxStars = 5;
        const fullStar = '★';
        const emptyStar = '☆';
        return fullStar.repeat(Math.round(rating)) + emptyStar.repeat(maxStars - Math.round(rating));
    };


    if (loading) {
        return <div className="loading-container">Загрузка данных профиля...</div>;
    }

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
                            <h2 className="subtitle">ID пользователя:</h2>
                            <p className="info">{profile.id}</p>
                        </div>
                        <div className="section">
                            <h2 className="subtitle">Рейтинг:</h2>
                            <p className="info rating">{profile.rating ? renderStars(profile.rating) : 'Нет рейтинга'}</p>
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

                        {/* Кнопка "Мои жалобы" */}
                        <button onClick={handleMyComplaints} className="complaints-button">
                            Мои жалобы
                        </button>
                        {/* Кнопка "История заказов" */}
                        <button onClick={handleOrderHistory} className="history-button">
                            История заказов
                        </button>


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
