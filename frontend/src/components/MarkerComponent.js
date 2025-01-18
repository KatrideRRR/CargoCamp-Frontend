import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import customMarkerImage from "../images/marker.png";

const customIcon = L.icon({
    iconUrl: customMarkerImage,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const MarkerComponent = ({ order }) => {
    if (!order || !order.latitude || !order.longitude) {
        return null;
    }

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
