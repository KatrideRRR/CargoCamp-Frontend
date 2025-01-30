import React, { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import { YMaps, Map, Placemark } from "@pbe/react-yandex-maps";
import "../styles/CreateOrderPage.css";

function CreateOrderPage({ currentUserId }) {
    const [formData, setFormData] = useState({
        description: "",
        address: "",
        workTime: null,
        photoUrl: null,
        proposedSum: "",
        type: "",
    });

    const predefinedTypes = [
        "Вывоз мусора",
        "Переезд",
        "Электрик",
        "Плиточник",
        "Сантехник",
        "Грузчик"
    ];
    const [error, setError] = useState("");
    const [markerPosition, setMarkerPosition] = useState(null);
    const navigate = useNavigate();
    const [suggestions, setSuggestions] = useState([]);
    const currentDate = new Date(); // Текущая дата и время
    const [image, setImage] = useState(null);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const getMinTime = (selectedDate) => {
        if (!selectedDate || selectedDate.toDateString() === currentDate.toDateString()) {
            // Если дата совпадает с сегодняшней или не выбрана, возвращаем текущее время
            return new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate(),
                currentDate.getHours(),
                currentDate.getMinutes()
            );
        } else {
            // Для других дат минимальное время — начало суток
            return new Date(0, 0, 0, 0, 0, 0);
        }
    };

    const handleTypeInputChange = (value) => {
        setFormData({ ...formData, type: value });
        const filteredSuggestions = predefinedTypes.filter((type) =>
            type.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredSuggestions);
    };

    const handleSuggestionClick = (suggestion) => {
        setFormData({ ...formData, type: suggestion });
        setSuggestions([]);
    };

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            alert("Вы не авторизованы! Пожалуйста, войдите в систему.");
            navigate("/login");
        }
    }, [navigate, formData.workTime]);

    const handleAddressChange = async (e) => {
        const address = e.target.value;
        setFormData({ ...formData, address });

        if (address.length > 3) {
            try {
                const response = await fetch(
                    `https://geocode-maps.yandex.ru/1.x/?apikey=bf97867b-5ffb-4fc4-9fd5-8997874b300e&geocode=${encodeURIComponent(
                        address
                    )}&format=json`
                );
                const data = await response.json();
                const coordinates =
                    data.response.GeoObjectCollection.featureMember[0]?.GeoObject.Point.pos
                        .split(" ")
                        .map(Number);

                if (coordinates) {
                    setMarkerPosition([coordinates[1], coordinates[0]]);
                }
            } catch (err) {
                console.error("Ошибка геокодирования:", err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            data.append(key, formData[key]);
        });
        if (image) {
            data.append('image', image); // Добавляем фото
        }

        const form = new FormData();
        form.append("userId", currentUserId);
        form.append("description", formData.description);
        form.append("address", formData.address);
        form.append("workTime", formData.workTime);
        form.append("photo", formData.photo);
        form.append("proposedSum", formData.proposedSum);
        form.append("coordinates", markerPosition.join(","));
        form.append("type", formData.type);

        const token = localStorage.getItem("authToken");
        if (!token) {
            setError("Вы не авторизованы! Пожалуйста, войдите в систему.");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/orders/",data,{
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            alert("Заказ успешно создан");
            navigate("/orders");
        } catch (err) {
            console.error("Ошибка при создании заказа:", err);
            setError("Не удалось создать заказ. Попробуйте снова.");
        }
    };

    const handleDescriptionChange = (e) => {
        const textarea = e.target;
        textarea.style.height = "auto"; // Сброс высоты
        textarea.style.height = `${textarea.scrollHeight}px`; // Установка высоты на основе контента
        setFormData({ ...formData, description: textarea.value });
    };

    return (
        <YMaps query={{ apikey: "bf97867b-5ffb-4fc4-9fd5-8997874b300e" }}>
            <div className="container">
                <div className="form-container">
                    {error && <p className="error-text">{error}</p>}
                    <form onSubmit={handleSubmit} className="form">
                        <div className="input-group">
                            <label className="label">Тип заказа</label>
                            <input
                                className="input"
                                type="text"
                                value={formData.type}
                                onChange={(e) => handleTypeInputChange(e.target.value)}
                                placeholder="Введите тип заказа..."
                                required
                            />
                            {suggestions.length > 0 && (
                                <ul className="suggestions">
                                    {suggestions.map((suggestion, index) => (
                                        <li
                                            key={index}
                                            className="suggestion-item"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            {suggestion}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="input-group">
                            <label className="label">Описание работы</label>
                            <textarea
                                className="textarea"
                                placeholder="Введите описание работы"
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                rows="3" // Начальная высота
                            />
                        </div>

                        <div className="input-group">
                            <label className="label">Адрес</label>
                            <input
                                className="input"
                                type="text"
                                placeholder="Введите адрес"
                                value={formData.address}
                                onChange={handleAddressChange}
                                required
                            />
                        </div>

                        <div className="map-container">
                            <Map
                                defaultState={{center: [44.9572, 34.1108], zoom: 10}}
                                style={{width: "100%", height: "300px"}}
                            >
                                {markerPosition && <Placemark geometry={markerPosition}/>}
                            </Map>
                        </div>

                        <div className="input-row">
                            <div className="input-group date-picker">
                                <label className="label">Дата и время</label>
                                <DatePicker
                                    selected={formData.workTime}
                                    onChange={(date) => setFormData({...formData, workTime: date})}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={15}
                                    dateFormat="Pp"
                                    placeholderText="Выберите дату и время"
                                    minDate={new Date()}
                                    minTime={getMinTime(formData.workTime)}
                                    maxTime={new Date(0, 0, 0, 23, 59, 59)}
                                    className="input"
                                    portalId="date-picker-portal"
                                    popperProps={{
                                        modifiers: [
                                            {
                                                name: "preventOverflow",
                                                options: {
                                                    boundary: "viewport",
                                                },
                                            },
                                            {
                                                name: "offset",
                                                options: {
                                                    offset: [0, 8],
                                                },
                                            },
                                        ],
                                    }}
                                />


                            </div>
                            <div className="input-group">
                                <label className="label">Предложенная сумма</label>
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Введите сумму"
                                    value={formData.proposedSum}
                                    onChange={(e) =>
                                        setFormData({...formData, proposedSum: e.target.value})
                                    }
                                    required
                                />
                            </div>
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} required /> {/* Поле для фото */}
                        <button type="submit" className="submit-button">
                            Создать заказ
                        </button>
                    </form>
                </div>
            </div>
        </YMaps>
    );
}

export default CreateOrderPage;