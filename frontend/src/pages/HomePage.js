import React, { useEffect, useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import axios from 'axios';

const HomePage = () => {
    const [orders, setOrders] = useState([]); // Список заказов

    useEffect(() => {
        // Получаем заказы с сервера
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/orders/all', {
                    params: { status: 'pending' }, // Фильтруем заказы по статусу
                });                const ordersWithCoordinates = response.data.filter(order => order.coordinates); // Фильтруем только заказы с координатами
                setOrders(ordersWithCoordinates);
            } catch (error) {
                console.error('Ошибка загрузки заказов:', error);
            }
        };

        fetchOrders();
    }, []);

    return (
        <YMaps query={{ apikey: "bf97867b-5ffb-4fc4-9fd5-8997874b300e" }}>
            <div style={{ width: '100%', height: '100vh' }}>
                <Map
                    defaultState={{ center: [44.9572, 34.1108], zoom: 10 }}
                    style={{ width: '100%', height: '100%' }}
                >
                    {orders.map((order, index) => {
                        const [latitude, longitude] = order.coordinates.split(',').map(Number);
                        return (
                            <Placemark
                                key={index}
                                geometry={[latitude, longitude]}
                                properties={{
                                    hintContent: `Заказ #${order.id}`,
                                    balloonContent: order.description,
                                }}
                            />
                        );
                    })}
                </Map>
            </div>
        </YMaps>
    );
};

export default HomePage;
