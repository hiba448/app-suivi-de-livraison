import { useEffect, useState, useReducer } from 'react';
import io from 'socket.io-client';
import { LatLng } from 'leaflet';
import { Point } from 'geojson';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import UserInfo from '../components/UserInfo';
import DraggableMarker from '../components/DraggableMarker';
import ShipmentInfo from '../components/ShipmentInfo';

import {
  DashboardStatus,
  State,
  IAction,
  IShipment,
  ShipmentStatus,
} from '../types';

import {
  USER_EMAIL_DEFAULT,
  pickupMarkerIcon,
  dropMarkerIcon,
  driverMarkerIcon,
  API_URL,
  socketEvents,
  ACTIONS,
} from '../constants';

import { createShipment } from '../api';
import './dashboard.css';

const socket = io(API_URL);

const RABAT_CENTER: [number, number] = [34.0209, -6.8416];

const initialState: State = {
  pickupLocation: new LatLng(34.0209, -6.8416),
  isPickupDraggable: false,
  isShowPickupMarker: false,
  dropLocation: new LatLng(34.0267, -6.8326),
  isDropDraggable: false,
  isShowDropMarker: false,
  driverLocation: null,
  dashboardStatus: DashboardStatus.NO_SHIPMENT,
};

/* ==============================
   REDUCER
============================== */

function reducer(state: State, action: IAction): State {
  switch (action.type) {
    case ACTIONS.NEW_DELIVERY_CLICKED:
      return {
        ...state,
        isPickupDraggable: true,
        isShowPickupMarker: true,
        dashboardStatus: DashboardStatus.SHIPMENT_INITIATED,
      };

    case ACTIONS.SET_DRIVER_LOCATION:
      return { ...state, driverLocation: action.payload.position };

    case ACTIONS.SET_PICKUP_LOCATION:
      return { ...state, pickupLocation: action.payload.position };

    case ACTIONS.SET_DROP_LOCATION:
      return { ...state, dropLocation: action.payload.position };

    case ACTIONS.PICKUP_SELECTED:
      return {
        ...state,
        isPickupDraggable: false,
        isDropDraggable: true,
        isShowDropMarker: true,
        dashboardStatus: DashboardStatus.PICKUP_SELECTED,
      };

    case ACTIONS.DROP_SELECTED:
      return { ...state, isDropDraggable: false, dashboardStatus: DashboardStatus.DROP_SELECTED };

    case ACTIONS.ASSOCIATE_ASSIGNED:
      return { ...state, dashboardStatus: DashboardStatus.ASSOCIATE_ASSIGNED };

    case ACTIONS.PICKUP_LOCATION_REACHED:
      return { ...state, dashboardStatus: DashboardStatus.PICKUP_LOCATION_REACHED };

    case ACTIONS.TRANSPORTING:
      return { ...state, dashboardStatus: DashboardStatus.TRANSPORTING };

    case ACTIONS.DROP_LOCATION_REACHED:
      return { ...state, dashboardStatus: DashboardStatus.DROP_LOCATION_REACHED };

    case ACTIONS.DELIVERED:
      return { ...state, dashboardStatus: DashboardStatus.DELIVERED };

    case ACTIONS.CANCELLED:
      return { ...initialState };

    default:
      return state;
  }
}

/* ==============================
   STATUS MAPPER
============================== */

const shipmentStatusActionMapper: Record<ShipmentStatus, IAction> = {
  requested: { type: 'Default' },
  deliveryAssociateAssigned: { type: ACTIONS.ASSOCIATE_ASSIGNED },
  pickupLocationReached: { type: ACTIONS.PICKUP_LOCATION_REACHED },
  transporting: { type: ACTIONS.TRANSPORTING },
  dropLocationReached: { type: ACTIONS.DROP_LOCATION_REACHED },
  delivered: { type: ACTIONS.DELIVERED },
  cancelled: { type: ACTIONS.CANCELLED },
};

/* ==============================
   COMPONENT
============================== */

const UserDashboard = () => {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    sessionStorage.setItem('userEmail', USER_EMAIL_DEFAULT);

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    /* ✅ DRIVER LOCATION STREAM */
    socket.on(socketEvents.DA_LOCATION_CHANGED, (data) => {
      console.log('🚚 DA_LOCATION_CHANGED reçu côté user :', data);

      try {
        const coords = data?.currentLocation?.coordinates;

        if (Array.isArray(coords) && coords.length === 2) {
          const lat = coords[1];
          const lng = coords[0];

          dispatch({
            type: ACTIONS.SET_DRIVER_LOCATION,
            payload: { position: new LatLng(lat, lng) },
          });
        }
      } catch (error) {
        console.error(error);
      }
    });

    /* ✅ SHIPMENT UPDATE (CRUCIAL) */
    socket.on(socketEvents.SHIPMENT_UPDATED, (data: IShipment) => {
      console.log('📦 SHIPMENT_UPDATED reçu côté user :', data);

      try {
        if (data.deliveryAssociateId) {
          console.log('✅ SUBSCRIBE_TO_DA', data.deliveryAssociateId);

          socket.emit(socketEvents.SUBSCRIBE_TO_DA, {
            deliveryAssociateId: data.deliveryAssociateId,
          });
        } else {
          console.log('❌ PAS DE deliveryAssociateId');
        }

        if (data.status) {
          dispatch(shipmentStatusActionMapper[data.status]);
        }
      } catch (error) {
        console.error(error);
      }
    });

    return () => {
      socket.off(socketEvents.DA_LOCATION_CHANGED);
      socket.off(socketEvents.SHIPMENT_UPDATED);
    };
  }, []);

  /* ==============================
     HANDLERS
  ============================== */

  const setPickupLocation = (pos: LatLng) =>
    dispatch({ type: ACTIONS.SET_PICKUP_LOCATION, payload: { position: pos } });

  const setDropLocation = (pos: LatLng) =>
    dispatch({ type: ACTIONS.SET_DROP_LOCATION, payload: { position: pos } });

  const onNewDeliveryClick = () =>
    dispatch({ type: ACTIONS.NEW_DELIVERY_CLICKED });

  const onPickupSelected = () =>
    dispatch({ type: ACTIONS.PICKUP_SELECTED });

  const onDropSelected = async () => {
    try {
      dispatch({ type: ACTIONS.DROP_SELECTED });

      const pickupPoint: Point = {
        type: 'Point',
        coordinates: [state.pickupLocation.lng, state.pickupLocation.lat],
      };

      const dropPoint: Point = {
        type: 'Point',
        coordinates: [state.dropLocation.lng, state.dropLocation.lat],
      };

      const res = await createShipment(pickupPoint, dropPoint);
      const shipment = res.data;

      console.log('📦 Shipment créé :', shipment);

      socket.emit(socketEvents.SUBSCRIBE_TO_SHIPMENT, {
        shipmentId: shipment._id,
      });
    } catch (error) {
      console.error(error);
    }
  };

  /* ==============================
     RENDER
  ============================== */

  return (
    <section className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <span className="dashboard-badge">Espace utilisateur</span>
          <h1>Suivi de livraison</h1>
        </div>

        <div className={isConnected ? 'connection online' : 'connection offline'}>
          <span></span>
          {isConnected ? 'Connecté' : 'Déconnecté'}
        </div>
      </div>

      <div className="dashboard-layout">
        <aside className="dashboard-sidebar">
          <div className="dashboard-card">
            <UserInfo />
          </div>

          <div className="dashboard-card">
            <ShipmentInfo dashboardStatus={state.dashboardStatus} />
          </div>

          <div className="dashboard-card">
            {state.dashboardStatus === DashboardStatus.NO_SHIPMENT && (
              <button className="primary-btn" onClick={onNewDeliveryClick}>
                Nouvelle livraison
              </button>
            )}

            {state.dashboardStatus === DashboardStatus.SHIPMENT_INITIATED && (
              <button className="primary-btn" onClick={onPickupSelected}>
                Confirmer départ
              </button>
            )}

            {state.dashboardStatus === DashboardStatus.PICKUP_SELECTED && (
              <button className="primary-btn" onClick={onDropSelected}>
                Confirmer arrivée
              </button>
            )}
          </div>
        </aside>

        <div className="dashboard-map-card">
          <MapContainer center={RABAT_CENTER} zoom={14} className="dashboard-map">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {state.isShowPickupMarker && (
              <DraggableMarker
                isDraggable={state.isPickupDraggable}
                position={state.pickupLocation}
                setPosition={setPickupLocation}
                markerIcon={pickupMarkerIcon}
                markerName="Pickup-marker"
              />
            )}

            {state.isShowDropMarker && (
              <DraggableMarker
                isDraggable={state.isDropDraggable}
                position={state.dropLocation}
                setPosition={setDropLocation}
                markerIcon={dropMarkerIcon}
                markerName="Drop-marker"
              />
            )}

            {state.driverLocation && (
              <DraggableMarker
                isDraggable={false}
                position={state.driverLocation}
                markerIcon={driverMarkerIcon}
                markerName="Driver-marker"
              />
            )}
          </MapContainer>
        </div>
      </div>
    </section>
  );
};

export default UserDashboard;
