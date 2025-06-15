import React from 'react';
import { PhysicsQuantities, formatPhysicsValue } from '../utils/physics';

type PhysicsPanelProps = {
  physics: PhysicsQuantities;
  isVisible: boolean;
  onToggleVisibility: () => void;
};

function PhysicsPanel({ physics, isVisible, onToggleVisibility }: PhysicsPanelProps) {
  if (!isVisible) {
    return (
      <div style={{
        position: 'fixed',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '5px 10px',
        borderRadius: '5px',
        fontSize: '12px',
        cursor: 'pointer'
      }} onClick={onToggleVisibility}>
        📊 物理量を表示
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 10,
      right: 10,
      backgroundColor: 'rgba(0,0,0,0.85)',
      color: 'white',
      padding: '15px',
      borderRadius: '8px',
      fontSize: '13px',
      fontFamily: 'monospace',
      minWidth: '280px',
      maxWidth: '320px',
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '10px',
        borderBottom: '1px solid rgba(255,255,255,0.3)',
        paddingBottom: '8px'
      }}>
        <h4 style={{ margin: 0, fontSize: '14px' }}>📊 物理量パネル</h4>
        <button 
          onClick={onToggleVisibility}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '16px',
            cursor: 'pointer',
            padding: '0 5px'
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ lineHeight: '1.4' }}>
        {/* 運動量 */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', color: '#87CEEB', marginBottom: '4px' }}>
            📈 運動量 (Momentum)
          </div>
          <div style={{ fontSize: '12px', paddingLeft: '8px' }}>
            <div>総運動量: {formatPhysicsValue(physics.totalMomentumMagnitude, 1)}</div>
            <div style={{ fontSize: '11px', color: '#ccc' }}>
              X: {formatPhysicsValue(physics.totalMomentum.x, 1)} | 
              Y: {formatPhysicsValue(physics.totalMomentum.y, 1)}
            </div>
          </div>
        </div>

        {/* 角運動量 */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', color: '#FFB6C1', marginBottom: '4px' }}>
            🌀 角運動量 (Angular Momentum)
          </div>
          <div style={{ fontSize: '12px', paddingLeft: '8px' }}>
            <div>{formatPhysicsValue(physics.totalAngularMomentum, 1)}</div>
          </div>
        </div>

        {/* エネルギー */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: 'bold', color: '#98FB98', marginBottom: '4px' }}>
            ⚡ エネルギー (Energy)
          </div>
          <div style={{ fontSize: '12px', paddingLeft: '8px' }}>
            <div>総エネルギー: {formatPhysicsValue(physics.totalEnergy, 1)}</div>
            <div style={{ fontSize: '11px', color: '#ccc', marginTop: '2px' }}>
              運動: {formatPhysicsValue(physics.totalKineticEnergy, 1)}
            </div>
            <div style={{ fontSize: '11px', color: '#ccc' }}>
              位置: {formatPhysicsValue(physics.totalPotentialEnergy, 1)}
            </div>
          </div>
        </div>

        {/* 質量中心 */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontWeight: 'bold', color: '#DDA0DD', marginBottom: '4px' }}>
            🎯 質量中心 (Center of Mass)
          </div>
          <div style={{ fontSize: '12px', paddingLeft: '8px' }}>
            <div style={{ fontSize: '11px', color: '#ccc' }}>
              X: {formatPhysicsValue(physics.systemCenter.x, 1)} | 
              Y: {formatPhysicsValue(physics.systemCenter.y, 1)}
            </div>
          </div>
        </div>

        {/* 保存法則についての注記 */}
        <div style={{ 
          fontSize: '10px', 
          color: '#aaa', 
          marginTop: '10px',
          padding: '8px',
          backgroundColor: 'rgba(255,255,255,0.05)',
          borderRadius: '4px',
          borderLeft: '3px solid #FFD700'
        }}>
          💡 理想的には運動量・角運動量・エネルギーは保存されます。
          数値計算の誤差により僅かに変動することがあります。
        </div>
      </div>
    </div>
  );
}

export default PhysicsPanel;