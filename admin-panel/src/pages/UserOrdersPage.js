import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Добавляем useNavigate
import axios from "axios";
import "../styles/UserOrdersPage.css"; // Подключаем стили

function UserOrdersPage() {
    const { userId } = useParams(); // Получаем ID пользователя из URL
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("authToken");
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredOrders, setFilteredOrders] = useState([]);
    const navigate = useNavigate(); // Для перехода на другую страницу

    useEffect(() => {
        axios.get(`http://localhost:5000/api/admin/users/${userId}/orders`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                setOrders(response.data.orders || []);
                setFilteredOrders(response.data.orders || []);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Ошибка загрузки заказов", error);
                setError("Не удалось загрузить заказы");
                setLoading(false);
            });
    }, [userId, token]);

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query.trim() === "") {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order =>
                order.id.toString().includes(query)
            ));
        }
    };

    const handleOrderDetails = (orderId) => {
        navigate(`/orders/${orderId}`); // Переход к деталям заказа
    };
    const deleteOrder = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/admin/orders/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setOrders(orders.filter(order => order.id !== id));
            setFilteredOrders(filteredOrders.filter(order => order.id !== id));
        } catch (error) {
            console.error("Ошибка удаления заказа", error);
            alert("Не удалось удалить заказ");
        }
    };

    if (loading) return <p>Загрузка...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;

    return (
        <div className="orders-container">
            <h1>Заказы пользователя (ID: {userId})</h1>
            <input
                type="text"
                className="search-input"
                placeholder="Поиск по ID заказа"
                value={searchQuery}
                onChange={handleSearch}
            />

            {filteredOrders.length === 0 ? (
                <p>У пользователя нет заказов.</p>
            ) : (
                <table className="orders-table">
                    <thead>
                    <tr>
                        <th>ID заказа</th>
                        <th>Дата создания</th>
                        <th>Статус</th>
                        <th>Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filteredOrders.map((order) => (
                        <tr key={order.id}>
                            <td>{order.id}</td>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td>{order.status}</td>
                            <td>
                                <button onClick={() => handleOrderDetails(order.id)}>
                                    Подробнее
                                </button>
                                <button className="delete-button" onClick={() => deleteOrder(order.id)}>
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UserOrdersPage;
