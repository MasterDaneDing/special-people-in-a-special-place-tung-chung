import React, { useRef, useState } from 'react';
import { FlipHorizontal2, Maximize2, Minus, Plus } from 'lucide-react';
import { Character, PlacedCharacter } from '../types';

interface InteractiveCharacterProps {
  character: Character;
  placed: PlacedCharacter;
  stageRef: React.RefObject<HTMLDivElement | null>;
  isSelected: boolean;
  danceMode: boolean;
  animIndex: number;
  onSelect: () => void;
  onChange: (patch: Partial<PlacedCharacter>) => void;
}

export const InteractiveCharacter: React.FC<InteractiveCharacterProps> = ({
  character,
  placed,
  stageRef,
  isSelected,
  danceMode,
  animIndex,
  onSelect,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const gestureRef = useRef<{
    mode: 'drag' | 'pinch' | 'resize' | null;
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
      setIsDragging(true);
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
      setIsDragging(false);
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
        0.45,
        Math.min(2.2, gestureRef.current.startScale * ratio)
      );
      onChange({ scale: nextScale });
    } else if (gestureRef.current.mode === 'drag' && pts.length === 1) {
      const dx = (pts[0].x - gestureRef.current.startCenterX) / rect.width;
      const dy = (pts[0].y - gestureRef.current.startCenterY) / rect.height;
      const nextX = Math.max(
        0.07,
        Math.min(0.93, gestureRef.current.startPlacedX + dx)
      );
      const nextY = Math.max(
        0.18,
        Math.min(0.86, gestureRef.current.startPlacedY + dy)
      );
      onChange({ x: nextX, y: nextY });
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
      setIsDragging(false);
    } else if (pointersRef.current.size === 1) {
      const [pt] = Array.from(pointersRef.current.values());
      gestureRef.current = {
        mode: 'drag',
        startCenterX: pt.x,
        startCenterY: pt.y,
        startPlacedX: placed.x,
        startPlacedY: placed.y,
        startPinchDist: 0,
        startScale: placed.scale,
      };
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
      const nextScale = Math.max(0.45, Math.min(2.2, startScale + delta));
      onChange({ scale: nextScale });
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

  const baseW = 156;
  const baseH = 190;
  const headWidth =
    baseW * 0.56 * character.baseHeadScale * character.headScale;
  const neckLeftPct = character.neckX * 100;
  const neckTopPct = character.neckY * 100;
  const delaySec = `${(animIndex % 6) * 0.16}s`;

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
      {/* Selection Frame & Controls */}
      {isSelected && (
        <div
          className="absolute -inset-2 rounded-3xl border-[3px] border-dashed border-[#3a2e28] bg-white/15 pointer-events-none"
          style={{
            boxShadow: '0 0 0 3px rgba(255, 217, 61, 0.75)',
          }}
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
            title="Flip Character"
            aria-label="Flip Character"
            className="w-11 h-11 rounded-full border-[2.5px] border-[#3a2e28] bg-[#ffd93d] shadow-[0_2px_0_#3a2e28] flex items-center justify-center text-[#3a2e28] active:translate-y-0.5"
          >
            <FlipHorizontal2 className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ scale: Math.max(0.45, placed.scale - 0.15) });
            }}
            title="Shrink"
            aria-label="Shrink Character"
            className="w-11 h-11 rounded-full border-[2.5px] border-[#3a2e28] bg-white shadow-[0_2px_0_#3a2e28] flex items-center justify-center text-[#3a2e28] active:translate-y-0.5"
          >
            <Minus className="w-5 h-5 stroke-[3]" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ scale: Math.min(2.2, placed.scale + 0.15) });
            }}
            title="Grow"
            aria-label="Grow Character"
            className="w-11 h-11 rounded-full border-[2.5px] border-[#3a2e28] bg-white shadow-[0_2px_0_#3a2e28] flex items-center justify-center text-[#3a2e28] active:translate-y-0.5"
          >
            <Plus className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      )}

      {isSelected && (
        <button
          type="button"
          onPointerDown={handleResizeCornerDown}
          title="Drag to resize"
          aria-label="Resize handle"
          style={{ transform: `scale(${1 / Math.max(0.65, placed.scale)})` }}
          className="absolute -bottom-4 -right-4 w-11 h-11 rounded-full border-[2.5px] border-[#3a2e28] bg-[#38bdf8] shadow-[0_2px_0_#3a2e28] flex items-center justify-center text-[#3a2e28] cursor-nwse-resize z-30"
        >
          <Maximize2 className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}

      {/* Flip Wrapper */}
      <div
        className="w-full h-full relative"
        style={{
          transform: placed.flipX ? 'scaleX(-1)' : undefined,
        }}
      >
        {/* Outer Sway / Dance Hop Wrapper */}
        <div
          className={`w-full h-full relative ${
            danceMode
              ? 'anim-dance-hop'
              : isDragging
              ? 'anim-step-bounce'
              : 'anim-idle-sway'
          }`}
          style={{ animationDelay: delaySec }}
        >
          {/* Ground Shadow */}
          <div
            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[56%] h-4 rounded-full bg-[#3a2e28]/20 blur-[1px]"
          />

          {/* Body Layer with Breathing / Dance Bounce */}
          <div
            className={`w-full h-full relative ${
              danceMode ? 'anim-dance-body' : 'anim-breathe'
            }`}
            style={{ animationDelay: delaySec }}
          >
            <img
              src={character.bodySrc}
              alt={character.name}
              draggable={false}
              className="w-full h-full object-contain pointer-events-none drop-shadow-[0_3px_0_rgba(58,46,40,0.18)]"
            />

            {/* Independent Head Pivot anchored cleanly to Body Neck */}
            <div
              style={{
                left: `calc(${neckLeftPct}% + ${character.headOffsetX * 0.78}px)`,
                top: `calc(${neckTopPct}% + ${character.headOffsetY * 0.78}px)`,
                width: `${headWidth}px`,
                transform: `translate(-50%, -84%) rotate(${character.headTilt}deg)`,
              }}
              className="absolute pointer-events-none"
            >
              <div
                className={danceMode ? 'anim-dance-head' : 'anim-head-bob'}
                style={{ animationDelay: delaySec }}
              >
                <img
                  src={character.headDataUrl}
                  alt={`${character.name} face`}
                  draggable={false}
                  className="w-full h-auto object-contain drop-shadow-[0_3px_2px_rgba(58,46,40,0.28)]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Name tag gently floating below when selected */}
      {isSelected && character.name && (
        <div
          className="absolute -bottom-9 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-xl border-2 border-[#3a2e28] bg-[#fffaf0] text-sm font-bold text-[#3a2e28] whitespace-nowrap shadow-[0_2px_0_#3a2e28]"
          style={{ transform: `scale(${1 / Math.max(0.7, placed.scale)})` }}
        >
          {character.name}
        </div>
      )}
    </div>
  );
};
