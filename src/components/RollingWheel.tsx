import React, { useRef, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface RollingWheelProps<T extends string> {
  items: readonly T[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  accentBg?: string;
  minWidthClass?: string;
  onValueClick?: (value: T) => void;
}

const ROW_HEIGHT = 44;

export function RollingWheel<T extends string>({
  items,
  value,
  onChange,
  ariaLabel,
  accentBg = 'bg-[#ffd93d]',
  minWidthClass = 'min-w-[148px]',
  onValueClick,
}: RollingWheelProps<T>) {
  const selectedIndex = Math.max(0, items.indexOf(value));
  const [dragOffset, setDragOffset] = useState(0);
  const dragRef = useRef<{
    pointerId: number | null;
    startY: number;
    startIndex: number;
    moved: boolean;
    captured: boolean;
  }>({
    pointerId: null,
    startY: 0,
    startIndex: selectedIndex,
    moved: false,
    captured: false,
  });

  const step = (delta: number) => {
    const nextIdx = (selectedIndex + delta + items.length) % items.length;
    onChange(items[nextIdx]);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // Delay capture until the pointer actually moves so a tap can open the vocab card.
    dragRef.current = {
      pointerId: e.pointerId,
      startY: e.clientY,
      startIndex: selectedIndex,
      moved: false,
      captured: false,
    };
    setDragOffset(0);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== e.pointerId) return;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dy) > 8) {
      dragRef.current.moved = true;
      if (!dragRef.current.captured) {
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          // ignore
        }
        dragRef.current.captured = true;
      }
    }
    if (!dragRef.current.moved) return;
    setDragOffset(dy);

    const stepsMoved = Math.round(-dy / ROW_HEIGHT);
    if (stepsMoved !== 0) {
      const nextIdx =
        (((dragRef.current.startIndex + stepsMoved) % items.length) +
          items.length) %
        items.length;
      if (items[nextIdx] !== value) {
        onChange(items[nextIdx]);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== e.pointerId) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    dragRef.current.pointerId = null;
    setDragOffset(0);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.deltaY > 10) step(1);
    else if (e.deltaY < -10) step(-1);
  };

  const prevItem = items[(selectedIndex - 1 + items.length) % items.length];
  const nextItem = items[(selectedIndex + 1) % items.length];
  const subtleShift = Math.max(-14, Math.min(14, dragOffset % ROW_HEIGHT));

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-2xl border-[3px] border-[#3a2e28] bg-[#fff4dd] px-1.5 py-1 shadow-[0_3px_0_#3a2e28] align-middle ${minWidthClass}`}
      role="listbox"
      aria-label={ariaLabel}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative flex-1 h-[96px] overflow-hidden cursor-ns-resize touch-none flex flex-col items-center justify-center select-none"
        style={{ perspective: '260px' }}
      >
        {/* Top drum row */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!dragRef.current.moved) step(-1);
          }}
          className="w-full h-[26px] flex items-center justify-center text-sm sm:text-base font-bold text-[#3a2e28]/45 hover:text-[#3a2e28]/75 transition-transform whitespace-nowrap truncate px-1"
          style={{
            transform: `translateY(${subtleShift * 0.4}px) rotateX(28deg) scale(0.88)`,
          }}
          tabIndex={-1}
        >
          {prevItem}
        </button>

        {/* Center active drum window */}
        {onValueClick ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!dragRef.current.moved) onValueClick(value);
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              if (!dragRef.current.moved) onValueClick(value);
            }}
            aria-label={`What does ${value} mean?`}
            className={`w-full h-[40px] rounded-xl border-[2.5px] border-[#3a2e28] ${accentBg} flex items-center justify-center px-2.5 shadow-inner cursor-pointer`}
            style={{
              transform: `translateY(${subtleShift * 0.25}px)`,
            }}
          >
            <span className="text-lg sm:text-xl font-bold text-[#3a2e28] whitespace-nowrap truncate">
              {value}
            </span>
          </button>
        ) : (
          <div
            className={`w-full h-[40px] rounded-xl border-[2.5px] border-[#3a2e28] ${accentBg} flex items-center justify-center px-2.5 shadow-inner`}
            style={{
              transform: `translateY(${subtleShift * 0.25}px)`,
            }}
          >
            <span className="text-lg sm:text-xl font-bold text-[#3a2e28] whitespace-nowrap truncate">
              {value}
            </span>
          </div>
        )}

        {/* Bottom drum row */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!dragRef.current.moved) step(1);
          }}
          className="w-full h-[26px] flex items-center justify-center text-sm sm:text-base font-bold text-[#3a2e28]/45 hover:text-[#3a2e28]/75 transition-transform whitespace-nowrap truncate px-1"
          style={{
            transform: `translateY(${subtleShift * 0.4}px) rotateX(-28deg) scale(0.88)`,
          }}
          tabIndex={-1}
        >
          {nextItem}
        </button>
      </div>

      {/* Tactile step buttons for easy iPad tapping */}
      <div className="flex flex-col gap-1 shrink-0">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            step(-1);
          }}
          aria-label={`Previous ${ariaLabel}`}
          className="w-9 h-9 rounded-xl border-2 border-[#3a2e28] bg-white hover:bg-[#ffe9a8] active:translate-y-0.5 flex items-center justify-center text-[#3a2e28]"
        >
          <ChevronUp className="w-5 h-5 stroke-[3]" />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            step(1);
          }}
          aria-label={`Next ${ariaLabel}`}
          className="w-9 h-9 rounded-xl border-2 border-[#3a2e28] bg-white hover:bg-[#ffe9a8] active:translate-y-0.5 flex items-center justify-center text-[#3a2e28]"
        >
          <ChevronDown className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
