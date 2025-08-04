import React from 'react';

interface VendingMachineLogoProps {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

const VendingMachineLogo: React.FC<VendingMachineLogoProps> = ({ 
  size = 48, 
  className = '',
  style = {}
}) => {
  const scale = size / 200; // Base size is 200px, scale accordingly
  
  return (
    <div 
      className={className}
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size * 1.75}px`, // Maintain aspect ratio
        background: 'var(--vending-machine-bg, linear-gradient(145deg, #2d2d2d, #1a1a1a))',
        borderRadius: `${20 * scale}px`,
        boxShadow: `0 ${20 * scale}px ${40 * scale}px rgba(0,0,0,0.1)`,
        border: `${3 * scale}px solid var(--vending-machine-border, #404040)`,
        overflow: 'hidden',
        ...style
      }}
    >
      {/* Machine Header */}
      <div style={{
        height: `${40 * scale}px`,
        background: 'linear-gradient(90deg, #00ffff, #ff00ff)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: `${16 * scale}px`,
        fontWeight: 'bold',
        textShadow: `${1 * scale}px ${1 * scale}px ${2 * scale}px rgba(0,0,0,0.3)`
      }}>
        Vending Community
      </div>

      {/* Glass Panel */}
      <div style={{
        position: 'absolute',
        top: `${50 * scale}px`,
        left: `${10 * scale}px`,
        right: `${10 * scale}px`,
        height: `${240 * scale}px`,
        background: 'linear-gradient(135deg, rgba(0,255,255,0.3), rgba(255,0,255,0.1))',
        border: `${2 * scale}px solid rgba(0,255,255,0.5)`,
        borderRadius: `${10 * scale}px`,
        backdropFilter: 'blur(5px)'
      }} />

      {/* Product Grid - 4x4 like loading screen */}
      <div style={{
        position: 'absolute',
        top: `${60 * scale}px`,
        left: `${20 * scale}px`,
        right: `${20 * scale}px`,
        height: `${220 * scale}px`,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr 1fr 1fr',
        gap: `${5 * scale}px`,
        padding: `${5 * scale}px`
      }}>
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            style={{
              background: 'var(--product-grid-bg, linear-gradient(145deg, #3a3a3a, #2a2a2a))',
              border: `${2 * scale}px solid var(--product-grid-border, #505050)`,
              borderRadius: `${6 * scale}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `inset 0 ${2 * scale}px ${4 * scale}px rgba(0,0,0,0.3)`
            }}
          >
            <div style={{
              width: `${8 * scale}px`,
              height: `${8 * scale}px`,
              background: i % 3 === 0 ? 'linear-gradient(145deg, #00ffff, #00cccc)' : 
                         i % 3 === 1 ? 'linear-gradient(145deg, #ff00ff, #cc00cc)' :
                         'linear-gradient(145deg, #800080, #600060)',
              borderRadius: '50%'
            }} />
          </div>
        ))}
      </div>

      {/* Selection Buttons */}
      <div style={{
        position: 'absolute',
        bottom: `${20 * scale}px`,
        left: `${20 * scale}px`,
        right: `${20 * scale}px`,
        display: 'flex',
        gap: `${10 * scale}px`
      }}>
        <div style={{
          flex: 1,
          height: `${20 * scale}px`,
          background: 'linear-gradient(145deg, #00ffff, #00cccc)',
          borderRadius: `${10 * scale}px`,
          boxShadow: `0 ${2 * scale}px ${4 * scale}px rgba(0,255,255,0.3)`
        }} />
        <div style={{
          flex: 1,
          height: `${20 * scale}px`,
          background: 'linear-gradient(145deg, #ff00ff, #cc00cc)',
          borderRadius: `${10 * scale}px`,
          boxShadow: `0 ${2 * scale}px ${4 * scale}px rgba(255,0,255,0.3)`
        }} />
      </div>

      {/* Coin Slot */}
      <div style={{
        position: 'absolute',
        bottom: `${5 * scale}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        width: `${30 * scale}px`,
        height: `${8 * scale}px`,
        background: 'linear-gradient(145deg, #666, #444)',
        borderRadius: `${4 * scale}px`,
        border: `${1 * scale}px solid #333`
      }} />
    </div>
  );
};

export default VendingMachineLogo; 