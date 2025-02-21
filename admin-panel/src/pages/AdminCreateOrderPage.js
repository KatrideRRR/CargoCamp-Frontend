import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/AdminCreateOrderPage.css"; // Подключаем стили

function AdminCreateOrderPage() {
    const [userId, setUserId] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [workTime, setWorkTime] = useState("");
    const [proposedSum, setProposedSum] = useState("");
    const [type, setType] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [subcategoryId, setSubcategoryId] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const navigate = useNavigate();
    const token = localStorage.getItem("authToken");

    const handleCreateOrder = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        const orderData = {
            userId: Number(userId),
            address,
            description,
            workTime,
            proposedSum: Number(proposedSum),
            type,
            categoryId: Number(categoryId),
            subcategoryId: Number(subcategoryId),

        };

        try {
            console.log("Отправляем данные:", {
                userId, address, description, workTime, proposedSum, type, categoryId, subcategoryId
            });

            if (!userId || !address) {
                setError("ID пользователя и адрес обязательны!");
                return;
            }

            const response = await axios.post("http://localhost:5000/api/admin/create", orderData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });


            setSuccess("Заказ успешно создан!");
            setUserId("");
            setAddress("");
            setDescription("");
            setWorkTime("");
            setProposedSum("");
            setType("");
            setCategoryId("");
            setSubcategoryId("");

            setTimeout(() => navigate("/orders"), 2000);
        } catch (error) {
            console.error("Ошибка при создании заказа", error);
            setError(error.response?.data?.message || "Ошибка сервера");
        }
    };

    return (
        <div className="create-order-container">
            <h1>Создать заказ</h1>

            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <form onSubmit={handleCreateOrder} encType="multipart/form-data">
                <label>ID пользователя:</label>
                <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} required />

                <label>Адрес:</label>
                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />

                <label>Описание:</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />

                <label>Время работы:</label>
                <input type="text" value={workTime} onChange={(e) => setWorkTime(e.target.value)} required />

                <label>Предложенная сумма:</label>
                <input type="number" value={proposedSum} onChange={(e) => setProposedSum(e.target.value)} required />

                <label>Тип:</label>
                <input type="text" value={type} onChange={(e) => setType(e.target.value)} required />

                <label>ID категории:</label>
                <input type="number" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required />

                <label>ID подкатегории:</label>
                <input type="number" value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} required />

                <button type="submit">Создать заказ</button>
            </form>
        </div>
    );
}

export default AdminCreateOrderPage;
