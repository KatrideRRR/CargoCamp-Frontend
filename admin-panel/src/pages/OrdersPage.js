import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        axios.get("http://localhost:5000/api/admin/orders", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => setOrders(response.data))
            .catch((error) => console.error("Ошибка загрузки заказов", error));
    }, [token]);

    const deleteOrder = async (id) => {
        await axios.delete(`http://localhost:5000/api/admin/orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(orders.filter(order => order.id !== id));
    };

    return (
        <div>
            <h1>Заказы</h1>
            <ul>
                {orders.map((order) => (
                    <li key={order.id}>
                        <Link to={`/orders/${order.id}`}>
                        {order.id} - {order.status}
                        </Link>

                        <button onClick={() => deleteOrder(order.id)}>Удалить</button>

                    </li>
                ))}
            </ul>
        </div>
    );
}

export default OrdersPage;
