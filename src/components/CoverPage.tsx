import React, { useMemo } from 'react';
import { BookOpen, Play, Settings } from 'lucide-react';
import { BodyAsset, PlaceAsset } from '../types';
import { createSampleStickerHead } from '../utils/storyHelpers';

interface CoverPageProps {
  places: PlaceAsset[];
  bodies: BodyAsset[];
  onStartBook: () => void;
  onOpenTeacherMode: () => void;
}

export const CoverPage: React.FC<CoverPageProps> = ({
  places,
  bodies,
  onStartBook,
  onOpenTeacherMode,
}) => {
  const sampleHeads = useMemo(() => {
    if (typeof document === 'undefined') return [];
    return [
      createSampleStickerHead('#ffe0bd', '#ff8b8b', '#4a3228'),
      createSampleStickerHead('#f6cda4', '#ff9494', '#2c221e'),
      createSampleStickerHead('#fde5c8', '#ff7b7b', '#6d4528'),
    ];
  }, []);

  const coverBg = places[0]?.src || './Tung Chung Places/ngong-ping-cable-car.jpg';
  const previewBodies = [
    bodies[0] || bodies[0],
    bodies[1] || bodies[0],
    bodies[3] || bodies[0],
  ].filter(Boolean);

  return (
    <div className="min-h-screen w-full bg-[#fff5e1] flex flex-col items-center justify-center p-3 sm:p-6 relative overflow-hidden">
      {/* Corner Teacher Setup Gear */}
      <button
        type="button"
        onClick={onOpenTeacherMode}
        aria-label="Teacher Setup Mode"
        title="Teacher Setup Mode"
        className="storybook-btn fixed top-3 right-3 z-30 w-14 h-14 rounded-2xl bg-[#fffaf0] flex items-center justify-center text-[#3a2e28]"
      >
        <Settings className="w-7 h-7" />
      </button>

      {/* Main Picture Book Cover Card */}
      <div className="w-full max-w-5xl rounded-[32px] border-[4px] border-[#3a2e28] bg-[#fffaf0] shadow-[0_10px_0_#3a2e28] overflow-hidden flex flex-col">
        {/* Top Title Banner */}
        <div className="bg-[#ffd93d] border-b-[4px] border-[#3a2e28] px-6 py-5 sm:py-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-[#3a2e28]/80 mb-1">
            <BookOpen className="w-5 h-5" />
            <span>Interactive Picture Book</span>
          </div>
          <h1
            className="text-3xl sm:text-5xl font-bold text-[#3a2e28] leading-tight"
            style={{ textWrap: 'balance' }}
          >
            Special People in a Special Place:{' '}
            <span className="text-[#dc2626]">Tung Chung!</span>
          </h1>
        </div>

        {/* Sample Animated Preview Stage */}
        <div className="relative w-full aspect-[16/9] max-h-[460px] bg-[#bae6fd] overflow-hidden border-b-[4px] border-[#3a2e28]">
          <img
            src={coverBg}
            alt="Tung Chung storybook scene"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />

          {/* Three animated preview characters waving & dancing on the boardwalk */}
          <div className="absolute inset-0 flex items-end justify-center gap-4 sm:gap-12 pb-6 sm:pb-10 pointer-events-none">
            {previewBodies.map((body, idx) => (
              <div
                key={body.id + idx}
                className="relative w-[112px] sm:w-[152px] h-[140px] sm:h-[190px] anim-dance-hop"
                style={{ animationDelay: `${idx * 0.22}s` }}
              >
                <div
                  className="w-full h-full relative anim-dance-body"
                  style={{ animationDelay: `${idx * 0.22}s` }}
                >
                  <img
                    src={body.src}
                    alt={body.name}
                    className="w-full h-full object-contain drop-shadow-[0_4px_0_rgba(58,46,40,0.22)]"
                  />
                  {sampleHeads[idx] && (
                    <div
                      style={{
                        left: `${body.neckX * 100}%`,
                        top: `${body.neckY * 100}%`,
                        width: '56%',
                        transform: 'translate(-50%, -84%)',
                      }}
                      className="absolute"
                    >
                      <img
                        src={sampleHeads[idx]}
                        alt="Sample friend"
                        className="w-full h-auto anim-dance-head"
                        style={{ animationDelay: `${idx * 0.18}s` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Footer */}
        <div className="p-5 sm:p-7 bg-[#fff4dd] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="text-lg sm:text-xl font-bold text-[#3a2e28]">
              Create yourself and 10 friends in Tung Chung!
            </p>
            <p className="text-sm sm:text-base font-medium text-[#3a2e28]/75">
              Take selfies, spin the word wheels, read aloud, and dance together on Page 12.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartBook}
            className="storybook-btn w-full sm:w-auto px-8 py-4 min-h-[64px] rounded-3xl bg-[#ff5946] hover:bg-[#f4432f] text-white text-xl sm:text-2xl font-bold flex items-center justify-center gap-3 shrink-0"
          >
            <Play className="w-7 h-7 fill-white" />
            <span>Start Making My Book!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
