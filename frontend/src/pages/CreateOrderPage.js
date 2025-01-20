import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

function CreateOrderPage({ currentUserId }) {
    const [formData, setFormData] = useState({
        description: '',
        address: '',
        workTime: '',
        photo: null,
        proposedSum: ''
    });

    const [error, setError] = useState('');
    const [markerPosition, setMarkerPosition] = useState(null); // Для хранения координат маркера
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            alert('Вы не авторизованы! Пожалуйста, войдите в систему.');
            navigate('/login');
        }
    }, [navigate]);

    const handleAddressChange = async (e) => {
        const address = e.target.value;
        setFormData({ ...formData, address });

        if (address.length > 3) {
            try {
                const response = await fetch(
                    `https://geocode-maps.yandex.ru/1.x/?apikey=bf97867b-5ffb-4fc4-9fd5-8997874b300e&geocode=${encodeURIComponent(address)}&format=json`
                );
                const data = await response.json();
                const coordinates =
                    data.response.GeoObjectCollection.featureMember[0]?.GeoObject.Point.pos.split(' ').map(Number);

                if (coordinates) {
                    setMarkerPosition([coordinates[1], coordinates[0]]); // Переключение порядка координат
                }
            } catch (err) {
                console.error('Ошибка геокодирования:', err);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('userId', currentUserId);
        form.append('description', formData.description);
        form.append('address', formData.address);
        form.append('workTime', formData.workTime);
        form.append('photo', formData.photo);
        form.append('proposedSum', formData.proposedSum);
        form.append('coordinates', markerPosition.join(','));

        const token = localStorage.getItem('authToken');
        if (!token) {
            setError('Вы не авторизованы! Пожалуйста, войдите в систему.');
            console.error('Токен отсутствует в localStorage');
            return;
        }

        try {
            console.log('Токен:', token);
            await axios.post('http://localhost:5000/api/orders', form, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`,
                },
            });
            alert('Заказ успешно создан');
            navigate('/orders'); // Перенаправление после успешного создания заказа
        } catch (err) {
            console.error('Ошибка при создании заказа:', err);
            setError('Не удалось создать заказ. Попробуйте снова.');
        }
    };

    return (
        <YMaps query={{ apikey: 'bf97867b-5ffb-4fc4-9fd5-8997874b300e\n' }}>
            <div style={styles.container}>
                <div style={styles.formContainer}>
                    <h1 style={styles.title}>Создать заказ</h1>
                    {error && <p style={styles.errorText}>{error}</p>}
                    <form onSubmit={handleSubmit} style={styles.form}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Описание работы</label>
                            <textarea
                                style={styles.textarea}
                                placeholder="Введите описание работы"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Адрес</label>
                            <input
                                style={styles.input}
                                type="text"
                                placeholder="Введите адрес"
                                value={formData.address}
                                onChange={handleAddressChange}
                                required
                            />
                        </div>
                        <div style={styles.mapContainer}>
                            <Map
                                defaultState={{ center: [44.9572, 34.1108], zoom: 10 }}
                                style={{ width: '100%', height: '300px' }}
                            >
                                {markerPosition && <Placemark geometry={markerPosition} />}
                            </Map>
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Дата и время выполнения</label>
                            <input
                                style={styles.input}
                                type="datetime-local"
                                value={formData.workTime}
                                onChange={(e) =>
                                    setFormData({ ...formData, workTime: e.target.value })
                                }
                                required
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Фото</label>
                            <input
                                style={styles.input}
                                type="file"
                                onChange={(e) =>
                                    setFormData({ ...formData, photo: e.target.files[0] })
                                }
                            />
                        </div>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Предложенная сумма</label>
                            <input
                                style={styles.input}
                                type="number"
                                placeholder="Введите сумму"
                                value={formData.proposedSum}
                                onChange={(e) =>
                                    setFormData({ ...formData, proposedSum: e.target.value })
                                }
                                required
                            />
                        </div>
                        <button type="submit" style={styles.submitButton}>
                            Создать заказ
                        </button>
                    </form>
                </div>
            </div>
        </YMaps>
    );
}


const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f2f2f2',
        padding: '20px',
    },
    formContainer: {
        backgroundColor: '#fff',
        padding: '30px',
        borderRadius: '10px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '500px',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        textAlign: 'center',
        color: '#333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
    },
    inputGroup: {
        marginBottom: '20px',
    },
    label: {
        fontSize: '16px',
        marginBottom: '5px',
        color: '#555',
    },
    input: {
        width: '100%',
        padding: '10px',
        fontSize: '14px',
        border: '1px solid #ccc',
        borderRadius: '5px',
    },
    textarea: {
        width: '100%',
        padding: '10px',
        fontSize: '14px',
        border: '1px solid #ccc',
        borderRadius: '5px',
        minHeight: '100px',
        resize: 'vertical',
    },
    submitButton: {
        backgroundColor: '#007aff',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
    },
    errorText: {
        color: 'red',
        fontSize: '14px',
        marginBottom: '10px',
    },
    mapContainer: {
        width: '100%',
        height: '300px',
        marginBottom: '20px',
    },
};

export default CreateOrderPage;
