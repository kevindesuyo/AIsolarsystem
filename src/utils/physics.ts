import { Planet, Sun, Vector2D } from '../types';

export type PhysicsQuantities = {
  totalMomentum: Vector2D;
  totalMomentumMagnitude: number;
  totalAngularMomentum: number;
  totalKineticEnergy: number;
  totalPotentialEnergy: number;
  totalEnergy: number;
  systemCenter: Vector2D; // Center of mass
};

/**
 * 2つのベクトルの内積を計算
 */
function dotProduct(v1: Vector2D, v2: Vector2D): number {
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * 2つのベクトルの外積のz成分を計算（2Dなので）
 */
function crossProductZ(v1: Vector2D, v2: Vector2D): number {
  return v1.x * v2.y - v1.y * v2.x;
}

/**
 * ベクトルの大きさを計算
 */
function magnitude(v: Vector2D): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * 距離を計算
 */
function distance(p1: Vector2D, p2: Vector2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * システム全体の物理量を計算
 */
export function calculatePhysicsQuantities(
  sun: Sun,
  planets: Planet[],
  gravity: number
): PhysicsQuantities {
  // 全天体のリストを作成
  const allBodies = [sun, ...planets];
  
  // 総質量と質量中心を計算
  let totalMass = 0;
  let centerX = 0;
  let centerY = 0;
  
  allBodies.forEach(body => {
    totalMass += body.mass;
    centerX += body.mass * body.position.x;
    centerY += body.mass * body.position.y;
  });
  
  const systemCenter: Vector2D = {
    x: centerX / totalMass,
    y: centerY / totalMass
  };

  // 総運動量を計算（太陽は静止と仮定）
  let totalMomentumX = 0;
  let totalMomentumY = 0;
  
  planets.forEach(planet => {
    totalMomentumX += planet.mass * planet.velocity.x;
    totalMomentumY += planet.mass * planet.velocity.y;
  });
  
  const totalMomentum: Vector2D = {
    x: totalMomentumX,
    y: totalMomentumY
  };
  
  const totalMomentumMagnitude = magnitude(totalMomentum);

  // 総角運動量を計算（質量中心周り）
  let totalAngularMomentum = 0;
  
  planets.forEach(planet => {
    // 質量中心からの位置ベクトル
    const r: Vector2D = {
      x: planet.position.x - systemCenter.x,
      y: planet.position.y - systemCenter.y
    };
    
    // 角運動量 L = r × p = r × (m * v)
    const angularMomentum = planet.mass * crossProductZ(r, planet.velocity);
    totalAngularMomentum += angularMomentum;
  });

  // 総運動エネルギーを計算
  let totalKineticEnergy = 0;
  
  planets.forEach(planet => {
    const speed = magnitude(planet.velocity);
    totalKineticEnergy += 0.5 * planet.mass * speed * speed;
  });
  
  // 太陽の自転エネルギーも考慮（微小だが）
  const sunRotationalEnergy = 0.5 * (0.4 * sun.mass * sun.radius * sun.radius) * (sun.rotationSpeed * sun.rotationSpeed);
  totalKineticEnergy += sunRotationalEnergy;
  
  // 惑星の自転エネルギー
  planets.forEach(planet => {
    const rotationalEnergy = 0.5 * (0.4 * planet.mass * planet.radius * planet.radius) * (planet.rotationSpeed * planet.rotationSpeed);
    totalKineticEnergy += rotationalEnergy;
  });

  // 重力ポテンシャルエネルギーを計算
  let totalPotentialEnergy = 0;
  
  // 太陽と各惑星間
  planets.forEach(planet => {
    const dist = distance(sun.position, planet.position);
    if (dist > 0) {
      totalPotentialEnergy -= (gravity * sun.mass * planet.mass) / dist;
    }
  });
  
  // 惑星間
  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const dist = distance(planets[i].position, planets[j].position);
      if (dist > 0) {
        totalPotentialEnergy -= (gravity * planets[i].mass * planets[j].mass) / dist;
      }
    }
  }

  const totalEnergy = totalKineticEnergy + totalPotentialEnergy;

  return {
    totalMomentum,
    totalMomentumMagnitude,
    totalAngularMomentum,
    totalKineticEnergy,
    totalPotentialEnergy,
    totalEnergy,
    systemCenter
  };
}

/**
 * 数値を読みやすい形式にフォーマット
 */
export function formatPhysicsValue(value: number, precision: number = 2): string {
  if (Math.abs(value) < 0.001) {
    return value.toExponential(precision);
  }
  if (Math.abs(value) > 1000000) {
    return value.toExponential(precision);
  }
  return value.toFixed(precision);
}

/**
 * 保存量の検証（デバッグ用）
 */
export function validateConservation(
  initial: PhysicsQuantities,
  current: PhysicsQuantities,
  tolerance: number = 0.05 // 5%の許容範囲
): {
  momentumConserved: boolean;
  angularMomentumConserved: boolean;
  energyConserved: boolean;
} {
  const momentumChange = Math.abs(current.totalMomentumMagnitude - initial.totalMomentumMagnitude) / 
    Math.max(initial.totalMomentumMagnitude, 0.001);
  
  const angularMomentumChange = Math.abs(current.totalAngularMomentum - initial.totalAngularMomentum) / 
    Math.max(Math.abs(initial.totalAngularMomentum), 0.001);
  
  const energyChange = Math.abs(current.totalEnergy - initial.totalEnergy) / 
    Math.max(Math.abs(initial.totalEnergy), 0.001);

  return {
    momentumConserved: momentumChange < tolerance,
    angularMomentumConserved: angularMomentumChange < tolerance,
    energyConserved: energyChange < tolerance
  };
}