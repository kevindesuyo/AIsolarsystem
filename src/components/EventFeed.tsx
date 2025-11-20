import React from 'react';
import { GameEvent } from '../hooks/useGameState';

type EventFeedProps = {
  events: GameEvent[];
};

const EventFeed: React.FC<EventFeedProps> = ({ events }) => {
  return (
    <div className="event-feed glass-panel">
      <div className="panel-header">
        <span>イベントログ</span>
        <span className="pill ghost">最新</span>
      </div>
      <ul>
        {events.map(event => (
          <li key={event.id} className={`event ${event.type}`}>
            <span className="event__dot" />
            <span className="event__text">{event.message}</span>
          </li>
        ))}
        {events.length === 0 && <li className="event info">システムは安定しています。</li>}
      </ul>
    </div>
  );
};

export default EventFeed;
