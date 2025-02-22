import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/UsersPage.css"; // Импорт стилей
import { useNavigate } from "react-router-dom";

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const token = localStorage.getItem("authToken");
    const navigate = useNavigate();

    useEffect(() => {
        axios.get("http://localhost:5000/api/admin/users", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((response) => {
                setUsers(response.data);
                setFilteredUsers(response.data);
            })
            .catch((error) => console.error("Ошибка загрузки пользователей", error));
    }, [token]);

    // Функция блокировки пользователя
    const blockUser = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/users/${id}/block`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.map(user => user.id === id ? { ...user, role: "banned" } : user));
            setFilteredUsers(filteredUsers.map(user => user.id === id ? { ...user, role: "banned" } : user));
        } catch (error) {
            console.error("Ошибка блокировки", error);
        }
    };

    // Функция разблокировки пользователя
    const unblockUser = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/users/${id}/unblock`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(users.map(user => user.id === id ? { ...user, role: "user" } : user));
            setFilteredUsers(filteredUsers.map(user => user.id === id ? { ...user, role: "user" } : user));
        } catch (error) {
            console.error("Ошибка разблокировки", error);
        }
    };

    const handleSearch = (e) => {
        const query = e.target.value.toLowerCase();
        setSearchQuery(query);

        if (query.trim() === "") {
            setFilteredUsers(users);
        } else {
            setFilteredUsers(users.filter(user =>
                user.id.toString().includes(query) || user.phone.includes(query)
            ));
        }
    };

    const handleComplaints = (id) => navigate(`/users/${id}/complaints`);
    const handleOrders = (id) => navigate(`/users/${id}/orders`);
    const handlePhotos = (id) => navigate(`/user-documents/${id}`);

    return (
        <div className="users-container">
            <h1>Пользователи</h1>

            <input
                type="text"
                className="search-input"
                placeholder="Поиск по ID или номеру телефона"
                value={searchQuery}
                onChange={handleSearch}
            />

            <table className="users-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Имя</th>
                    <th>Телефон</th>
                    <th>Дата регистрации</th>
                    <th>Рейтинг</th>
                    <th>Действия</th>
                </tr>
                </thead>
                <tbody>
                {filteredUsers.map((user) => (
                    <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.username}</td>
                        <td>{user.phone}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>{user.rating ? user.rating.toFixed(1) : "—"}</td>
                        <td>
                            <div className="action-buttons">
                                <button className="complaints-button" onClick={() => handleComplaints(user.id)}>Жалобы</button>
                                <button className="orders-button" onClick={() => handleOrders(user.id)}>Заказы</button>
                                <button className="photos-button" onClick={() => handlePhotos(user.id)}>Фото</button>

                                {user.role === "banned" ? (
                                    <button className="unblock-button" onClick={() => unblockUser(user.id)}>Разблокировать</button>
                                ) : (
                                    <button className="block-button" onClick={() => blockUser(user.id)}>Заблокировать</button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default UsersPage;
