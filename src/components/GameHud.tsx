import React from 'react';

type GameHudProps = {
  score: number;
  stabilitySeconds: number;
  cometSeconds: number;
  timeScale: number;
  planetCount: number;
};

const GameHud: React.FC<GameHudProps> = ({
  score,
  stabilitySeconds,
  cometSeconds,
  timeScale,
  planetCount,
}) => {
  return (
    <div className="hud glass-panel">
      <div className="hud__title">SOLAR OPS</div>
      <div className="hud__stats">
        <div>
          <span className="label">Score</span>
          <strong>{score}</strong>
        </div>
        <div>
          <span className="label">安定維持</span>
          <strong>{stabilitySeconds}s</strong>
        </div>
        <div>
          <span className="label">彗星稼働</span>
          <strong>{cometSeconds}s</strong>
        </div>
        <div>
          <span className="label">Time Warp</span>
          <strong>{timeScale.toFixed(2)}x</strong>
        </div>
        <div>
          <span className="label">Planets</span>
          <strong>{planetCount}</strong>
        </div>
      </div>
    </div>
  );
};

export default GameHud;
