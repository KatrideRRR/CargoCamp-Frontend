import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const HomePage = () => {
  const [position] = useState([51.505, -0.09]);

  return (
    <div style={{ height: '100vh' }}>
      <MapContainer center={position} zoom={13} style={{ height: '90%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
      </MapContainer>
    </div>
  );
};

export default HomePage;
