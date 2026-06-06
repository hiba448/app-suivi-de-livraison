import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import io from 'socket.io-client';
import L, { LatLng } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import throttle from 'lodash/throttle';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

import { DRIVER_EMAIL_DEFAULT, API_URL, socketEvents } from '../constants';

import {
  IShipment,
  ShipmentStatus,
  IUpdateDALocation,
} from '../types';

import iconDeliveryAssociate from '../assets/icon_delivery_associate.svg';
import iconPickup from '../assets/icon_pickup.svg';
import iconDrop from '../assets/icon_drop.svg';

import DriverDashboard from '../components/DriverDashboard';
import ShipmentDashboard from '../components/ShipmentDashboard';

import './dashboard.css';

// ✅ Centre Rabat
const RABAT_CENTER: [number, number] = [34.0209, -6.8416];

const MAP_INITIAL_VALUES = {
  zoom: 15,
  center: RABAT_CENTER,
  scrollWheelZoom: true,
};

const THROTTLE_DELAY = 50;
const socket = io(API_URL);

const SimulatorDashboard = () => {
  const [shipmentData, setShipmentData] = useState<IShipment>({} as IShipment);
  const [isConnected, setIsConnected] = useState(socket.connected);

  // ✅ IMPORTANT: LatLng dès le départ
  const [position, setPosition] = useState<LatLng>(
    new LatLng(RABAT_CENTER[0], RABAT_CENTER[1])
  );

  useEffect(() => {
    sessionStorage.setItem('driverEmail', DRIVER_EMAIL_DEFAULT);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, []);

  // ✅ Fonction d'envoi (fix principal)
  const gpsUpdate = useCallback((pos: LatLng) => {
    const email = sessionStorage.getItem('driverEmail') || '';

    const data: IUpdateDALocation = {
      email,
      location: {
        type: 'Point',
        coordinates: [pos.lng, pos.lat],
      },
    };

    console.log('✅ UPDATE_DA_LOCATION envoyé', {
      email,
      coordinates: [pos.lng, pos.lat],
    });

    socket.emit(socketEvents.UPDATE_DA_LOCATION, data);
  }, []);

  // ✅ Throttle (comme avant)
  const throttledPositionUpdate = useMemo(
    () =>
      throttle((pos: LatLng) => {
        gpsUpdate(pos);
      }, THROTTLE_DELAY),
    [gpsUpdate]
  );

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-badge">Simulateur livreur</span>
          <h1>Simulation de livraison</h1>
          <p>Déplacez le camion sur la carte de Rabat.</p>
        </div>

        <div className={isConnected ? 'connection online' : 'connection offline'}>
          <span></span>
          {isConnected ? 'Connecté' : 'Déconnecté'}
        </div>
      </div>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-card">
            <DriverDashboard
              socket={socket}
              setShipmentData={setShipmentData}
            />
          </div>

          {shipmentData._id && (
            <div className="dashboard-card">
              <ShipmentDashboard
                shipmentData={shipmentData}
                setShipmentData={setShipmentData}
              />
            </div>
          )}
        </aside>

        <div className="dashboard-map-card">
          <MapContainer
            className="dashboard-map"
            center={MAP_INITIAL_VALUES.center}
            zoom={MAP_INITIAL_VALUES.zoom}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />

            {/* ✅ MARQUEUR LIVREUR */}
            <DraggableDriverMarker
              position={position}
              setPosition={setPosition}
              throttledPositionUpdate={throttledPositionUpdate}
              sendLocation={gpsUpdate} // ✅ IMPORTANT
            />

            {/* Pickup */}
            {shipmentData._id &&
              shipmentData.status !== ShipmentStatus.delivered && (
                <PickUpMarker shipmentData={shipmentData} />
              )}

            {/* Drop */}
            {shipmentData._id &&
              shipmentData.status !== ShipmentStatus.delivered && (
                <DropLocationMarker shipmentData={shipmentData} />
              )}
          </MapContainer>
        </div>
      </div>
    </section>
  );
};

/* ==============================
   DRIVER MARKER ✅ FIX PRINCIPAL
============================== */

interface DriverMarkerProps {
  position: LatLng;
  setPosition: (pos: LatLng) => void;
  throttledPositionUpdate: (pos: LatLng) => void;
  sendLocation: (pos: LatLng) => void;
}

const driverIcon = L.icon({
  iconUrl: iconDeliveryAssociate,
  iconSize: [35, 35],
  popupAnchor: [-3, -20],
  className: 'marker',
});

function DraggableDriverMarker({
  position,
  setPosition,
  throttledPositionUpdate,
  sendLocation,
}: DriverMarkerProps) {
  const markerRef = useRef<L.Marker | null>(null);

  const eventHandlers = useMemo(
    () => ({
      dragstart() {
        console.log('🚚 Drag start');
      },

      drag() {
        const marker = markerRef.current;

        if (marker != null) {
          const newPos = marker.getLatLng();

          console.log('➡️ Drag', newPos);

          throttledPositionUpdate(newPos);
        }
      },

      // ✅ FIX CRUCIAL
      dragend() {
        const marker = markerRef.current;

        if (marker != null) {
          const newPos = marker.getLatLng();

          console.log('✅ Drag end — envoi final', newPos);

          setPosition(newPos);

          // ✅ ENVOI DIRECT (répare tout)
          sendLocation(newPos);
        }
      },
    }),
    [setPosition, throttledPositionUpdate, sendLocation]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
      icon={driverIcon}
    >
      <Popup>Position du livreur</Popup>
    </Marker>
  );
}

/* ==============================
   PICKUP + DROP
============================== */

const pickupIcon = L.icon({
  iconUrl: iconPickup,
  iconSize: [70, 50],
});

const dropIcon = L.icon({
  iconUrl: iconDrop,
  iconSize: [50, 40],
});

const PickUpMarker = ({ shipmentData }: { shipmentData: IShipment }) => {
  const coords = shipmentData?.pickupLocation?.coordinates;

  return Array.isArray(coords) ? (
    <Marker position={[coords[1], coords[0]]} icon={pickupIcon}>
      <Popup>Point de départ</Popup>
    </Marker>
  ) : null;
};

const DropLocationMarker = ({ shipmentData }: { shipmentData: IShipment }) => {
  const coords = shipmentData?.dropLocation?.coordinates;

  return Array.isArray(coords) ? (
    <Marker position={[coords[1], coords[0]]} icon={dropIcon}>
      <Popup>Point d'arrivée</Popup>
    </Marker>
  ) : null;
};

export default SimulatorDashboard;