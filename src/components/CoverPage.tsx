import React, { useMemo } from 'react';
import { BookOpen, Play, Settings } from 'lucide-react';
import { BodyAsset, PlaceAsset } from '../types';
import { createSampleStickerHead } from '../utils/storyHelpers';

interface CoverPageProps {
  places: PlaceAsset[];
  bodies: BodyAsset[];
  studentName: string;
  studentClass: string;
  onStudentNameChange: (value: string) => void;
  onStudentClassChange: (value: string) => void;
  onStartBook: () => void;
  onOpenTeacherMode: () => void;
}

// Feet sit on the wooden boardwalk / path. Percentages are relative to the
// cover stage with the background pinned to object-bottom so the walkway
// stays visible when the card is wider than 16:9.
const COVER_SPOTS = [
  { left: '32%', bottom: '18%' },
  { left: '50%', bottom: '8%' },
  { left: '68%', bottom: '10%' },
];

export const CoverPage: React.FC<CoverPageProps> = ({
  places,
  bodies,
  studentName,
  studentClass,
  onStudentNameChange,
  onStudentClassChange,
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
            className="w-full h-full object-cover object-bottom"
          />

          {/* Three preview characters planted on the boardwalk, bouncing from their feet */}
          {previewBodies.map((body, idx) => {
            const spot = COVER_SPOTS[idx] || COVER_SPOTS[0];
            return (
              <div
                key={body.id + idx}
                className="absolute pointer-events-none w-[100px] sm:w-[132px] h-[128px] sm:h-[168px]"
                style={{
                  left: spot.left,
                  bottom: spot.bottom,
                  transform: 'translateX(-50%)',
                }}
              >
                <div
                  className="relative w-full h-full anim-dance-hop"
                  style={{
                    transformOrigin: 'center bottom',
                    animationDelay: `${idx * 0.22}s`,
                  }}
                >
                  <div
                    className="w-full h-full relative anim-dance-body"
                    style={{
                      transformOrigin: 'center bottom',
                      animationDelay: `${idx * 0.22}s`,
                    }}
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
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Footer */}
        <div className="p-5 sm:p-7 bg-[#fff4dd] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-6">
            <label className="flex items-center gap-2 text-lg sm:text-2xl font-bold text-[#3a2e28]">
              <span className="shrink-0">Name:</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => onStudentNameChange(e.target.value)}
                placeholder="_______________"
                aria-label="Student name"
                autoComplete="name"
                className="flex-1 min-w-[12rem] min-h-[52px] px-3 rounded-xl border-[3px] border-[#3a2e28] bg-white text-[#3a2e28] text-lg sm:text-2xl font-bold text-left focus:outline-none focus:ring-4 focus:ring-[#ffd93d]"
              />
            </label>
            <label className="flex items-center gap-2 text-lg sm:text-2xl font-bold text-[#3a2e28]">
              <span className="shrink-0">Class:</span>
              <input
                type="text"
                value={studentClass}
                onChange={(e) => onStudentClassChange(e.target.value)}
                placeholder="___"
                aria-label="Student class"
                className="w-28 sm:w-36 min-h-[52px] px-3 rounded-xl border-[3px] border-[#3a2e28] bg-white text-[#3a2e28] text-lg sm:text-2xl font-bold text-center focus:outline-none focus:ring-4 focus:ring-[#ffd93d]"
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
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
    </div>
  );
};
