import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import '../styles/UserComplaintsPage.css';

const UserComplaintsPage = () => {
    const { userId } = useParams(); // Получаем ID пользователя из URL
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserComplaints = async () => {
            try {
                const response = await axiosInstance.get(`/auth/user/${userId}`);
                setUser(response.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Ошибка загрузки данных');
            }
        };

        fetchUserComplaints();
    }, [userId]);

    if (error) {
        return <div className="error-message">Ошибка: {error}</div>;
    }

    if (!user) {
        return <div className="loading-message">Загрузка...</div>;
    }

    return (
        <div className="complaints-container">
            <h1>Жалобы на пользователя {user.username} (ID: {user.id})</h1>
            <p><strong>Количество жалоб:</strong> {user.complaintsCount}</p>
            {user.complaints && user.complaints.length > 0 ? (
                <ul className="complaints-list">
                    {user.complaints.map((complaint, index) => (
                        <li key={index} className="complaint-item">
                            <p><strong>Дата:</strong> {new Date(complaint.date).toLocaleString()}</p>
                            <p><strong>Текст жалобы:</strong> {complaint.complaintText}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Жалоб пока нет.</p>
            )}
            {/* Кнопка для перехода на страницу заказов */}
            <Link to={`/user-orders/${user.id}`} className="view-orders-button">
                Посмотреть заказы этого пользователя
            </Link>


        </div>
    );
};

export default UserComplaintsPage;
