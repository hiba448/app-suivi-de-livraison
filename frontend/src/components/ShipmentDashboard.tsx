import { IShipment, ShipmentStatus } from '../types';
import { updateShipmentStatus } from '../api';

type Props = {
  shipmentData: IShipment;
  setShipmentData: any;
};

const statusDisplayName: Record<ShipmentStatus, string> = {
  [ShipmentStatus.deliveryAssociateAssigned]: 'Livreur assigné',
  [ShipmentStatus.pickupLocationReached]: 'Point de départ atteint',
  [ShipmentStatus.dropLocationReached]: "Point d'arrivée atteint",
  [ShipmentStatus.transporting]: 'En cours de livraison',
  [ShipmentStatus.delivered]: 'Livré',
  [ShipmentStatus.requested]: 'Demandée',
  [ShipmentStatus.cancelled]: 'Annulée',
};

type UpdateAction = {
  actionName: string;
  statusToUpdate: ShipmentStatus;
};

const ShipmentDashboard = (props: Props) => {
  const { shipmentData, setShipmentData } = props;

  const updateAction = (): UpdateAction => {
    const currentStatus: ShipmentStatus = shipmentData.status;

    const pickupLocationReached = {
      actionName: 'Marquer le point de départ comme atteint',
      statusToUpdate: ShipmentStatus.pickupLocationReached,
    };

    const transporting = {
      actionName: 'Démarrer la livraison',
      statusToUpdate: ShipmentStatus.transporting,
    };

    const dropLocationReached = {
      actionName: "Marquer le point d'arrivée comme atteint",
      statusToUpdate: ShipmentStatus.dropLocationReached,
    };

    const delivered = {
      actionName: 'Marquer comme livrée',
      statusToUpdate: ShipmentStatus.delivered,
    };

    switch (currentStatus) {
      case ShipmentStatus.deliveryAssociateAssigned:
        return pickupLocationReached;

      case ShipmentStatus.pickupLocationReached:
        return transporting;

      case ShipmentStatus.transporting:
        return dropLocationReached;

      case ShipmentStatus.dropLocationReached:
        return delivered;

      default:
        return delivered;
    }
  };

  const onShipmentStatusUpdate = async (statusToUpdate: ShipmentStatus) => {
    try {
      const updatedShipmentData = await updateShipmentStatus(
        shipmentData._id,
        statusToUpdate
      );

      setShipmentData(updatedShipmentData.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!shipmentData._id) {
    return null;
  }

  const nextAction = updateAction();
  const isDelivered = shipmentData.status === ShipmentStatus.delivered;

  return (
    <div className="shipment-dashboard">
      <div className="shipment-summary">
        <div className="shipment-summary-icon">🚚</div>

        <div className="shipment-summary-content">
          <span className="shipment-summary-label">Livraison active</span>
          <h4>{statusDisplayName[shipmentData.status]}</h4>
          <p>ID : {shipmentData._id}</p>
        </div>
      </div>

      <div className="shipment-details-list">
        <div className="shipment-detail-item">
          <span>Statut</span>
          <strong>{statusDisplayName[shipmentData.status]}</strong>
        </div>

        <div className="shipment-detail-item">
          <span>Progression</span>
          <strong>{isDelivered ? 'Terminée' : 'En cours'}</strong>
        </div>
      </div>

      {!isDelivered && (
        <button
          className="primary-btn shipment-update-btn"
          onClick={async () => {
            await onShipmentStatusUpdate(nextAction.statusToUpdate);
          }}
        >
          {nextAction.actionName}
        </button>
      )}

      {isDelivered && (
        <div className="shipment-complete-box">
          Livraison terminée avec succès.
        </div>
      )}
    </div>
  );
};

export default ShipmentDashboard;