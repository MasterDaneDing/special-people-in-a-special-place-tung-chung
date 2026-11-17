import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Camera,
  Check,
  ImagePlus,
  Loader2,
  RotateCcw,
  RotateCw,
  UserCheck,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { BodyAsset, Character } from '../types';
import { extractFeatheredHead, warmUpHeadSegmenter } from '../utils/headSegmenter';

interface CharacterCreatorModalProps {
  isOpen: boolean;
  pageNumber: number;
  defaultName: string;
  bodies: BodyAsset[];
  initialCharacter?: Character | null;
  onClose: () => void;
  onComplete: (character: Character) => void;
}

export const CharacterCreatorModal: React.FC<CharacterCreatorModalProps> = ({
  isOpen,
  pageNumber,
  defaultName,
  bodies,
  initialCharacter,
  onClose,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedBody, setSelectedBody] = useState<BodyAsset>(bodies[0]);
  const [name, setName] = useState(defaultName);

  const [headDataUrl, setHeadDataUrl] = useState<string | null>(null);
  const [headOffsetX, setHeadOffsetX] = useState(0);
  const [headOffsetY, setHeadOffsetY] = useState(0);
  const [headScale, setHeadScale] = useState(1.0);
  const [headTilt, setHeadTilt] = useState(0);

  const [isProcessing, setIsProcessing] = useState(false);
  const [statusNote, setStatusNote] = useState<string>('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraFileRef = useRef<HTMLInputElement | null>(null);
  const galleryFileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    warmUpHeadSegmenter();
    if (initialCharacter) {
      const matchedBody =
        bodies.find((b) => b.id === initialCharacter.bodyId) || bodies[0];
      setSelectedBody(matchedBody);
      setName(initialCharacter.name);
      setHeadDataUrl(initialCharacter.headDataUrl);
      setHeadOffsetX(initialCharacter.headOffsetX);
      setHeadOffsetY(initialCharacter.headOffsetY);
      setHeadScale(initialCharacter.headScale);
      setHeadTilt(initialCharacter.headTilt);
      setStep(2);
    } else {
      setStep(1);
      setSelectedBody(bodies[0]);
      setName(pageNumber === 1 ? 'Me' : defaultName);
      setHeadDataUrl(null);
      setHeadOffsetX(0);
      setHeadOffsetY(0);
      setHeadScale(1.0);
      setHeadTilt(0);
      setStatusNote('');
      setCameraError('');
    }
  }, [isOpen, pageNumber, defaultName, bodies, initialCharacter]);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startLiveCamera = async () => {
    setCameraError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Live camera not available. Use Take Selfie or Upload Photo below!');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 960 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      setCameraActive(true);
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          void videoRef.current.play();
        }
      });
    } catch {
      setCameraError('Camera permission was blocked. Use Take Selfie or Upload Photo below!');
    }
  };

  const processPhotoDataUrl = async (rawDataUrl: string) => {
    setIsProcessing(true);
    setStatusNote('Cutting out head cleanly...');
    try {
      const res = await extractFeatheredHead(rawDataUrl);
      setHeadDataUrl(res.dataUrl);
      setHeadOffsetX(0);
      setHeadOffsetY(0);
      setHeadScale(1.0);
      setHeadTilt(0);
      setStatusNote(
        res.detectedFace
          ? 'Head cutout ready! Use the buttons below to adjust it on the neck.'
          : 'Cutout ready! Nudge or zoom to fit nicely on the neck.'
      );
    } catch (err) {
      console.error(err);
      setStatusNote('Could not process that photo. Please try another photo.');
    } finally {
      setIsProcessing(false);
    }
  };

  const snapFromLiveCamera = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d')!;
    // Mirror front camera preview horizontally so it feels natural
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    stopCamera();
    await processPhotoDataUrl(dataUrl);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string') {
        stopCamera();
        await processPhotoDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFinish = () => {
    if (!headDataUrl || !selectedBody) return;
    const finalName =
      name.trim() || (pageNumber === 1 ? 'Me' : `Friend ${pageNumber}`);
    onComplete({
      id: initialCharacter?.id || `char-${pageNumber}-${Date.now()}`,
      name: finalName,
      headDataUrl,
      bodyId: selectedBody.id,
      bodySrc: selectedBody.src,
      headOffsetX,
      headOffsetY,
      headScale,
      headTilt,
      neckX: selectedBody.neckX,
      neckY: selectedBody.neckY,
      baseHeadScale: selectedBody.headScale,
      createdOnPage: initialCharacter?.createdOnPage || pageNumber,
    });
  };

  if (!isOpen) return null;

  const isMe = pageNumber === 1;
  const titleText = isMe
    ? 'Make Yourself!'
    : `Add Friend #${pageNumber}!`;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3a2e28]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-4xl max-h-[94vh] flex flex-col rounded-[28px] border-[4px] border-[#3a2e28] bg-[#fffaf0] shadow-[0_8px_0_#3a2e28] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#ffd93d] border-b-[3px] border-[#3a2e28] shrink-0">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl border-2 border-[#3a2e28] bg-white text-sm sm:text-base font-bold">
              Step {step} of 2
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-[#3a2e28]">
              {titleText}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            aria-label="Close character creator"
            className="w-12 h-12 rounded-2xl border-[3px] border-[#3a2e28] bg-white hover:bg-[#ffe5df] flex items-center justify-center text-[#3a2e28]"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-lg sm:text-xl font-bold text-[#3a2e28]">
                1. Pick a body outfit:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {bodies.map((body) => {
                  const active = selectedBody?.id === body.id;
                  return (
                    <button
                      key={body.id}
                      type="button"
                      onClick={() => setSelectedBody(body)}
                      className={`group rounded-3xl border-[3px] p-3 flex flex-col items-center gap-2 transition-transform active:scale-95 ${
                        active
                          ? 'border-[#ff5946] bg-[#fff0c2] ring-4 ring-[#ffd93d] shadow-[0_4px_0_#3a2e28]'
                          : 'border-[#3a2e28] bg-white hover:bg-[#fff6e3] shadow-[0_3px_0_#3a2e28]'
                      }`}
                    >
                      <div className="w-full h-36 sm:h-40 flex items-center justify-center">
                        <img
                          src={body.src}
                          alt={body.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                      <span className="text-sm sm:text-base font-bold text-[#3a2e28] text-center leading-tight">
                        {body.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Left: Camera / Photo Capture + Adjustment Controls */}
              <div className="space-y-4">
                <p className="text-lg font-bold text-[#3a2e28]">
                  2. Take a photo or pick one:
                </p>

                {/* Name Input */}
                <div className="rounded-2xl border-[3px] border-[#3a2e28] bg-[#fff4dd] p-3">
                  <label className="block text-sm font-bold text-[#3a2e28] mb-1.5">
                    {isMe ? 'Your Name (for saving your book):' : "Friend's Name:"}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isMe ? 'Type your name...' : "Type friend's name..."}
                    className="w-full min-h-[50px] px-4 rounded-xl border-[2.5px] border-[#3a2e28] bg-white text-lg font-bold text-[#3a2e28] focus:outline-none focus:ring-4 focus:ring-[#ffd93d]"
                  />
                </div>

                {/* Live Camera Box if active */}
                {cameraActive ? (
                  <div className="rounded-3xl border-[3px] border-[#3a2e28] bg-black overflow-hidden relative aspect-[4/3]">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {/* Friendly face alignment oval guide */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-40 h-52 rounded-full border-4 border-dashed border-[#ffd93d] shadow-[0_0_0_999px_rgba(0,0,0,0.28)]" />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={snapFromLiveCamera}
                        className="storybook-btn px-6 py-3 rounded-2xl bg-[#ff5946] text-white text-lg font-bold flex items-center gap-2"
                      >
                        <Camera className="w-6 h-6" />
                        Snap Photo!
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="storybook-btn px-4 py-3 rounded-2xl bg-white text-[#3a2e28] text-base font-bold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={startLiveCamera}
                      className="storybook-btn px-3 py-3 rounded-2xl bg-[#38bdf8] text-[#3a2e28] text-base font-bold flex flex-col items-center justify-center gap-1"
                    >
                      <Camera className="w-6 h-6" />
                      <span>Live Camera</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => cameraFileRef.current?.click()}
                      className="storybook-btn px-3 py-3 rounded-2xl bg-[#ffd93d] text-[#3a2e28] text-base font-bold flex flex-col items-center justify-center gap-1"
                    >
                      <Camera className="w-6 h-6" />
                      <span>iPad Selfie</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => galleryFileRef.current?.click()}
                      className="storybook-btn px-3 py-3 rounded-2xl bg-[#4ade80] text-[#3a2e28] text-base font-bold flex flex-col items-center justify-center gap-1"
                    >
                      <ImagePlus className="w-6 h-6" />
                      <span>Choose Photo</span>
                    </button>

                    <input
                      ref={cameraFileRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <input
                      ref={galleryFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}

                {cameraError && (
                  <p className="text-sm font-bold text-[#dc2626] bg-[#fee2e2] border-2 border-[#3a2e28] rounded-xl px-3 py-2">
                    {cameraError}
                  </p>
                )}

                {statusNote && (
                  <p className="text-sm font-bold text-[#3a2e28] bg-[#fff4dd] border-2 border-[#3a2e28] rounded-xl px-3 py-2">
                    {statusNote}
                  </p>
                )}

                {/* Head Fine-Tune Controls */}
                {headDataUrl && (
                  <div className="rounded-3xl border-[3px] border-[#3a2e28] bg-[#fff4dd] p-4 space-y-3">
                    <div className="text-base font-bold text-[#3a2e28]">
                      Adjust Head on Neck:
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setHeadScale((s) => Math.max(0.55, +(s - 0.08).toFixed(2)))}
                        className="storybook-btn rounded-2xl bg-white px-3 py-2 font-bold flex items-center justify-center gap-1.5"
                      >
                        <ZoomOut className="w-5 h-5" /> Smaller
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeadScale((s) => Math.min(1.65, +(s + 0.08).toFixed(2)))}
                        className="storybook-btn rounded-2xl bg-white px-3 py-2 font-bold flex items-center justify-center gap-1.5"
                      >
                        <ZoomIn className="w-5 h-5" /> Bigger
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeadTilt((t) => Math.max(-25, t - 5))}
                        className="storybook-btn rounded-2xl bg-white px-3 py-2 font-bold flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw className="w-5 h-5" /> Tilt Left
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeadTilt((t) => Math.min(25, t + 5))}
                        className="storybook-btn rounded-2xl bg-white px-3 py-2 font-bold flex items-center justify-center gap-1.5"
                      >
                        <RotateCw className="w-5 h-5" /> Tilt Right
                      </button>
                    </div>

                    {/* Nudge Pad */}
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setHeadOffsetX((x) => x - 6)}
                        aria-label="Nudge left"
                        className="storybook-btn w-14 rounded-2xl bg-white flex items-center justify-center"
                      >
                        <ArrowLeft className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeadOffsetY((y) => y - 6)}
                        aria-label="Nudge up"
                        className="storybook-btn w-14 rounded-2xl bg-white flex items-center justify-center"
                      >
                        <ArrowUp className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeadOffsetY((y) => y + 6)}
                        aria-label="Nudge down"
                        className="storybook-btn w-14 rounded-2xl bg-white flex items-center justify-center"
                      >
                        <ArrowDown className="w-6 h-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setHeadOffsetX((x) => x + 6)}
                        aria-label="Nudge right"
                        className="storybook-btn w-14 rounded-2xl bg-white flex items-center justify-center"
                      >
                        <ArrowRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Live Character Preview */}
              <div className="flex flex-col items-center justify-center rounded-3xl border-[3px] border-[#3a2e28] bg-gradient-to-b from-[#e0f2fe] to-[#dcfce7] p-6 min-h-[360px] relative">
                {isProcessing && (
                  <div className="absolute inset-0 z-20 bg-[#fffaf0]/85 rounded-[21px] flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-12 h-12 text-[#ff5946] animate-spin" />
                    <span className="text-lg font-bold text-[#3a2e28]">
                      Cutting out head...
                    </span>
                  </div>
                )}

                <div className="relative w-[220px] h-[270px]">
                  <img
                    src={selectedBody.src}
                    alt={selectedBody.name}
                    className="w-full h-full object-contain"
                  />

                  {headDataUrl ? (
                    <div
                      style={{
                        left: `calc(${selectedBody.neckX * 100}% + ${headOffsetX}px)`,
                        top: `calc(${selectedBody.neckY * 100}% + ${headOffsetY}px)`,
                        width: `${220 * 0.56 * selectedBody.headScale * headScale}px`,
                        transform: `translate(-50%, -84%) rotate(${headTilt}deg)`,
                      }}
                      className="absolute pointer-events-none"
                    >
                      <img
                        src={headDataUrl}
                        alt="Head cutout preview"
                        className="w-full h-auto object-contain drop-shadow-[0_3px_2px_rgba(58,46,40,0.28)]"
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        left: `${selectedBody.neckX * 100}%`,
                        top: `${selectedBody.neckY * 100}%`,
                        transform: 'translate(-50%, -84%)',
                      }}
                      className="absolute w-24 h-28 rounded-full border-[3px] border-dashed border-[#3a2e28]/60 bg-white/75 flex items-center justify-center text-center px-2 text-xs font-bold text-[#3a2e28]"
                    >
                      Take a photo to add face!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-[#fff4dd] border-t-[3px] border-[#3a2e28] shrink-0">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="storybook-btn px-5 rounded-2xl bg-white text-base sm:text-lg font-bold text-[#3a2e28]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="storybook-btn px-7 rounded-2xl bg-[#4ade80] text-lg sm:text-xl font-bold text-[#3a2e28] flex items-center gap-2"
              >
                <span>Next: Take Photo</span>
                <ArrowRight className="w-6 h-6 stroke-[3]" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => {
                  stopCamera();
                  setStep(1);
                }}
                className="storybook-btn px-5 rounded-2xl bg-white text-base sm:text-lg font-bold text-[#3a2e28] flex items-center gap-2"
              >
                <ArrowLeft className="w-5 h-5 stroke-[3]" />
                <span>Pick Body</span>
              </button>

              <button
                type="button"
                disabled={!headDataUrl || isProcessing}
                onClick={handleFinish}
                className="storybook-btn px-7 rounded-2xl bg-[#ff5946] text-white text-lg sm:text-xl font-bold flex items-center gap-2"
              >
                {headDataUrl ? (
                  <>
                    <UserCheck className="w-6 h-6" />
                    <span>Put on Page!</span>
                    <Check className="w-6 h-6 stroke-[3]" />
                  </>
                ) : (
                  <span>Take Photo First</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
