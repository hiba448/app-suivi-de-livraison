import { useEffect, useState } from 'react';

import ShipmentRequest from './ShipmentRequest';
import { socketEvents } from '../constants';
import { IShipment, ShipmentStatus } from '../types';
import { updateShipmentStatus, updateShipmentDeliveryAssociate } from '../api';

type Props = {
  socket: any;
  setShipmentData: any;
};

const DriverDashboard = (props: Props) => {
  const [newShipmentRequest, setNewShipmentRequest] = useState<IShipment>(
    {} as IShipment
  );

  const email = sessionStorage.getItem('driverEmail') || '';
  const name = email.substring(0, email.indexOf('@'));
  const nameCaseCorrected = name
    ? name.charAt(0).toUpperCase() + name.slice(1)
    : 'Livreur';

  useEffect(() => {
    props.socket.on(socketEvents.SHIPMENT_CREATED, (data: IShipment) => {
      setNewShipmentRequest(data);
    });

    return () => {
      props.socket.off(socketEvents.SHIPMENT_CREATED);
    };
  }, [props.socket]);

  const onAccept = async () => {
    try {
      await updateShipmentStatus(
        newShipmentRequest?._id,
        ShipmentStatus.deliveryAssociateAssigned
      );

      const shipmentData = await updateShipmentDeliveryAssociate(
        newShipmentRequest?._id,
        email
      );

      props.setShipmentData(shipmentData.data);
      setNewShipmentRequest({} as IShipment);
    } catch (error) {
      console.error(error);
    }
  };

  const onReject = () => {
    setNewShipmentRequest({} as IShipment);
  };

  return (
    <div className="driver-dashboard">
      <div className="driver-profile">
        <div className="driver-avatar">
          {nameCaseCorrected.charAt(0)}
        </div>

        <div className="driver-details">
          <span className="driver-label">Livreur connecté</span>
          <h4>{nameCaseCorrected}</h4>
          <p>{email}</p>
        </div>
      </div>

      <div className="driver-status-box">
        <span className="driver-status-dot"></span>
        <span>En attente d’une demande de livraison</span>
      </div>

      {newShipmentRequest._id ? (
        <div className="shipment-request-wrapper">
          <ShipmentRequest onAccept={onAccept} onReject={onReject} />
        </div>
      ) : null}
    </div>
  );
};

export default DriverDashboard;