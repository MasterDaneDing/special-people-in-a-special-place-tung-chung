import React, { useRef } from 'react';
import { FlipHorizontal2, Maximize2, Minus, Plus, Trash2 } from 'lucide-react';
import { DrawnObject, PlacedObject } from '../types';

interface InteractivePropProps {
  object: DrawnObject;
  placed: PlacedObject;
  stageRef: React.RefObject<HTMLDivElement | null>;
  isSelected: boolean;
  danceMode: boolean;
  animIndex: number;
  onSelect: () => void;
  onChange: (patch: Partial<PlacedObject>) => void;
  onRemove: () => void;
}

export const InteractiveProp: React.FC<InteractivePropProps> = ({
  object,
  placed,
  stageRef,
  isSelected,
  danceMode,
  animIndex,
  onSelect,
  onChange,
  onRemove,
}) => {
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureRef = useRef<{
    mode: 'drag' | 'pinch' | null;
    startCenterX: number;
    startCenterY: number;
    startPlacedX: number;
    startPlacedY: number;
    startPinchDist: number;
    startScale: number;
  }>({
    mode: null,
    startCenterX: 0,
    startCenterY: 0,
    startPlacedX: placed.x,
    startPlacedY: placed.y,
    startPinchDist: 0,
    startScale: placed.scale,
  });

  const getDist = (
    a: { x: number; y: number },
    b: { x: number; y: number }
  ) => Math.hypot(a.x - b.x, a.y - b.y);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    onSelect();
    e.currentTarget.setPointerCapture(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const pts = Array.from(pointersRef.current.values());
    if (pts.length === 1) {
      gestureRef.current = {
        mode: 'drag',
        startCenterX: pts[0].x,
        startCenterY: pts[0].y,
        startPlacedX: placed.x,
        startPlacedY: placed.y,
        startPinchDist: 0,
        startScale: placed.scale,
      };
    } else if (pts.length >= 2) {
      gestureRef.current = {
        mode: 'pinch',
        startCenterX: (pts[0].x + pts[1].x) / 2,
        startCenterY: (pts[0].y + pts[1].y) / 2,
        startPlacedX: placed.x,
        startPlacedY: placed.y,
        startPinchDist: Math.max(10, getDist(pts[0], pts[1])),
        startScale: placed.scale,
      };
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const pts = Array.from(pointersRef.current.values());

    if (gestureRef.current.mode === 'pinch' && pts.length >= 2) {
      const dist = getDist(pts[0], pts[1]);
      const ratio = dist / gestureRef.current.startPinchDist;
      const nextScale = Math.max(
        0.35,
        Math.min(2.5, gestureRef.current.startScale * ratio)
      );
      onChange({ scale: nextScale });
    } else if (gestureRef.current.mode === 'drag' && pts.length === 1) {
      const dx = (pts[0].x - gestureRef.current.startCenterX) / rect.width;
      const dy = (pts[0].y - gestureRef.current.startCenterY) / rect.height;
      onChange({
        x: Math.max(0.06, Math.min(0.94, gestureRef.current.startPlacedX + dx)),
        y: Math.max(0.14, Math.min(0.9, gestureRef.current.startPlacedY + dy)),
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (pointersRef.current.size === 0) {
      gestureRef.current.mode = null;
    }
  };

  const handleResizeCornerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;
    const startScale = placed.scale;

    const onMove = (ev: PointerEvent) => {
      const delta = (ev.clientX - startX + (ev.clientY - startY)) / 180;
      onChange({ scale: Math.max(0.35, Math.min(2.5, startScale + delta)) });
    };

    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  const maxDim = Math.max(object.width || 120, object.height || 120);
  const baseW = Math.max(56, Math.round(((object.width || 120) / maxDim) * 130));
  const baseH = Math.max(56, Math.round(((object.height || 120) / maxDim) * 130));
  const delaySec = `${(animIndex % 5) * 0.18}s`;

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onDoubleClick={(e) => e.stopPropagation()}
      style={{
        left: `${placed.x * 100}%`,
        top: `${placed.y * 100}%`,
        width: `${baseW}px`,
        height: `${baseH}px`,
        zIndex: placed.zIndex,
        transform: `translate(-50%, -50%) scale(${placed.scale})`,
      }}
      className="absolute touch-none select-none cursor-grab active:cursor-grabbing"
    >
      {isSelected && (
        <div
          className="absolute -inset-2 rounded-2xl border-[3px] border-dashed border-[#3a2e28] bg-white/15 pointer-events-none"
          style={{ boxShadow: '0 0 0 3px rgba(74, 222, 128, 0.75)' }}
        />
      )}

      {isSelected && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-30"
          style={{ transform: `scale(${1 / Math.max(0.65, placed.scale)})` }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ flipX: !placed.flipX });
            }}
            aria-label="Flip Drawing"
            className="w-10 h-10 rounded-full border-[2.5px] border-[#3a2e28] bg-[#ffd93d] shadow-[0_2px_0_#3a2e28] flex items-center justify-center text-[#3a2e28]"
          >
            <FlipHorizontal2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ scale: Math.max(0.35, placed.scale - 0.15) });
            }}
            aria-label="Shrink Drawing"
            className="w-10 h-10 rounded-full border-[2.5px] border-[#3a2e28] bg-white shadow-[0_2px_0_#3a2e28] flex items-center justify-center text-[#3a2e28]"
          >
            <Minus className="w-4 h-4 stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ scale: Math.min(2.5, placed.scale + 0.15) });
            }}
            aria-label="Grow Drawing"
            className="w-10 h-10 rounded-full border-[2.5px] border-[#3a2e28] bg-white shadow-[0_2px_0_#3a2e28] flex items-center justify-center text-[#3a2e28]"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Delete Drawing"
            className="w-10 h-10 rounded-full border-[2.5px] border-[#3a2e28] bg-[#ff5946] shadow-[0_2px_0_#3a2e28] flex items-center justify-center text-white"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {isSelected && (
        <button
          type="button"
          onPointerDown={handleResizeCornerDown}
          aria-label="Resize Drawing"
          style={{ transform: `scale(${1 / Math.max(0.65, placed.scale)})` }}
          className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full border-[2.5px] border-[#3a2e28] bg-[#4ade80] shadow-[0_2px_0_#3a2e28] flex items-center justify-center text-[#3a2e28] cursor-nwse-resize z-30"
        >
          <Maximize2 className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      <div
        className="w-full h-full"
        style={{ transform: placed.flipX ? 'scaleX(-1)' : undefined }}
      >
        <div
          className={`w-full h-full ${danceMode ? 'anim-dance-body' : 'anim-idle-sway'}`}
          style={{ animationDelay: delaySec }}
        >
          <img
            src={object.dataUrl}
            alt={object.name}
            draggable={false}
            className="w-full h-full object-contain pointer-events-none drop-shadow-[0_3px_2px_rgba(58,46,40,0.22)]"
          />
        </div>
      </div>
    </div>
  );
};
