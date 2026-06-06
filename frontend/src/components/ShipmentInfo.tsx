import { DashboardStatus } from '../types';
import { infoMsgs } from '../constants';

type PropType = {
  dashboardStatus: DashboardStatus;
};

function getStatusClass(status: DashboardStatus) {
  switch (status) {
    case DashboardStatus.NO_SHIPMENT:
      return 'status-neutral';

    case DashboardStatus.SHIPMENT_INITIATED:
    case DashboardStatus.PICKUP_SELECTED:
    case DashboardStatus.DROP_SELECTED:
      return 'status-info';

    case DashboardStatus.ASSOCIATE_ASSIGNED:
    case DashboardStatus.PICKUP_LOCATION_REACHED:
    case DashboardStatus.TRANSPORTING:
      return 'status-progress';

    case DashboardStatus.DROP_LOCATION_REACHED:
    case DashboardStatus.DELIVERED:
      return 'status-success';

    default:
      return 'status-neutral';
  }
}

function getStatusIcon(status: DashboardStatus) {
  switch (status) {
    case DashboardStatus.NO_SHIPMENT:
      return '📦';

    case DashboardStatus.SHIPMENT_INITIATED:
      return '📍';

    case DashboardStatus.PICKUP_SELECTED:
      return '✅';

    case DashboardStatus.DROP_SELECTED:
      return '🕒';

    case DashboardStatus.ASSOCIATE_ASSIGNED:
      return '🚚';

    case DashboardStatus.PICKUP_LOCATION_REACHED:
      return '📦';

    case DashboardStatus.TRANSPORTING:
      return '🛣️';

    case DashboardStatus.DROP_LOCATION_REACHED:
      return '📍';

    case DashboardStatus.DELIVERED:
      return '🎉';

    default:
      return 'ℹ️';
  }
}

export default function ShipmentInfo(props: PropType) {
  const { title, msg } = infoMsgs[props.dashboardStatus];

  if (!title || !msg) {
    return (
      <div className="shipment-info-card status-neutral">
        <div className="shipment-info-icon">ℹ️</div>

        <div className="shipment-info-content">
          <span className="shipment-status-label">Statut</span>
          <h4>Aucune information</h4>
          <p>Aucune livraison n'est actuellement sélectionnée.</p>
        </div>
      </div>
    );
  }

  const statusClass = getStatusClass(props.dashboardStatus);
  const statusIcon = getStatusIcon(props.dashboardStatus);

  return (
    <div className={`shipment-info-card ${statusClass}`}>
      <div className="shipment-info-icon">{statusIcon}</div>

      <div className="shipment-info-content">
        <span className="shipment-status-label">Statut actuel</span>
        <h4>{title}</h4>
        <p>{msg}</p>
      </div>
    </div>
  );
}
