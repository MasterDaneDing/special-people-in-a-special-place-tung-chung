import React, { useEffect, useRef, useState } from 'react';
import { Check, Eraser, PaintBucket, Pencil, Trash2, Undo2 } from 'lucide-react';

interface DrawingCanvasProps {
  mode: 'face' | 'object';
  canvasWidth?: number;
  canvasHeight?: number;
  initialDataUrl?: string | null;
  exportLabel: string;
  onExport: (dataUrl: string, dims: { width: number; height: number }) => void;
  onCancel?: () => void;
}

const PALETTE = [
  { color: '#3a2e28', label: 'Ink Brown' },
  { color: '#ff5946', label: 'Coral Red' },
  { color: '#fb923c', label: 'Orange' },
  { color: '#ffd93d', label: 'Sunny Yellow' },
  { color: '#4ade80', label: 'Leaf Green' },
  { color: '#38bdf8', label: 'Sky Blue' },
  { color: '#3b82f6', label: 'Royal Blue' },
  { color: '#a855f7', label: 'Purple' },
  { color: '#f472b6', label: 'Pink' },
  { color: '#8b5a2b', label: 'Brown' },
  { color: '#fde2c4', label: 'Light Peach' },
  { color: '#d8a47f', label: 'Warm Tan' },
  { color: '#ffffff', label: 'White' },
];

const SKIN_BASES = [
  { color: '#fff0dd', label: 'Cream' },
  { color: '#fde2c4', label: 'Peach' },
  { color: '#f3c69f', label: 'Golden' },
  { color: '#d8a47f', label: 'Tan' },
  { color: '#9c6b49', label: 'Cocoa' },
];

const BRUSH_SIZES = [5, 11, 18, 28];

type DrawTool = 'pencil' | 'fill' | 'eraser';

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  mode,
  canvasWidth = mode === 'face' ? 380 : 480,
  canvasHeight = mode === 'face' ? 400 : 420,
  initialDataUrl,
  exportLabel,
  onExport,
  onCancel,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<ImageData[]>([]);
  const [historyCount, setHistoryCount] = useState(0);

  const [color, setColor] = useState('#3a2e28');
  const [brushSize, setBrushSize] = useState(11);
  const [tool, setTool] = useState<DrawTool>('pencil');
  const [emptyWarning, setEmptyWarning] = useState(false);

  const drawingStateRef = useRef<{
    active: boolean;
    pointerId: number | null;
    lastX: number;
    lastY: number;
    midX: number;
    midY: number;
    points: { x: number; y: number }[];
  }>({
    active: false,
    pointerId: null,
    lastX: 0,
    lastY: 0,
    midX: 0,
    midY: 0,
    points: [],
  });

  const pushHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const snap = ctx.getImageData(0, 0, canvas.width, canvas.height);
    historyRef.current.push(snap);
    if (historyRef.current.length > 25) {
      historyRef.current.shift();
    }
    setHistoryCount(historyRef.current.length);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    historyRef.current = [];
    setHistoryCount(0);

    if (initialDataUrl && initialDataUrl.startsWith('data:image/')) {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(
          (canvas.width * 0.84) / img.width,
          (canvas.height * 0.84) / img.height
        );
        const dw = img.width * scale;
        const dh = img.height * scale;
        ctx.drawImage(
          img,
          (canvas.width - dw) / 2,
          (canvas.height - dh) / 2,
          dw,
          dh
        );
      };
      img.src = initialDataUrl;
    }
  }, [initialDataUrl, canvasWidth, canvasHeight]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const applyStrokeStyle = (ctx: CanvasRenderingContext2D) => {
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
      ctx.fillStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    setEmptyWarning(false);
    pushHistory();

    canvas.setPointerCapture(e.pointerId);
    const pt = getCanvasPoint(e);
    drawingStateRef.current = {
      active: true,
      pointerId: e.pointerId,
      lastX: pt.x,
      lastY: pt.y,
      midX: pt.x,
      midY: pt.y,
      points: [{ x: pt.x, y: pt.y }],
    };

    applyStrokeStyle(ctx);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (
      !drawingStateRef.current.active ||
      drawingStateRef.current.pointerId !== e.pointerId
    ) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const pt = getCanvasPoint(e);
    const { lastX, lastY, midX, midY } = drawingStateRef.current;
    const newMidX = (lastX + pt.x) / 2;
    const newMidY = (lastY + pt.y) / 2;

    applyStrokeStyle(ctx);
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.quadraticCurveTo(lastX, lastY, newMidX, newMidY);
    ctx.stroke();

    drawingStateRef.current.lastX = pt.x;
    drawingStateRef.current.lastY = pt.y;
    drawingStateRef.current.midX = newMidX;
    drawingStateRef.current.midY = newMidY;
    drawingStateRef.current.points.push({ x: pt.x, y: pt.y });
  };

  const paintFilledStroke = (ctx: CanvasRenderingContext2D, points: { x: number; y: number }[]) => {
    const pre = historyRef.current[historyRef.current.length - 1];
    if (pre) ctx.putImageData(pre, 0, 0);

    applyStrokeStyle(ctx);
    if (points.length < 2) {
      const p = points[0];
      if (!p) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    if (points.length === 2) {
      ctx.lineTo(points[1].x, points[1].y);
    } else {
      for (let i = 1; i < points.length - 1; i++) {
        const midX = (points[i].x + points[i + 1].x) / 2;
        const midY = (points[i].y + points[i + 1].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }
      const last = points[points.length - 1];
      ctx.lineTo(last.x, last.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (drawingStateRef.current.pointerId !== e.pointerId) return;
    const points = drawingStateRef.current.points;
    drawingStateRef.current.active = false;
    drawingStateRef.current.pointerId = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    if (tool === 'fill') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      paintFilledStroke(ctx, points);
    }
  };

  const handleUndo = () => {
    const canvas = canvasRef.current;
    if (!canvas || historyRef.current.length === 0) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    const prev = historyRef.current.pop()!;
    ctx.putImageData(prev, 0, 0);
    setHistoryCount(historyRef.current.length);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    pushHistory();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const stampFaceBase = (fillHex: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    pushHistory();
    setEmptyWarning(false);

    const cx = canvas.width / 2;
    const cy = canvas.height * 0.52;
    const rx = canvas.width * 0.31;
    const ry = canvas.height * 0.34;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = fillHex;
    ctx.strokeStyle = '#3a2e28';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  const handleExportClick = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const a = data[(y * width + x) * 4 + 3];
        if (a > 8) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      setEmptyWarning(true);
      return;
    }

    const pad = 12;
    const sx = Math.max(0, minX - pad);
    const sy = Math.max(0, minY - pad);
    const sw = Math.min(width - sx, maxX - minX + 1 + pad * 2);
    const sh = Math.min(height - sy, maxY - minY + 1 + pad * 2);

    const out = document.createElement('canvas');
    out.width = sw;
    out.height = sh;
    const outCtx = out.getContext('2d')!;
    outCtx.drawImage(canvas, sx, sy, sw, sh, 0, 0, sw, sh);

    onExport(out.toDataURL('image/png'), { width: sw, height: sh });
  };

  return (
    <div className="space-y-3">
      {mode === 'face' && (
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-[#3a2e28] bg-[#fff4dd] px-3 py-2">
          <span className="text-xs sm:text-sm font-bold text-[#3a2e28] mr-1">
            Quick Face Base:
          </span>
          {SKIN_BASES.map((s) => (
            <button
              key={s.color}
              type="button"
              onClick={() => stampFaceBase(s.color)}
              title={`Add ${s.label} head circle`}
              className="w-9 h-9 rounded-full border-[2.5px] border-[#3a2e28] shadow-[0_2px_0_#3a2e28] active:translate-y-0.5"
              style={{ backgroundColor: s.color }}
            />
          ))}
        </div>
      )}

      <div
        className="relative w-full rounded-3xl border-[3px] border-[#3a2e28] overflow-hidden shadow-inner mx-auto"
        style={{
          aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          maxHeight: mode === 'face' ? '330px' : '370px',
          backgroundColor: '#ffffff',
          backgroundImage:
            'radial-gradient(#e5dfd3 1.2px, transparent 1.2px)',
          backgroundSize: '18px 18px',
        }}
      >
        {mode === 'face' && (
          <svg
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            className="absolute inset-0 w-full h-full pointer-events-none opacity-45"
          >
            <ellipse
              cx={canvasWidth / 2}
              cy={canvasHeight * 0.52}
              rx={canvasWidth * 0.31}
              ry={canvasHeight * 0.34}
              fill="none"
              stroke="#9ca3af"
              strokeWidth="4"
              strokeDasharray="10 8"
            />
            <circle cx={canvasWidth * 0.41} cy={canvasHeight * 0.48} r="5" fill="#cbd5e1" />
            <circle cx={canvasWidth * 0.59} cy={canvasHeight * 0.48} r="5" fill="#cbd5e1" />
            <path
              d={`M ${canvasWidth * 0.42} ${canvasHeight * 0.62} Q ${canvasWidth * 0.5} ${canvasHeight * 0.69} ${canvasWidth * 0.58} ${canvasHeight * 0.62}`}
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        )}

        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative z-10 w-full h-full block touch-none cursor-crosshair"
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        {PALETTE.map((swatch) => {
          const active = tool !== 'eraser' && color === swatch.color;
          return (
            <button
              key={swatch.color}
              type="button"
              onClick={() => {
                setTool((current) => (current === 'eraser' ? 'pencil' : current));
                setColor(swatch.color);
              }}
              aria-label={swatch.label}
              title={swatch.label}
              className={`w-10 h-10 rounded-full border-[3px] transition-transform active:scale-90 ${
                active
                  ? 'border-[#3a2e28] ring-4 ring-[#ffd93d] scale-110'
                  : 'border-[#3a2e28]/80'
              }`}
              style={{ backgroundColor: swatch.color }}
            />
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#3a2e28] bg-[#fff4dd] p-2.5">
        <div className="flex items-center gap-1.5">
          {BRUSH_SIZES.map((sz) => {
            const active = brushSize === sz;
            return (
              <button
                key={sz}
                type="button"
                onClick={() => setBrushSize(sz)}
                aria-label={`Brush size ${sz}`}
              className={`w-11 h-11 rounded-xl border-2 border-[#3a2e28] flex items-center justify-center ${
                  active ? 'bg-[#ffd93d]' : 'bg-white'
                }`}
              >
                <span
                  className="rounded-full bg-[#3a2e28]"
                  style={{
                    width: `${Math.max(6, Math.min(24, sz * 0.85))}px`,
                    height: `${Math.max(6, Math.min(24, sz * 0.85))}px`,
                  }}
                />
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTool('pencil')}
            className={`h-11 px-3 rounded-xl border-2 border-[#3a2e28] font-bold text-sm flex items-center gap-1.5 ${
              tool === 'pencil' ? 'bg-[#38bdf8] text-[#3a2e28]' : 'bg-white text-[#3a2e28]'
            }`}
          >
            <Pencil className="w-4 h-4" />
            <span>Pencil</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('fill')}
            className={`h-11 px-3 rounded-xl border-2 border-[#3a2e28] font-bold text-sm flex items-center gap-1.5 ${
              tool === 'fill' ? 'bg-[#ffd93d] text-[#3a2e28]' : 'bg-white text-[#3a2e28]'
            }`}
          >
            <PaintBucket className="w-4 h-4" />
            <span>Fill</span>
          </button>

          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`h-11 px-3 rounded-xl border-2 border-[#3a2e28] font-bold text-sm flex items-center gap-1.5 ${
              tool === 'eraser' ? 'bg-[#ff5946] text-white' : 'bg-white text-[#3a2e28]'
            }`}
          >
            <Eraser className="w-4 h-4" />
            <span>Eraser</span>
          </button>

          <button
            type="button"
            disabled={historyCount === 0}
            onClick={handleUndo}
            aria-label="Undo"
            title="Undo"
            className="h-11 w-11 rounded-xl border-2 border-[#3a2e28] bg-white disabled:opacity-40 flex items-center justify-center text-[#3a2e28]"
          >
            <Undo2 className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear canvas"
            title="Clear"
            className="h-11 w-11 rounded-xl border-2 border-[#3a2e28] bg-white flex items-center justify-center text-[#3a2e28]"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {emptyWarning && (
        <p className="text-sm font-bold text-[#dc2626] bg-[#fee2e2] border-2 border-[#3a2e28] rounded-xl px-3 py-2 text-center">
          Draw something on the pad first!
        </p>
      )}

      <div className="flex items-center justify-end gap-2.5 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="storybook-btn px-5 rounded-2xl bg-white text-base font-bold text-[#3a2e28]"
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={handleExportClick}
          className="storybook-btn px-6 rounded-2xl bg-[#4ade80] text-lg font-bold text-[#3a2e28] flex items-center gap-2"
        >
          <Check className="w-6 h-6 stroke-[3]" />
          <span>{exportLabel}</span>
        </button>
      </div>
    </div>
  );
};
