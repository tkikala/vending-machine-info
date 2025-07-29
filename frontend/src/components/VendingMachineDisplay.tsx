import type { VendingMachine } from '../types';

function PaymentIcon({ type, available }: { type: string; available: boolean }) {
  let icon = '';
  let label = '';
  if (type === 'COIN') {
    icon = '🪙';
    label = 'Coin';
  } else if (type === 'BANKNOTE') {
    icon = '💵';
    label = 'Banknote';
  } else {
    icon = '💳';
    label = 'Credit Card';
  }
  return (
    <span className="payment-icon">
      <span className="payment-text">{icon} {label}</span>
      <span className={`payment-status ${available ? 'available' : 'unavailable'}`}></span>
    </span>
  );
}

function VendingMachineDisplay({ machine }: { machine: VendingMachine }) {
  // Create a 3x4 grid (3 rows, 4 columns) for vending machine slots
  const slots = [];
  const rows = ['A', 'B', 'C'];
  const cols = [1, 2, 3, 4];

  let productIndex = 0;

  for (let row of rows) {
    for (let col of cols) {
      const slotCode = `${row}${col}`;
      const product = machine.products[productIndex];
      slots.push({
        code: slotCode,
        product: product || null,
      });
      productIndex++;
    }
  }

  return (
    <div className="vending-machine">
      <div className="vending-machine-header">
        <div className="machine-info-header">
          <img
            className="owner-logo-header"
            src="/images/vending-machine-default.png"
            alt="Owner Logo"
          />
          <div className="machine-details">
            <h3 style={{ margin: 0 }}>{machine.name}</h3>
            <div style={{ color: 'inherit', opacity: 0.8, fontSize: '0.9rem' }}>{machine.location}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Owner: {machine.owner.name}</div>
          </div>
          <div className="payment-methods-header">
            <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '0.25rem' }}>Payment:</div>
            {machine.paymentMethods.map((pm) => (
              <PaymentIcon key={pm.id} type={pm.type} available={pm.available} />
            ))}
          </div>
        </div>
      </div>
      <div className="vending-machine-display">
        {slots.map((slot) => (
          <div key={slot.code} className="vending-slot">
            <div className="slot-code">{slot.code}</div>
            {slot.product ? (
              <div className="slot-product">
                <div className="product-image">
                  {slot.product.photo ? (
                    <img src={slot.product.photo} alt={slot.product.name} />
                  ) : (
                    <div className="product-placeholder">📦</div>
                  )}
                </div>
                <div className="product-name">{slot.product.name}</div>
                <div className="product-desc">{slot.product.description}</div>
              </div>
            ) : (
              <div className="slot-empty">
                <div className="empty-placeholder">Empty</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VendingMachineDisplay; 