type Props = {
  onAccept: () => void;
  onReject: () => void;
};

const ShipmentRequest = (props: Props) => {
  return (
    <div className="shipment-request">
      <div className="shipment-request-header">
        <div className="shipment-request-icon">📦</div>

        <div>
          <span className="shipment-request-label">Nouvelle demande</span>
          <h4>Livraison disponible</h4>
          <p>
            Une nouvelle demande de livraison vient d’être créée. Vous pouvez
            l’accepter ou la refuser.
          </p>
        </div>
      </div>

      <div className="shipment-request-actions">
        <button className="accept-btn" onClick={props.onAccept}>
          Accepter
        </button>

        <button className="reject-btn" onClick={props.onReject}>
          Refuser
        </button>
      </div>
    </div>
  );
};

export default ShipmentRequest;
