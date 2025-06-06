import { Vector2D, CelestialBody, Planet } from '../types';

export type Particle = {
  id: string;
  position: Vector2D;
  velocity: Vector2D;
  life: number; // 0-1, 1 = full life, 0 = dead
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
};

export type ParticleSystem = {
  particles: Particle[];
  type: 'comet_tail' | 'solar_corona' | 'explosion';
  sourceBodyId: string;
  maxParticles: number;
  emissionRate: number; // particles per frame
  lastEmissionTime: number;
  creationTime?: number; // For one-time effects like explosions
};

export class ParticleManager {
  private systems: Map<string, ParticleSystem> = new Map();
  private particleIdCounter = 0;

  /**
   * 彗星の尾用パーティクルシステムを作成
   */
  createCometTail(cometId: string): void {
    const system: ParticleSystem = {
      particles: [],
      type: 'comet_tail',
      sourceBodyId: cometId,
      maxParticles: 50,
      emissionRate: 2, // 2 particles per frame
      lastEmissionTime: 0,
    };
    this.systems.set(`comet_${cometId}`, system);
  }

  /**
   * 太陽のコロナ用パーティクルシステムを作成
   */
  createSolarCorona(sunId: string): void {
    const system: ParticleSystem = {
      particles: [],
      type: 'solar_corona',
      sourceBodyId: sunId,
      maxParticles: 100,
      emissionRate: 3, // 3 particles per frame
      lastEmissionTime: 0,
    };
    this.systems.set(`corona_${sunId}`, system);
  }

  /**
   * 衝突時の爆発エフェクトを作成
   */
  createExplosion(position: Vector2D, radius: number, color1: string, color2: string): void {
    const explosionId = `explosion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const system: ParticleSystem = {
      particles: [],
      type: 'explosion',
      sourceBodyId: explosionId,
      maxParticles: Math.min(150, Math.max(30, Math.floor(radius * 2))), // Scale with collision size
      emissionRate: 0, // All particles created at once
      lastEmissionTime: 0,
      creationTime: Date.now(),
    };

    // Create all explosion particles immediately
    const particleCount = system.maxParticles;
    const colors = [color1, color2, '#ffffff', '#ffff00', '#ff8000']; // Mix of collision colors plus white/yellow/orange

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5) * 0.5;
      const speed = 20 + Math.random() * 40; // Random speed for explosion spread
      const particleRadius = radius * (0.5 + Math.random() * 1.5); // Vary by collision size
      
      const particle: Particle = {
        id: `explosion_particle_${this.particleIdCounter++}`,
        position: {
          x: position.x + (Math.random() - 0.5) * radius * 0.2, // Small random offset from collision center
          y: position.y + (Math.random() - 0.5) * radius * 0.2,
        },
        velocity: {
          x: Math.cos(angle) * speed + (Math.random() - 0.5) * 10,
          y: Math.sin(angle) * speed + (Math.random() - 0.5) * 10,
        },
        life: 1.0,
        maxLife: 40 + Math.random() * 60, // 40-100 frames
        size: 1 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.8 + Math.random() * 0.2,
      };
      
      system.particles.push(particle);
    }

    this.systems.set(explosionId, system);
  }

  /**
   * パーティクルシステムを削除
   */
  removeSystem(bodyId: string, type: 'comet_tail' | 'solar_corona'): void {
    const key = type === 'comet_tail' ? `comet_${bodyId}` : `corona_${bodyId}`;
    this.systems.delete(key);
  }

  /**
   * 彗星の尾パーティクルを生成
   */
  private emitCometTailParticle(comet: Planet, system: ParticleSystem): void {
    // 彗星の速度ベクトルから尾の方向を計算
    const speed = Math.sqrt(comet.velocity.x ** 2 + comet.velocity.y ** 2);
    const normalizedVel = speed > 0 ? {
      x: comet.velocity.x / speed,
      y: comet.velocity.y / speed
    } : { x: 0, y: 0 };

    // 尾は進行方向の反対に出る
    const tailDirection = {
      x: -normalizedVel.x,
      y: -normalizedVel.y
    };

    // パーティクルの初期位置（彗星の後方）
    const offset = comet.radius * 0.8;
    const randomOffset = (Math.random() - 0.5) * comet.radius * 0.5;
    
    const particle: Particle = {
      id: `particle_${this.particleIdCounter++}`,
      position: {
        x: comet.position.x + tailDirection.x * offset + randomOffset * tailDirection.y,
        y: comet.position.y + tailDirection.y * offset - randomOffset * tailDirection.x,
      },
      velocity: {
        x: tailDirection.x * (speed * 0.3 + Math.random() * 20) + (Math.random() - 0.5) * 10,
        y: tailDirection.y * (speed * 0.3 + Math.random() * 20) + (Math.random() - 0.5) * 10,
      },
      life: 1.0,
      maxLife: 120 + Math.random() * 60, // 120-180 frames
      size: 1 + Math.random() * 2,
      color: comet.type === 'comet' ? '#87CEEB' : '#FFE4B5', // Light blue for comets, moccasin for others
      alpha: 0.6 + Math.random() * 0.4,
    };

    system.particles.push(particle);
  }

  /**
   * 太陽のコロナパーティクルを生成
   */
  private emitSolarCoronaParticle(sun: CelestialBody, system: ParticleSystem): void {
    // ランダムな角度でコロナ粒子を放出
    const angle = Math.random() * Math.PI * 2;
    const distance = sun.radius + Math.random() * sun.radius * 0.5;
    
    const particle: Particle = {
      id: `particle_${this.particleIdCounter++}`,
      position: {
        x: sun.position.x + Math.cos(angle) * distance,
        y: sun.position.y + Math.sin(angle) * distance,
      },
      velocity: {
        x: Math.cos(angle) * (2 + Math.random() * 3),
        y: Math.sin(angle) * (2 + Math.random() * 3),
      },
      life: 1.0,
      maxLife: 90 + Math.random() * 60, // 90-150 frames
      size: 0.5 + Math.random() * 1.5,
      color: '#FFA500', // Orange
      alpha: 0.3 + Math.random() * 0.4,
    };

    system.particles.push(particle);
  }

  /**
   * パーティクルシステムを更新
   */
  update(celestialBodies: Map<string, CelestialBody>, timeScale: number): void {
    const currentTime = Date.now();
    
    for (const [systemKey, system] of this.systems) {
      // Handle explosion systems differently (they don't have a source body)
      if (system.type === 'explosion') {
        // Remove explosion systems that are too old (cleanup)
        if (system.creationTime && currentTime - system.creationTime > 10000) { // 10 seconds
          this.systems.delete(systemKey);
          continue;
        }
        // Explosions don't emit new particles, only update existing ones
      } else {
        const body = celestialBodies.get(system.sourceBodyId);
        if (!body) {
          // Body no longer exists, remove system
          this.systems.delete(systemKey);
          continue;
        }

        // Emit new particles (only for continuous effects, not explosions)
        if (system.particles.length < system.maxParticles) {
          const emitCount = Math.floor(system.emissionRate * Math.max(0.1, timeScale));
          for (let i = 0; i < emitCount; i++) {
            if (system.type === 'comet_tail') {
              this.emitCometTailParticle(body as Planet, system);
            } else if (system.type === 'solar_corona') {
              this.emitSolarCoronaParticle(body, system);
            }
          }
        }
      }

      // Update existing particles
      system.particles = system.particles.filter(particle => {
        // Update particle life
        particle.life -= (1 / particle.maxLife) * timeScale;
        
        if (particle.life <= 0) {
          return false; // Remove dead particle
        }

        // Update particle position
        particle.position.x += particle.velocity.x * timeScale;
        particle.position.y += particle.velocity.y * timeScale;

        // Fade alpha based on life
        particle.alpha = particle.life * (0.3 + Math.random() * 0.4);

        // Apply physics based on particle type
        if (system.type === 'comet_tail') {
          // Comet tail particles slow down over time
          particle.velocity.x *= 0.98;
          particle.velocity.y *= 0.98;
        } else if (system.type === 'explosion') {
          // Explosion particles slow down more and have gravity-like effect
          particle.velocity.x *= 0.95;
          particle.velocity.y *= 0.95;
          // Slight upward acceleration (like hot gases rising)
          particle.velocity.y -= 0.5;
        }

        return true;
      });
    }
  }

  /**
   * パーティクルを描画
   */
  draw(
    ctx: CanvasRenderingContext2D,
    viewParams: { zoom: number },
    centerPos: Vector2D,
    canvasWidth: number,
    canvasHeight: number
  ): void {
    const { zoom } = viewParams;

    ctx.save();
    
    for (const system of this.systems.values()) {
      for (const particle of system.particles) {
        const screenX = (particle.position.x - centerPos.x) * zoom + canvasWidth / 2;
        const screenY = (particle.position.y - centerPos.y) * zoom + canvasHeight / 2;

        // Skip particles outside the screen
        if (screenX < -10 || screenX > canvasWidth + 10 || 
            screenY < -10 || screenY > canvasHeight + 10) {
          continue;
        }

        let screenSize = Math.max(0.5, particle.size * zoom);
        
        // Special rendering for explosion particles
        if (system.type === 'explosion') {
          // Explosion particles grow then shrink over their lifetime
          const lifeFactor = 1 - particle.life; // 0 to 1 as particle ages
          const sizeFactor = lifeFactor < 0.3 ? lifeFactor / 0.3 : (1 - lifeFactor) / 0.7;
          screenSize *= (0.5 + sizeFactor * 1.5); // Size varies from 0.5x to 2x
          
          // Add glow effect for explosion particles
          ctx.shadowBlur = screenSize * 2;
          ctx.shadowColor = particle.color;
        }

        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, screenSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Reset shadow for next particles
        if (system.type === 'explosion') {
          ctx.shadowBlur = 0;
        }
      }
    }

    ctx.restore();
  }

  /**
   * 特定の天体のパーティクル効果を有効/無効にする
   */
  toggleEffect(bodyId: string, bodyType: 'star' | 'comet', enable: boolean): void {
    if (bodyType === 'star') {
      if (enable) {
        this.createSolarCorona(bodyId);
      } else {
        this.removeSystem(bodyId, 'solar_corona');
      }
    } else if (bodyType === 'comet') {
      if (enable) {
        this.createCometTail(bodyId);
      } else {
        this.removeSystem(bodyId, 'comet_tail');
      }
    }
  }

  /**
   * 全パーティクルシステムをクリア
   */
  clear(): void {
    this.systems.clear();
    this.particleIdCounter = 0;
  }

  /**
   * 現在のパーティクルシステム情報を取得（デバッグ用）
   */
  getSystemInfo(): Array<{ key: string; type: string; particleCount: number }> {
    return Array.from(this.systems.entries()).map(([key, system]) => ({
      key,
      type: system.type,
      particleCount: system.particles.length,
    }));
  }
}