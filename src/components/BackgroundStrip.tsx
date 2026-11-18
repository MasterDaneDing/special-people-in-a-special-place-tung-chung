import React, { useRef } from 'react';
import { Check, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { PlaceAsset } from '../types';

interface BackgroundStripProps {
  places: PlaceAsset[];
  activePlaceId: string;
  isOpen: boolean;
  onSelectPlace: (placeId: string) => void;
  onClose: () => void;
}

const SCROLL_STEP = 220;

export const BackgroundStrip: React.FC<BackgroundStripProps> = ({
  places,
  activePlaceId,
  isOpen,
  onSelectPlace,
  onClose,
}) => {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  if (!isOpen) return null;

  const scrollByCards = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * SCROLL_STEP, behavior: 'smooth' });
  };

  return (
    <div
      className="absolute top-16 left-3 right-3 z-40 rounded-3xl border-[3px] border-[#3a2e28] bg-[#fffaf0]/95 backdrop-blur-sm p-3 shadow-[0_5px_0_#3a2e28]"
      onPointerDown={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-base sm:text-lg font-bold text-[#3a2e28]">
          Pick a Tung Chung Place (or double-tap the sky!)
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close places strip"
          className="w-11 h-11 rounded-2xl border-2 border-[#3a2e28] bg-white hover:bg-[#ffe9a8] flex items-center justify-center text-[#3a2e28]"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>
      </div>

      <div className="flex items-stretch gap-2">
        <button
          type="button"
          onClick={() => scrollByCards(-1)}
          aria-label="Scroll places left"
          className="storybook-btn flex w-11 sm:w-12 shrink-0 self-center rounded-2xl bg-[#ffd93d] items-center justify-center text-[#3a2e28]"
        >
          <ChevronLeft className="w-7 h-7 stroke-[3]" />
        </button>

        <div
          ref={scrollerRef}
          className="flex-1 flex items-stretch gap-3 overflow-x-auto places-strip-scroll"
        >
          {places.map((place) => {
            const active = place.id === activePlaceId;
            return (
              <button
                key={place.id}
                type="button"
                onClick={() => onSelectPlace(place.id)}
                title={place.name}
                className={`relative shrink-0 w-40 sm:w-44 rounded-2xl border-[3px] overflow-hidden text-left transition-transform active:scale-95 ${
                  active
                    ? 'border-[#ff5946] ring-4 ring-[#ffd93d]'
                    : 'border-[#3a2e28]'
                }`}
              >
                <img
                  src={place.src}
                  alt={place.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-24 object-cover block"
                />
                <div className="px-2.5 py-1.5 bg-[#fff4dd] border-t-2 border-[#3a2e28] flex items-start justify-between gap-1 min-h-[3.1rem]">
                  <span className="text-sm font-bold text-[#3a2e28] leading-tight line-clamp-2">
                    {place.name}
                  </span>
                  {active && (
                    <span className="w-5 h-5 rounded-full bg-[#ff5946] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => scrollByCards(1)}
          aria-label="Scroll places right"
          className="storybook-btn flex w-11 sm:w-12 shrink-0 self-center rounded-2xl bg-[#ffd93d] items-center justify-center text-[#3a2e28]"
        >
          <ChevronRight className="w-7 h-7 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
