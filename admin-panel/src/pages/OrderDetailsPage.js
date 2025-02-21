import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import '../styles/OrderDetailsPage.css';

function OrderDetailsPage() {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/admin/orders/${id}`)
            .then(response => {
                setOrder(response.data);
                setLoading(false);
            })
            .catch(err => {
                setError("Ошибка загрузки заказа");
                setLoading(false);
            });
    }, [id]);

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p>{error}</p>;
    if (!order) return <p>Заказ не найден</p>;

    return (
        <div className="order-details-container">
            <h2>Детали заказа #{order.id}</h2>
            <div className="order-info">
                <p><strong>Адрес:</strong> {order.address}</p>
                <p><strong>Статус:</strong> {order.status}</p>
                <p><strong>Дата создания:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Id создателя:</strong> {order.creatorId}</p>
                <p>
                    <strong>Категория:</strong> {order.category ? order.category.name : 'Не указано'}
                </p>
                <p>
                    <strong>Подкатегория:</strong> {order.subcategory ? order.subcategory.name : 'Не указано'}
                </p>
                <p><strong>Описание:</strong> {order.description}</p>
                <p><strong>Цена:</strong> {order.proposedSum}</p>
                <p><strong>Id исполнителя:</strong> {order.executorId}</p>
            </div>
        </div>

    );
}

export default OrderDetailsPage;
