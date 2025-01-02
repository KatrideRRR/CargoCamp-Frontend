import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import customMarkerImage from '../images/marker.png';


const customIcon = L.icon({
    iconUrl: customMarkerImage, // путь к вашей картинке
    iconSize: [32, 32], // размеры иконки
    iconAnchor: [16, 32], // точка привязки (центр внизу)
    popupAnchor: [0, -32], // точка привязки попапа
});



const MarkerComponent = ({ order }) => {
    const { latitude, longitude, description, status } = order;

    return (
        <Marker position={[latitude, longitude]} icon={customIcon}>
            <Popup>
                <strong>{description}</strong>
                <br />
                Статус: {status}
            </Popup>
        </Marker>
    );
};

export default MarkerComponent;
