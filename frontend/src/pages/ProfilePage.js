import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useAuth} from "../utils/authContext";
import axios from "axios";


const ProfilePage = () => {
    const [profile, setProfile] = useState(null);
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
            <div style={styles.errorContainer}>
                <p style={styles.errorText}>{error}</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.profileContainer}>
                <button onClick={handleLogout} style={styles.logoutButton}>
                    Выйти
                </button>
                {profile ? (
                    <>
                        <div style={styles.section}>
                            <h2 style={styles.subtitle}>Имя пользователя:</h2>
                            <p style={styles.info}>{profile.username}</p>
                        </div>
                        <div style={styles.section}>
                            <h2 style={styles.subtitle}>Email:</h2>
                            <p style={styles.info}>{profile.email}</p>
                        </div>
                        <div style={styles.section}>
                            <h2 style={styles.subtitle}>Рейтинг:</h2>
                            <p style={styles.info}>{profile.rating || 'Нет рейтинга'}</p>
                        </div>
                        <div style={styles.section}>
                            <h2 style={styles.subtitle}>История заказов:</h2>
                            <ul style={styles.orderList}>
                                {profile.orders && profile.orders.length > 0 ? (
                                    profile.orders.map((order) => (
                                        <li key={order.id} style={styles.orderItem}>
                                            {order.description} — {order.status || 'В ожидании'}
                                        </li>
                                    ))
                                ) : (
                                    <li style={styles.info}>Нет заказов</li>
                                )}
                            </ul>
                        </div>
                        <div style={styles.section}>
                            <h2 style={styles.subtitle}>Верификация:</h2>
                            <p style={styles.info}>
                                {profile.verified ? 'Пройдена' : 'Не пройдена'}
                            </p>
                            {!profile.verified && (
                                <button
                                    onClick={handleUploadDocuments}
                                    style={styles.uploadButton}
                                >
                                    Загрузить документы
                                </button>
                            )}
                        </div>
                    </>
                ) : (
                    <p style={styles.info}>Загрузка данных профиля...</p>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f2f2f2',
        padding: '20px',
    },
    profileContainer: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '500px',
        textAlign: 'center',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#333',
    },
    subtitle: {
        fontSize: '18px',
        marginBottom: '10px',
        color: '#555',
    },
    section: {
        marginBottom: '20px',
    },
    info: {
        fontSize: '16px',
        color: '#777',
    },
    orderList: {
        listStyleType: 'none',
        padding: 0,
        margin: 0,
    },
    orderItem: {
        marginBottom: '10px',
        fontSize: '16px',
        color: '#555',
    },
    logoutButton: {
        backgroundColor: '#ff4d4f',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        marginBottom: '20px',
    },
    uploadButton: {
        backgroundColor: '#007aff',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    errorContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f2f2f2',
    },
    errorText: {
        color: 'red',
        fontSize: '18px',
    },
};

export default ProfilePage;