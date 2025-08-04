import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'var(--bg-color)',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Animated Vending Machine */}
      <div style={{
        position: 'relative',
        width: '200px',
        height: '300px',
        background: 'linear-gradient(145deg, #e6e6e6, #ffffff)',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '3px solid #d0d0d0',
        overflow: 'hidden',
        animation: 'vendingMachineGlow 2s ease-in-out infinite alternate'
      }}>
        {/* Machine Header */}
        <div style={{
          height: '40px',
          background: 'linear-gradient(90deg, #4ecdc4, #44a08d)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        }}>
          {/* Removed "VENDING MACHINE" text */}
        </div>

        {/* Glass Panel */}
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '10px',
          right: '10px',
          height: '200px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))',
          border: '2px solid rgba(255,255,255,0.5)',
          borderRadius: '10px',
          backdropFilter: 'blur(5px)'
        }} />

        {/* Product Slots */}
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${60 + (i * 30)}px`,
              left: '20px',
              right: '20px',
              height: '25px',
              background: 'linear-gradient(90deg, #f0f0f0, #e0e0e0)',
              border: '1px solid #ccc',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center',
              padding: '0 10px',
              fontSize: '12px',
              color: '#666',
              animation: `slotGlow ${1.5 + i * 0.2}s ease-in-out infinite alternate`
            }}
          >
            {/* Removed "📦 Product X" text */}
          </div>
        ))}

        {/* Coin Slot */}
        <div style={{
          position: 'absolute',
          bottom: '60px',
          left: '20px',
          width: '30px',
          height: '8px',
          background: '#333',
          borderRadius: '4px',
          animation: 'coinSlotGlow 1s ease-in-out infinite alternate'
        }} />

        {/* Change Tray */}
        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '20px',
          width: '60px',
          height: '15px',
          background: 'linear-gradient(90deg, #ddd, #bbb)',
          borderRadius: '0 0 8px 8px',
          border: '1px solid #999'
        }} />

        {/* Selection Buttons */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '20px',
          right: '20px',
          display: 'flex',
          gap: '10px',
          justifyContent: 'center'
        }}>
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              style={{
                width: '25px',
                height: '25px',
                background: 'linear-gradient(145deg, #4ecdc4, #44a08d)',
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                animation: `buttonPulse ${1 + i * 0.3}s ease-in-out infinite alternate`
              }}
            />
          ))}
        </div>

        {/* Animated Coins */}
        <div style={{
          position: 'absolute',
          top: '50%',
          right: '-20px',
          animation: 'coinDrop 2s ease-in-out infinite'
        }}>
          <div style={{
            width: '15px',
            height: '15px',
            background: 'linear-gradient(145deg, #ffd700, #ffed4e)',
            borderRadius: '50%',
            border: '2px solid #ffb300',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }} />
        </div>

        {/* Animated Products */}
        <div style={{
          position: 'absolute',
          bottom: '50%',
          left: '-20px',
          animation: 'productDrop 2.5s ease-in-out infinite'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            background: 'linear-gradient(145deg, #4ecdc4, #44a08d)',
            borderRadius: '4px',
            border: '2px solid #2c7a7b',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }} />
        </div>
      </div>

      {/* Removed "Loading your vending experience..." text */}

      {/* CSS Animations */}
      <style>{`
        @keyframes vendingMachineGlow {
          0% { box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          100% { box-shadow: 0 20px 40px rgba(78,205,196,0.3); }
        }

        @keyframes slotGlow {
          0% { background: linear-gradient(90deg, #f0f0f0, #e0e0e0); }
          100% { background: linear-gradient(90deg, #f5fffe, #e0f5f3); }
        }

        @keyframes coinSlotGlow {
          0% { background: #333; }
          100% { background: #ffd700; }
        }

        @keyframes buttonPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.1); opacity: 1; }
        }

        @keyframes coinDrop {
          0% { transform: translateY(-100px) rotate(0deg); opacity: 0; }
          50% { transform: translateY(0px) rotate(180deg); opacity: 1; }
          100% { transform: translateY(100px) rotate(360deg); opacity: 0; }
        }

        @keyframes productDrop {
          0% { transform: translateY(100px) rotate(0deg); opacity: 0; }
          50% { transform: translateY(0px) rotate(-180deg); opacity: 1; }
          100% { transform: translateY(-100px) rotate(-360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner; 