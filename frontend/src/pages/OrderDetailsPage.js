import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderDetailsPage = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/order/${id}`);
                setOrder(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка загрузки деталей заказа');
            }
        };

        fetchOrderDetails();
    }, [id]);

    const handleTakeOrder = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            await axios.post(`http://localhost:5000/api/order/${id}/take`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            navigate('/active-orders'); // Переход на страницу активных заказов
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка при взятии заказа в работу');
        } finally {
            setLoading(false);
        }
    };


    if (error) {
        return (
            <div style={styles.errorContainer}>
                <p style={styles.errorText}>Ошибка: {error}</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={styles.loadingContainer}>
                <p style={styles.loadingText}>Загрузка...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.detailsContainer}>
                <h1 style={styles.title}>Детали заказа</h1>
                <div style={styles.section}>
                    <h2 style={styles.subtitle}>Адрес:</h2>
                    <p style={styles.info}>{order.address}</p>
                </div>
                <div style={styles.section}>
                    <h2 style={styles.subtitle}>Описание:</h2>
                    <p style={styles.info}>{order.description}</p>
                </div>
                <div style={styles.section}>
                    <h2 style={styles.subtitle}>Дата выполнения:</h2>
                    <p style={styles.info}>
                        {new Date(order.workTime).toLocaleString()}
                    </p>
                </div>
                <div style={styles.section}>
                    <h2 style={styles.subtitle}>Статус:</h2>
                    <p style={styles.info}>{order.status || 'Не указан'}</p>
                </div>
                {order.photoUrl && (
                    <div style={styles.section}>
                        <h2 style={styles.subtitle}>Фото заказа:</h2>
                        <img
                            src={order.photoUrl}
                            alt="Фото заказа"
                            style={styles.image}
                        />
                    </div>
                )}
                <button
                    style={styles.takeOrderButton}
                    onClick={handleTakeOrder}
                    disabled={loading || order.status !== 'Открыт'}
                >
                    {loading ? 'Обработка...' : 'Взять в работу'}
                </button>
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
    detailsContainer: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '600px',
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
    image: {
        maxWidth: '100%',
        borderRadius: '10px',
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
    loadingContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f2f2f2',
    },
    loadingText: {
        fontSize: '18px',
        color: '#777',
    },
};

export default OrderDetailsPage;
