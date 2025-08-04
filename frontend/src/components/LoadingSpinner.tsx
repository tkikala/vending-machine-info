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
        height: '350px',
        background: 'linear-gradient(145deg, #2d2d2d, #1a1a1a)',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        border: '3px solid #404040',
        overflow: 'hidden',
        animation: 'vendingMachineGlow 2s ease-in-out infinite alternate'
      }}>
        {/* Machine Header */}
        <div style={{
          height: '40px',
          background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '16px',
          fontWeight: 'bold',
          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
        }}>
          Vending Community
        </div>

        {/* Glass Panel */}
        <div style={{
          position: 'absolute',
          top: '50px',
          left: '10px',
          right: '10px',
          height: '240px',
          background: 'linear-gradient(135deg, rgba(0,255,255,0.3), rgba(255,0,255,0.1))',
          border: '2px solid rgba(0,255,255,0.5)',
          borderRadius: '10px',
          backdropFilter: 'blur(5px)'
        }} />

        {/* Product Grid - 4x4 Layout */}
        <div style={{
          position: 'absolute',
          top: '60px',
          left: '20px',
          right: '20px',
          height: '220px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gridTemplateRows: '1fr 1fr 1fr 1fr',
          gap: '5px',
          padding: '5px'
        }}>
          {[...Array(16)].map((_, i) => (
            <div
              key={i}
              style={{
                background: 'linear-gradient(145deg, #3a3a3a, #2a2a2a)',
                border: '2px solid #505050',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: `productGlow ${1.5 + i * 0.15}s ease-in-out infinite alternate`,
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
              }}
            >
              <div style={{
                width: '8px',
                height: '8px',
                background: i % 3 === 0 ? 'linear-gradient(145deg, #00ffff, #00cccc)' : 
                           i % 3 === 1 ? 'linear-gradient(145deg, #ff00ff, #cc00cc)' :
                           'linear-gradient(145deg, #800080, #600060)',
                borderRadius: '50%',
                animation: `productDot ${2 + i * 0.12}s ease-in-out infinite alternate`
              }} />
            </div>
          ))}
        </div>

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
                background: i === 0 ? 'linear-gradient(145deg, #00ffff, #00cccc)' :
                           i === 1 ? 'linear-gradient(145deg, #ff00ff, #cc00cc)' :
                           'linear-gradient(145deg, #800080, #600060)',
                borderRadius: '50%',
                border: '2px solid #fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                animation: `buttonPulse ${1 + i * 0.3}s ease-in-out infinite alternate`
              }}
            />
          ))}
        </div>

        {/* Coin Slot - Moved to bottom center */}
        <div style={{
          position: 'absolute',
          bottom: '5px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '30px',
          height: '8px',
          background: '#333',
          borderRadius: '4px',
          animation: 'coinSlotGlow 1s ease-in-out infinite alternate'
        }} />

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
            background: 'linear-gradient(145deg, #00ffff, #ff00ff)',
            borderRadius: '4px',
            border: '2px solid #800080',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }} />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes vendingMachineGlow {
          0% { box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
          100% { box-shadow: 0 20px 40px rgba(0,255,255,0.3); }
        }

        @keyframes productGlow {
          0% { 
            background: linear-gradient(145deg, #3a3a3a, #2a2a2a);
            border-color: #505050;
            transform: scale(1);
          }
          100% { 
            background: linear-gradient(145deg, #4a4a4a, #3a3a3a);
            border-color: #00ffff;
            transform: scale(1.05);
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.3), 0 0 10px rgba(0,255,255,0.3);
          }
        }

        @keyframes productDot {
          0% { 
            transform: scale(1);
            opacity: 0.7;
          }
          100% { 
            transform: scale(1.3);
            opacity: 1;
            box-shadow: 0 0 8px rgba(0,255,255,0.6);
          }
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