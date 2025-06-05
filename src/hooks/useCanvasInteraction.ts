import { useCallback, useRef, useState, useEffect } from 'react';
import { Vector2D, Planet, ViewParameters } from '../types';

export type DragState = {
  isDragging: boolean;
  draggedPlanetId: string | null;
  dragStartPos: Vector2D | null;
  dragOffset: Vector2D | null;
};

export type CanvasInteractionHandlers = {
  onPlanetDragStart: (planetId: string, mousePos: Vector2D) => void;
  onPlanetDrag: (mousePos: Vector2D) => void;
  onPlanetDragEnd: () => void;
  onCanvasClick: (mousePos: Vector2D) => void;
};

/**
 * キャンバス上でのマウスインタラクション（ドラッグ&ドロップ、クリック）を管理するhook
 */
export function useCanvasInteraction(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  planets: Planet[],
  viewParams: ViewParameters,
  onUpdatePlanetPosition: (planetId: string, newPosition: Vector2D) => void,
  onCanvasClickCallback?: (worldPos: Vector2D) => void
) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedPlanetId: null,
    dragStartPos: null,
    dragOffset: null,
  });

  // マウス座標をワールド座標に変換
  const screenToWorld = useCallback((screenPos: Vector2D, centerPos: Vector2D): Vector2D => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const { zoom } = viewParams;
    return {
      x: (screenPos.x - canvas.width / 2) / zoom + centerPos.x,
      y: (screenPos.y - canvas.height / 2) / zoom + centerPos.y,
    };
  }, [canvasRef, viewParams]);

  // マウス座標をキャンバス相対座標に変換
  const getCanvasRelativePos = useCallback((e: MouseEvent): Vector2D => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, [canvasRef]);

  // 惑星がクリックされたかを判定
  const findClickedPlanet = useCallback((worldPos: Vector2D): Planet | null => {
    for (const planet of planets) {
      const dx = worldPos.x - planet.position.x;
      const dy = worldPos.y - planet.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance <= planet.radius) {
        return planet;
      }
    }
    return null;
  }, [planets]);

  // マウスダウンイベントハンドラ
  const handleMouseDown = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasPos = getCanvasRelativePos(e);
    
    // カメラターゲットに応じた中心位置を計算
    let centerPos = { x: 0, y: 0 }; // 太陽の位置をデフォルトとして使用
    if (viewParams.cameraTarget !== 'sun') {
      const targetPlanet = planets.find(p => p.name === viewParams.cameraTarget);
      if (targetPlanet) {
        centerPos = { x: targetPlanet.position.x, y: targetPlanet.position.y };
      }
    }

    const worldPos = screenToWorld(canvasPos, centerPos);
    const clickedPlanet = findClickedPlanet(worldPos);

    if (clickedPlanet) {
      // 惑星がクリックされた場合、ドラッグ開始
      const offset = {
        x: worldPos.x - clickedPlanet.position.x,
        y: worldPos.y - clickedPlanet.position.y,
      };

      setDragState({
        isDragging: true,
        draggedPlanetId: clickedPlanet.id,
        dragStartPos: worldPos,
        dragOffset: offset,
      });
    } else {
      // 空いている場所をクリックした場合
      if (onCanvasClickCallback) {
        onCanvasClickCallback(worldPos);
      }
    }
  }, [canvasRef, getCanvasRelativePos, screenToWorld, findClickedPlanet, planets, viewParams, onCanvasClickCallback]);

  // マウスムーブイベントハンドラ
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedPlanetId || !dragState.dragOffset) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const canvasPos = getCanvasRelativePos(e);
    
    // カメラターゲットに応じた中心位置を計算
    let centerPos = { x: 0, y: 0 };
    if (viewParams.cameraTarget !== 'sun') {
      const targetPlanet = planets.find(p => p.name === viewParams.cameraTarget);
      if (targetPlanet) {
        centerPos = { x: targetPlanet.position.x, y: targetPlanet.position.y };
      }
    }

    const worldPos = screenToWorld(canvasPos, centerPos);
    const newPosition = {
      x: worldPos.x - dragState.dragOffset.x,
      y: worldPos.y - dragState.dragOffset.y,
    };

    onUpdatePlanetPosition(dragState.draggedPlanetId, newPosition);
  }, [dragState, canvasRef, getCanvasRelativePos, screenToWorld, planets, viewParams, onUpdatePlanetPosition]);

  // マウスアップイベントハンドラ
  const handleMouseUp = useCallback(() => {
    setDragState({
      isDragging: false,
      draggedPlanetId: null,
      dragStartPos: null,
      dragOffset: null,
    });
  }, []);

  // イベントリスナーの登録/削除
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseDown, handleMouseMove, handleMouseUp]);

  return {
    dragState,
  };
}