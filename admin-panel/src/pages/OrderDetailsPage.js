import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

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
        <div>
            <h2>Детали заказа #{order.id}</h2>
            <p><strong>Адрес:</strong> {order.address}</p>
            <p><strong>Статус:</strong> {order.status}</p>
            <p><strong>Дата создания:</strong> {new Date(order.createdAt).toLocaleString()}</p>
        </div>
    );
}

export default OrderDetailsPage;
