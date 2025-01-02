import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import MarkerComponent from '../components/MarkerComponent';


// Главный компонент
const HomePage = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/orders');
                setOrders(response.data);
            } catch (error) {
                console.error('Ошибка при загрузке заказов:', error);
            }
        };

        fetchOrders();
    }, []);

    return (
    <div>
      <div style={{ paddingTop: '30px' }}></div>
      {/* Заголовок страницы */}
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Orders Page</h1>

      {/* Карта */}
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: '80vh', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; <a href='http://osm.org/copyright'>OpenStreetMap</a> contributors"
        />
          {orders.map((order) => (
              <MarkerComponent key={order.id} order={order} />
          ))}
      </MapContainer>
    </div>
    );
};


export default HomePage;
