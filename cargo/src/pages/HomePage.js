import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon from '../images/marker.png';
import { Link } from 'react-router-dom';

// Настройка кастомной иконки
const customIcon = new L.Icon({
  iconUrl: markerIcon,
  iconSize: [20, 25],      // Размер иконки
  iconAnchor: [10, 25],    // Центр иконки
  popupAnchor: [0, -20],   // Смещение попапа
});

// Данные для маркеров
const orders = [
  { id: 1, title: 'Доставить груз', position: [51.505, -0.09] },
  { id: 2, title: 'Перевезти мебель', position: [51.51, -0.1] },
  { id: 3, title: 'Перевозка людей', position: [51.515, -0.11] },
];

// Главный компонент
const HomePage = () => {
  return (
    <div>
      <div style={{ paddingTop: '30px' }}></div>
      {/* Заголовок страницы */}
      <h1 style={{ textAlign: 'center', margin: '20px 0' }}>Home Page</h1>

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
          <Marker key={order.id} position={order.position} icon={customIcon}>
            <Popup>
              <h3>{order.title}</h3>
              <p>Координаты: {order.position.join(', ')}</p>
              <Link to={`/orders/${order.id}`}>Подробнее</Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

    
      
    </div>
  );
};

export default HomePage;
