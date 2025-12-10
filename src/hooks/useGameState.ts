import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Planet, TimeControlParameters } from '../types';
import { CollisionInfo } from '../simulationEngine';
import { PhysicsQuantities } from '../utils/physics';
import { generateUUID } from '../utils/uuid';

// Mission threshold constants
const ZOOM_IN_THRESHOLD = 2.0;
const ZOOM_OUT_THRESHOLD = 0.3;
const EXPLORER_MISSION_TIME_SECONDS = 120;
const STABILITY_MISSION_TIME_SECONDS = 45;
const COMET_MISSION_TIME_SECONDS = 25;
const TIME_WARP_MISSION_THRESHOLD = 3.0;
const OVERCROWDED_ORBIT_THRESHOLD = 12;
const COLLISION_MISSION_COUNT = 3;
const ORBITAL_DESIGNER_PLANETS = 2;
const GALAXY_ARCHITECT_PLANETS = 5;

export type GameEvent = {
  id: string;
  type: 'info' | 'collision' | 'mission';
  message: string;
  timestamp: number;
};

export type GameMission = {
  id: string;
  title: string;
  description: string;
  progress: number; // 0 - 1
  goalText: string;
  reward: number;
  status: 'active' | 'completed';
};

type UseGameStateArgs = {
  planets: Planet[];
  timeControl: TimeControlParameters;
  collisionEvents: Array<{ timestamp: number; collisions: CollisionInfo[] }>;
  lastCollisionTime: number | null;
  physicsQuantities: PhysicsQuantities | null;
  zoom?: number;
};

/**
 * 軽いゲーム要素（スコア、ミッション、イベントログ）を管理するカスタムフック。
 * シミュレーションの状態を元に進行度を計算する。
 */
export function useGameState({
  planets,
  timeControl,
  collisionEvents,
  lastCollisionTime,
  physicsQuantities,
  zoom = 1,
}: UseGameStateArgs) {
  const [score, setScore] = useState(0);
  const [customPlanetsPlaced, setCustomPlanetsPlaced] = useState(0);
  const [stabilitySeconds, setStabilitySeconds] = useState(0);
  const [cometUptimeSeconds, setCometUptimeSeconds] = useState(0);
  const [events, setEvents] = useState<GameEvent[]>([]);
  const [completedMissions, setCompletedMissions] = useState<Record<string, boolean>>({});
  const [maxPlanetCount, setMaxPlanetCount] = useState(0);
  const [collisionCount, setCollisionCount] = useState(0);
  const [playTimeSeconds, setPlayTimeSeconds] = useState(0);
  const [zoomedIn, setZoomedIn] = useState(false);
  const [zoomedOut, setZoomedOut] = useState(false);

  const lastCollisionTimestampRef = useRef<number | null>(null);

  const pushEvent = useCallback((event: GameEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 8));
  }, []);

  const completeMission = useCallback((missionId: string, reward: number, message: string) => {
    setCompletedMissions(prev => {
      if (prev[missionId]) return prev;
      const updated = { ...prev, [missionId]: true };
      setScore(s => s + reward);
      pushEvent({
        id: generateUUID(),
        type: 'mission',
        message: `${message} (+${reward}pt)`,
        timestamp: Date.now(),
      });
      return updated;
    });
  }, [pushEvent]);

  // --- Event handlers for user actions ---
  const registerPlanetAdded = useCallback((planetName: string) => {
    setCustomPlanetsPlaced(count => count + 1);
    pushEvent({
      id: generateUUID(),
      type: 'info',
      message: `${planetName} を投入`,
      timestamp: Date.now(),
    });
  }, [pushEvent]);

  const registerPlanetRemoved = useCallback((planetName: string) => {
    pushEvent({
      id: generateUUID(),
      type: 'info',
      message: `${planetName} を撤去`,
      timestamp: Date.now(),
    });
  }, [pushEvent]);

  const registerReset = useCallback((hard: boolean) => {
    pushEvent({
      id: generateUUID(),
      type: 'info',
      message: hard ? '完全リセットを実行' : '位置のみリセット',
      timestamp: Date.now(),
    });
  }, [pushEvent]);

  // --- Collision tracking for penalties/feedback ---
  useEffect(() => {
    const latest = collisionEvents[collisionEvents.length - 1];
    if (!latest) return;
    if (latest.timestamp === lastCollisionTimestampRef.current) return;
    lastCollisionTimestampRef.current = latest.timestamp;

    const involvedNames = latest.collisions
      .map(c => c.bodies.map(b => b.name).join(' × '))
      .join(', ');

    pushEvent({
      id: generateUUID(),
      type: 'collision',
      message: `衝突発生: ${involvedNames}`,
      timestamp: latest.timestamp,
    });

    setScore(s => Math.max(0, s - 10)); // Small penalty for crashes
    setStabilitySeconds(0);
    setCollisionCount(prev => prev + latest.collisions.length); // Track collision count
  }, [collisionEvents, pushEvent]);

  // --- Track max planet count ---
  useEffect(() => {
    setMaxPlanetCount(prev => Math.max(prev, planets.length));
  }, [planets.length]);

  // --- Track zoom usage ---
  useEffect(() => {
    if (zoom >= ZOOM_IN_THRESHOLD) setZoomedIn(true);
    if (zoom <= ZOOM_OUT_THRESHOLD) setZoomedOut(true);
  }, [zoom]);

  // --- Timers for streaks ---
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (!timeControl.isRunning) return;
      const now = Date.now();
      const collisionRecent = lastCollisionTime ? now - lastCollisionTime < 1000 : false;
      setStabilitySeconds(prev => (collisionRecent ? 0 : prev + 1));

      const hasComet = planets.some(p => p.type === 'comet');
      setCometUptimeSeconds(prev => (hasComet ? prev + 1 : 0));
      
      setPlayTimeSeconds(prev => prev + 1); // Track total play time
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [planets, timeControl.isRunning, lastCollisionTime]);

  // Reward players for staying stable every 15s streak
  useEffect(() => {
    if (stabilitySeconds > 0 && stabilitySeconds % 15 === 0) {
      setScore(s => s + 5);
      pushEvent({
        id: generateUUID(),
        type: 'info',
        message: `安定維持ボーナス +5pt (${stabilitySeconds}s)`,
        timestamp: Date.now(),
      });
    }
  }, [stabilitySeconds, pushEvent]);

  // --- Missions completion checks ---
  useEffect(() => {
    if (stabilitySeconds >= STABILITY_MISSION_TIME_SECONDS && planets.length >= 4) {
      completeMission('stability', 120, `${STABILITY_MISSION_TIME_SECONDS}秒間システムを安定維持`);
    }
  }, [stabilitySeconds, planets.length, completeMission]);

  useEffect(() => {
    if (customPlanetsPlaced >= ORBITAL_DESIGNER_PLANETS) {
      completeMission('builder', 70, `新たな惑星を${ORBITAL_DESIGNER_PLANETS}つ投入`);
    }
  }, [customPlanetsPlaced, completeMission]);

  useEffect(() => {
    if (cometUptimeSeconds >= COMET_MISSION_TIME_SECONDS) {
      completeMission('comet', 80, `彗星を${COMET_MISSION_TIME_SECONDS}秒存続させた`);
    }
  }, [cometUptimeSeconds, completeMission]);

  useEffect(() => {
    if (timeControl.timeScale >= TIME_WARP_MISSION_THRESHOLD) {
      completeMission('timewarp', 50, `時間倍率を${TIME_WARP_MISSION_THRESHOLD}x以上に到達`);
    }
  }, [timeControl.timeScale, completeMission]);

  useEffect(() => {
    if (physicsQuantities && physicsQuantities.totalEnergy < 0) {
      completeMission('gravityWell', 60, '系全体の総エネルギーを負に保つ');
    }
  }, [physicsQuantities, completeMission]);

  // --- New mission completion checks ---
  useEffect(() => {
    if (collisionCount >= COLLISION_MISSION_COUNT) {
      completeMission('destroyer', 90, `${COLLISION_MISSION_COUNT}回の衝突を引き起こした`);
    }
  }, [collisionCount, completeMission]);

  useEffect(() => {
    if (maxPlanetCount >= OVERCROWDED_ORBIT_THRESHOLD) {
      completeMission('crowded', 100, `${OVERCROWDED_ORBIT_THRESHOLD}個以上の天体を同時に存在させた`);
    }
  }, [maxPlanetCount, completeMission]);

  useEffect(() => {
    if (playTimeSeconds >= EXPLORER_MISSION_TIME_SECONDS) {
      completeMission('explorer', 60, `${EXPLORER_MISSION_TIME_SECONDS / 60}分間シミュレーションを観察`);
    }
  }, [playTimeSeconds, completeMission]);

  useEffect(() => {
    if (zoomedIn && zoomedOut) {
      completeMission('observer', 40, 'ズームインとズームアウトを両方使用');
    }
  }, [zoomedIn, zoomedOut, completeMission]);

  useEffect(() => {
    if (customPlanetsPlaced >= GALAXY_ARCHITECT_PLANETS) {
      completeMission('architect', 150, `${GALAXY_ARCHITECT_PLANETS}つの惑星を追加して銀河を設計`);
    }
  }, [customPlanetsPlaced, completeMission]);

  // --- Mission definitions for UI ---
  const missions: GameMission[] = useMemo(() => {
    return [
      {
        id: 'stability',
        title: '静穏ガーディアン',
        description: `4個以上の天体を衝突させず${STABILITY_MISSION_TIME_SECONDS}秒キープ。`,
        progress: Math.min(1, stabilitySeconds / STABILITY_MISSION_TIME_SECONDS),
        goalText: `${stabilitySeconds}s / ${STABILITY_MISSION_TIME_SECONDS}s`,
        reward: 120,
        status: completedMissions.stability ? 'completed' : 'active',
      },
      {
        id: 'builder',
        title: '軌道設計士',
        description: `シミュレーション中に新しい惑星を${ORBITAL_DESIGNER_PLANETS}つ追加する。`,
        progress: Math.min(1, customPlanetsPlaced / ORBITAL_DESIGNER_PLANETS),
        goalText: `${customPlanetsPlaced}/${ORBITAL_DESIGNER_PLANETS} 追加`,
        reward: 70,
        status: completedMissions.builder ? 'completed' : 'active',
      },
      {
        id: 'comet',
        title: '彗星ハンドラー',
        description: `彗星を${COMET_MISSION_TIME_SECONDS}秒以上生存させ、尾を保ち続ける。`,
        progress: Math.min(1, cometUptimeSeconds / COMET_MISSION_TIME_SECONDS),
        goalText: `${cometUptimeSeconds}s / ${COMET_MISSION_TIME_SECONDS}s`,
        reward: 80,
        status: completedMissions.comet ? 'completed' : 'active',
      },
      {
        id: 'timewarp',
        title: '時間操作の達人',
        description: `時間倍率を${TIME_WARP_MISSION_THRESHOLD}x以上まで引き上げる。`,
        progress: Math.min(1, timeControl.timeScale / TIME_WARP_MISSION_THRESHOLD),
        goalText: `${timeControl.timeScale.toFixed(2)}x / ${TIME_WARP_MISSION_THRESHOLD.toFixed(2)}x`,
        reward: 50,
        status: completedMissions.timewarp ? 'completed' : 'active',
      },
      {
        id: 'gravityWell',
        title: '重力井戸の支配者',
        description: '総エネルギーを負に保ち、系を重力井戸に閉じ込める。',
        progress: physicsQuantities && physicsQuantities.totalEnergy < 0 ? 1 : 0,
        goalText: physicsQuantities ? `E=${physicsQuantities.totalEnergy.toExponential(2)}` : '計測中',
        reward: 60,
        status: completedMissions.gravityWell ? 'completed' : 'active',
      },
      {
        id: 'destroyer',
        title: '宇宙の破壊者',
        description: `${COLLISION_MISSION_COUNT}回の衝突イベントを発生させる。`,
        progress: Math.min(1, collisionCount / COLLISION_MISSION_COUNT),
        goalText: `${collisionCount}/${COLLISION_MISSION_COUNT} 衝突`,
        reward: 90,
        status: completedMissions.destroyer ? 'completed' : 'active',
      },
      {
        id: 'crowded',
        title: '過密軌道マスター',
        description: `${OVERCROWDED_ORBIT_THRESHOLD}個以上の天体を同時に軌道上に配置。`,
        progress: Math.min(1, maxPlanetCount / OVERCROWDED_ORBIT_THRESHOLD),
        goalText: `${maxPlanetCount}/${OVERCROWDED_ORBIT_THRESHOLD} 天体`,
        reward: 100,
        status: completedMissions.crowded ? 'completed' : 'active',
      },
      {
        id: 'explorer',
        title: '宇宙探検家',
        description: `${EXPLORER_MISSION_TIME_SECONDS / 60}分間シミュレーションを観察し続ける。`,
        progress: Math.min(1, playTimeSeconds / EXPLORER_MISSION_TIME_SECONDS),
        goalText: `${playTimeSeconds}s / ${EXPLORER_MISSION_TIME_SECONDS}s`,
        reward: 60,
        status: completedMissions.explorer ? 'completed' : 'active',
      },
      {
        id: 'observer',
        title: '観測者',
        description: `ズームイン(${ZOOM_IN_THRESHOLD}x+)とズームアウト(${ZOOM_OUT_THRESHOLD}x以下)を両方使用。`,
        progress: (zoomedIn ? 0.5 : 0) + (zoomedOut ? 0.5 : 0),
        goalText: `${zoomedIn ? '✓' : '×'}拡大 ${zoomedOut ? '✓' : '×'}縮小`,
        reward: 40,
        status: completedMissions.observer ? 'completed' : 'active',
      },
      {
        id: 'architect',
        title: '銀河アーキテクト',
        description: `${GALAXY_ARCHITECT_PLANETS}つの新しい惑星を追加して独自の銀河を設計。`,
        progress: Math.min(1, customPlanetsPlaced / GALAXY_ARCHITECT_PLANETS),
        goalText: `${customPlanetsPlaced}/${GALAXY_ARCHITECT_PLANETS} 追加`,
        reward: 150,
        status: completedMissions.architect ? 'completed' : 'active',
      },
    ];
  }, [
    stabilitySeconds,
    customPlanetsPlaced,
    cometUptimeSeconds,
    timeControl.timeScale,
    physicsQuantities,
    completedMissions,
    collisionCount,
    maxPlanetCount,
    playTimeSeconds,
    zoomedIn,
    zoomedOut,
  ]);

  return {
    score,
    stabilitySeconds,
    cometUptimeSeconds,
    missions,
    events,
    registerPlanetAdded,
    registerPlanetRemoved,
    registerReset,
  };
}
