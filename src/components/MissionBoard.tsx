import React from 'react';
import { GameMission } from '../hooks/useGameState';

type MissionBoardProps = {
  missions: GameMission[];
};

const statusText: Record<GameMission['status'], string> = {
  active: '進行中',
  completed: '完了',
};

const MissionBoard: React.FC<MissionBoardProps> = ({ missions }) => {
  return (
    <div className="missions-panel glass-panel">
      <div className="panel-header">
        <span>ミッションボード</span>
        <span className="pill">ゲーム性向上</span>
      </div>
      <div className="mission-list">
        {missions.map(mission => (
          <div key={mission.id} className={`mission-card ${mission.status === 'completed' ? 'is-complete' : ''}`}>
            <div className="mission-card__header">
              <div>
                <div className="mission-title">{mission.title}</div>
                <div className="mission-desc">{mission.description}</div>
              </div>
              <div className={`mission-status ${mission.status}`}>
                {statusText[mission.status]}
              </div>
            </div>
            <div className="mission-progress">
              <div className="mission-progress__bar">
                <div
                  className="mission-progress__fill"
                  style={{ width: `${Math.min(100, mission.progress * 100)}%` }}
                />
              </div>
              <div className="mission-progress__meta">
                <span>{mission.goalText}</span>
                <span className="reward">+{mission.reward}pt</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MissionBoard;
