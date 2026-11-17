import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ImagePlus,
  Music,
  RotateCcw,
  Upload,
  X,
  AlertTriangle,
} from 'lucide-react';
import { BodyAsset, PlaceAsset, StorybookConfig } from '../types';
import { createSampleStickerHead } from '../utils/storyHelpers';

interface TeacherModeModalProps {
  isOpen: boolean;
  config: StorybookConfig;
  onUpdateConfig: (next: StorybookConfig) => void;
  onResetDefaults: () => void;
  onClose: () => void;
}

export const TeacherModeModal: React.FC<TeacherModeModalProps> = ({
  isOpen,
  config,
  onUpdateConfig,
  onResetDefaults,
  onClose,
}) => {
  const [selectedBodyId, setSelectedBodyId] = useState<string>(
    config.bodies[0]?.id || ''
  );
  const [assetStatus, setAssetStatus] = useState<Record<string, 'ok' | 'missing'>>({});
  const [audioStatus, setAudioStatus] = useState<'ok' | 'missing' | 'checking'>('checking');

  const sampleHead = useMemo(() => {
    if (typeof document === 'undefined') return '';
    return createSampleStickerHead('#ffe0bd', '#ff8b8b', '#4a3228');
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (!config.bodies.some((b) => b.id === selectedBodyId)) {
      setSelectedBodyId(config.bodies[0]?.id || '');
    }

    // Verify files
    const checkImages = async () => {
      const next: Record<string, 'ok' | 'missing'> = {};
      await Promise.all([
        ...config.bodies.map(
          (b) =>
            new Promise<void>((res) => {
              const img = new Image();
              img.onload = () => {
                next[b.id] = 'ok';
                res();
              };
              img.onerror = () => {
                next[b.id] = 'missing';
                res();
              };
              img.src = b.src;
            })
        ),
        ...config.places.map(
          (p) =>
            new Promise<void>((res) => {
              const img = new Image();
              img.onload = () => {
                next[p.id] = 'ok';
                res();
              };
              img.onerror = () => {
                next[p.id] = 'missing';
                res();
              };
              img.src = p.src;
            })
        ),
      ]);
      setAssetStatus(next);
    };

    const checkAudio = async () => {
      setAudioStatus('checking');
      try {
        if (config.danceSongUrl.startsWith('data:')) {
          setAudioStatus('ok');
          return;
        }
        const resp = await fetch(config.danceSongUrl, { method: 'HEAD' });
        setAudioStatus(resp.ok ? 'ok' : 'missing');
      } catch {
        setAudioStatus('missing');
      }
    };

    void checkImages();
    void checkAudio();
  }, [isOpen, config.bodies, config.places, config.danceSongUrl, selectedBodyId]);

  if (!isOpen) return null;

  const activeBody =
    config.bodies.find((b) => b.id === selectedBodyId) || config.bodies[0];

  const updateActiveBody = (patch: Partial<BodyAsset>) => {
    if (!activeBody) return;
    onUpdateConfig({
      ...config,
      bodies: config.bodies.map((b) =>
        b.id === activeBody.id ? { ...b, ...patch } : b
      ),
    });
  };

  const handleUploadFiles = (
    files: FileList | null,
    kind: 'body' | 'place' | 'audio'
  ) => {
    if (!files || files.length === 0) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        if (!dataUrl) return;
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        if (kind === 'body') {
          const newBody: BodyAsset = {
            id: `custom-body-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: cleanName,
            src: dataUrl,
            neckX: 0.5,
            neckY: 0.22,
            headScale: 1.0,
          };
          onUpdateConfig({
            ...config,
            bodies: [...config.bodies, newBody],
          });
          setSelectedBodyId(newBody.id);
        } else if (kind === 'place') {
          const newPlace: PlaceAsset = {
            id: `custom-place-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: cleanName,
            src: dataUrl,
          };
          onUpdateConfig({
            ...config,
            places: [...config.places, newPlace],
          });
        } else {
          onUpdateConfig({
            ...config,
            danceSongUrl: dataUrl,
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3a2e28]/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[28px] border-[4px] border-[#3a2e28] bg-[#fffaf0] shadow-[0_8px_0_#3a2e28] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#38bdf8] border-b-[3px] border-[#3a2e28] shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#3a2e28]">
            Teacher Setup Mode
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Teacher Setup"
            className="w-12 h-12 rounded-2xl border-[3px] border-[#3a2e28] bg-white flex items-center justify-center text-[#3a2e28]"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Google Apps Script URL */}
          <section className="rounded-3xl border-[3px] border-[#3a2e28] bg-[#fff4dd] p-4 space-y-2">
            <label className="block text-base font-bold text-[#3a2e28]">
              Google Apps Script Web App URL (Google Drive Export)
            </label>
            <input
              type="url"
              value={config.googleAppsScriptUrl}
              onChange={(e) =>
                onUpdateConfig({ ...config, googleAppsScriptUrl: e.target.value })
              }
              className="w-full min-h-[48px] px-3.5 rounded-xl border-2 border-[#3a2e28] bg-white text-sm font-mono text-[#3a2e28]"
            />
          </section>

          {/* Asset Verification & Drop / Upload Fallbacks */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bodies */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleUploadFiles(e.dataTransfer.files, 'body');
              }}
              className="rounded-3xl border-[3px] border-[#3a2e28] bg-white p-4 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-[#3a2e28]">
                  Body PNGs (./make-you-bodies/)
                </h3>
                <label className="storybook-btn px-3 py-1.5 min-h-[44px] rounded-xl bg-[#ffd93d] text-sm font-bold flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  <span>Add PNG</span>
                  <input
                    type="file"
                    accept="image/png,image/*"
                    multiple
                    onChange={(e) => handleUploadFiles(e.target.files, 'body')}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs font-medium text-[#3a2e28]/70">
                Drag and drop transparent PNGs here, or tap a body below to adjust its neck anchor.
              </p>
              <div className="max-h-44 overflow-y-auto space-y-1.5 pr-1">
                {config.bodies.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBodyId(b.id)}
                    className={`w-full px-3 py-2 rounded-xl border-2 flex items-center justify-between text-left text-sm font-bold ${
                      b.id === activeBody?.id
                        ? 'border-[#ff5946] bg-[#fff0c2]'
                        : 'border-[#3a2e28]/30 bg-[#fffaf0]'
                    }`}
                  >
                    <span className="truncate">{b.name}</span>
                    {assetStatus[b.id] === 'ok' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs shrink-0">
                        <CheckCircle2 className="w-4 h-4" /> Ready
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 text-xs shrink-0">
                        <AlertTriangle className="w-4 h-4" /> Check file
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Places & Music */}
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleUploadFiles(e.dataTransfer.files, 'place');
                }}
                className="rounded-3xl border-[3px] border-[#3a2e28] bg-white p-4 space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-lg font-bold text-[#3a2e28]">
                    Places (./Tung Chung Places/)
                  </h3>
                  <label className="storybook-btn px-3 py-1.5 min-h-[44px] rounded-xl bg-[#4ade80] text-sm font-bold flex items-center gap-1.5 cursor-pointer">
                    <ImagePlus className="w-4 h-4" />
                    <span>Add Place</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleUploadFiles(e.target.files, 'place')}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="max-h-28 overflow-y-auto space-y-1">
                  {config.places.map((p) => (
                    <div
                      key={p.id}
                      className="px-3 py-1.5 rounded-xl border border-[#3a2e28]/25 bg-[#fffaf0] flex items-center justify-between text-sm font-bold"
                    >
                      <span className="truncate">{p.name}</span>
                      {assetStatus[p.id] === 'ok' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border-[3px] border-[#3a2e28] bg-white p-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-base font-bold text-[#3a2e28] flex items-center gap-1.5">
                    <Music className="w-5 h-5" />
                    <span>Dance Song (./Tung Chung.mp3)</span>
                  </div>
                  <div className="text-xs font-bold text-[#3a2e28]/70 mt-0.5">
                    Status:{' '}
                    {audioStatus === 'ok'
                      ? 'Loaded & Ready'
                      : audioStatus === 'checking'
                      ? 'Checking...'
                      : 'Not found'}
                  </div>
                </div>
                <label className="storybook-btn px-3 py-2 min-h-[44px] rounded-xl bg-[#ffd93d] text-sm font-bold cursor-pointer flex items-center gap-1.5 shrink-0">
                  <Upload className="w-4 h-4" />
                  <span>Replace MP3</span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => handleUploadFiles(e.target.files, 'audio')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </section>

          {/* Neck Anchor Calibration */}
          {activeBody && (
            <section className="rounded-3xl border-[3px] border-[#3a2e28] bg-[#fff4dd] p-4 grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-[#3a2e28]">
                  Neck Anchor Calibration: {activeBody.name}
                </h3>

                <div>
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span>neckX</span>
                    <span className="tabular-nums">{activeBody.neckX.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="0.8"
                    step="0.01"
                    value={activeBody.neckX}
                    onChange={(e) =>
                      updateActiveBody({ neckX: parseFloat(e.target.value) })
                    }
                    className="w-full h-8 accent-[#ff5946]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span>neckY</span>
                    <span className="tabular-nums">{activeBody.neckY.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.5"
                    step="0.01"
                    value={activeBody.neckY}
                    onChange={(e) =>
                      updateActiveBody({ neckY: parseFloat(e.target.value) })
                    }
                    className="w-full h-8 accent-[#ff5946]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm font-bold mb-1">
                    <span>headScale</span>
                    <span className="tabular-nums">{activeBody.headScale.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="0.6"
                    max="1.6"
                    step="0.02"
                    value={activeBody.headScale}
                    onChange={(e) =>
                      updateActiveBody({ headScale: parseFloat(e.target.value) })
                    }
                    className="w-full h-8 accent-[#ff5946]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-center bg-white rounded-2xl border-2 border-[#3a2e28] p-4 h-60">
                <div className="relative w-[170px] h-[205px]">
                  <img
                    src={activeBody.src}
                    alt={activeBody.name}
                    className="w-full h-full object-contain"
                  />
                  {sampleHead && (
                    <img
                      src={sampleHead}
                      alt="Sample head calibration"
                      style={{
                        left: `${activeBody.neckX * 100}%`,
                        top: `${activeBody.neckY * 100}%`,
                        width: `${170 * 0.56 * activeBody.headScale}px`,
                        transform: 'translate(-50%, -84%)',
                      }}
                      className="absolute pointer-events-none"
                    />
                  )}
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#fff4dd] border-t-[3px] border-[#3a2e28] shrink-0">
          <button
            type="button"
            onClick={onResetDefaults}
            className="storybook-btn px-4 rounded-2xl bg-white text-sm sm:text-base font-bold text-[#3a2e28] flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to config.js</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="storybook-btn px-7 rounded-2xl bg-[#4ade80] text-lg font-bold text-[#3a2e28]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
