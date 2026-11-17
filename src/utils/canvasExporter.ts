import { Character, PageState, PlaceAsset } from '../types';
import { getPageSentence } from './storyHelpers';
import { CHICKEN_PIE_TTF_BASE64 } from './chickenPieFont';

const STAGE_WIDTH = 1280;
const STAGE_HEIGHT = 720;

function loadImageSafe(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    if (src.startsWith('http://') || src.startsWith('https://')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number
) {
  const ir = img.width / img.height;
  const cr = w / h;
  let dw = w,
    dh = h,
    dx = 0,
    dy = 0;
  if (ir > cr) {
    dw = h * ir;
    dx = (w - dw) / 2;
  } else {
    dh = w / ir;
    dy = (h - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawCharacterOnCanvas(
  ctx: CanvasRenderingContext2D,
  char: Character,
  bodyImg: HTMLImageElement | null,
  headImg: HTMLImageElement | null,
  centerX: number,
  centerY: number,
  scale: number,
  flipX: boolean,
  dancePhase?: number
) {
  const baseBodyW = 200;
  const baseBodyH = bodyImg
    ? Math.round((bodyImg.height / bodyImg.width) * baseBodyW)
    : 240;

  let hopY = 0;
  let hopX = 0;
  let bodyRot = 0;
  let bodyStretchX = 1;
  let bodyStretchY = 1;
  let headExtraRot = 0;
  let headBobY = 0;

  if (dancePhase !== undefined) {
    hopY = -Math.abs(Math.sin(dancePhase * 2)) * 26;
    hopX = Math.sin(dancePhase) * 12;
    bodyRot = Math.sin(dancePhase * 2) * 0.09;
    bodyStretchX = 1 + Math.cos(dancePhase * 4) * 0.04;
    bodyStretchY = 1 - Math.cos(dancePhase * 4) * 0.04;
    headExtraRot = Math.sin(dancePhase * 3) * 0.19;
    headBobY = Math.cos(dancePhase * 4) * 4;
  }

  ctx.save();
  ctx.translate(centerX + hopX, centerY + hopY);
  ctx.scale(scale * (flipX ? -1 : 1), scale);
  ctx.rotate(bodyRot);

  // Soft shadow under feet
  ctx.save();
  ctx.fillStyle = 'rgba(58, 46, 40, 0.2)';
  ctx.beginPath();
  ctx.ellipse(0, baseBodyH * 0.48, baseBodyW * 0.28, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Body
  ctx.save();
  ctx.scale(bodyStretchX, bodyStretchY);
  if (bodyImg) {
    ctx.drawImage(
      bodyImg,
      -baseBodyW / 2,
      -baseBodyH / 2,
      baseBodyW,
      baseBodyH
    );
  }
  ctx.restore();

  // Head anchored to neck
  if (headImg) {
    const neckLocalX = (char.neckX - 0.5) * baseBodyW + char.headOffsetX;
    const neckLocalY = (char.neckY - 0.5) * baseBodyH + char.headOffsetY;

    const targetHeadW =
      baseBodyW * 0.56 * char.baseHeadScale * char.headScale;
    const targetHeadH =
      (headImg.height / headImg.width) * targetHeadW;

    ctx.save();
    ctx.translate(neckLocalX, neckLocalY + headBobY);
    ctx.rotate((char.headTilt * Math.PI) / 180 + headExtraRot);
    ctx.drawImage(
      headImg,
      -targetHeadW / 2,
      -targetHeadH * 0.85,
      targetHeadW,
      targetHeadH
    );
    ctx.restore();
  }

  ctx.restore();
}

function drawStoryBanner(
  ctx: CanvasRenderingContext2D,
  sentence: string,
  pageNumber: number,
  highlightRedWord?: string
) {
  const padX = 48;
  const boxW = STAGE_WIDTH - padX * 2;
  const boxH = 114;
  const boxX = padX;
  const boxY = STAGE_HEIGHT - boxH - 22;

  // Hard shadow
  ctx.fillStyle = '#3a2e28';
  roundRectPath(ctx, boxX, boxY + 6, boxW, boxH, 24);
  ctx.fill();

  // Cream panel
  ctx.fillStyle = '#fffaf0';
  roundRectPath(ctx, boxX, boxY, boxW, boxH, 24);
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#3a2e28';
  ctx.stroke();

  // Page number badge
  ctx.fillStyle = '#ffd93d';
  roundRectPath(ctx, boxX + 18, boxY - 18, 94, 34, 12);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#3a2e28';
  ctx.font = 'bold 18px "Chicken Pie", "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`Page ${pageNumber}`, boxX + 65, boxY - 1);

  // Wrapped sentence text
  ctx.font = 'bold 30px "Chicken Pie", "Fredoka", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxLineW = boxW - 60;
  const words = sentence.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const w of words) {
    const test = current ? `${current} ${w}` : w;
    if (ctx.measureText(test).width > maxLineW && current) {
      lines.push(current);
      current = w;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  const lineHeight = 38;
  const startY =
    boxY + boxH / 2 - ((lines.length - 1) * lineHeight) / 2 + 4;

  lines.forEach((line, i) => {
    const y = startY + i * lineHeight;
    if (highlightRedWord && line.includes(highlightRedWord)) {
      // Draw line with red highlight for place name
      const idx = line.indexOf(highlightRedWord);
      const before = line.slice(0, idx);
      const after = line.slice(idx + highlightRedWord.length);
      const totalW = ctx.measureText(line).width;
      let cursorX = STAGE_WIDTH / 2 - totalW / 2;

      ctx.textAlign = 'left';
      ctx.fillStyle = '#3a2e28';
      ctx.fillText(before, cursorX, y);
      cursorX += ctx.measureText(before).width;

      ctx.fillStyle = '#dc2626';
      ctx.fillText(highlightRedWord, cursorX, y);
      cursorX += ctx.measureText(highlightRedWord).width;

      ctx.fillStyle = '#3a2e28';
      ctx.fillText(after, cursorX, y);
      ctx.textAlign = 'center';
    } else {
      ctx.fillStyle = '#3a2e28';
      ctx.fillText(line, STAGE_WIDTH / 2, y);
    }
  });
}

export interface RenderedStoryResult {
  pagePngs: string[];
  storyText: string;
  sentences: string[];
}

export async function renderAllStoryPages(
  pages: PageState[],
  characters: Character[],
  places: PlaceAsset[],
  onProgress?: (pct: number) => void
): Promise<RenderedStoryResult> {
  // Preload unique images
  const imageCache = new Map<string, HTMLImageElement | null>();
  const urlsToLoad = new Set<string>();
  places.forEach((p) => urlsToLoad.add(p.src));
  characters.forEach((c) => {
    urlsToLoad.add(c.bodySrc);
    urlsToLoad.add(c.headDataUrl);
  });

  await Promise.all(
    Array.from(urlsToLoad).map(async (url) => {
      imageCache.set(url, await loadImageSafe(url));
    })
  );

  const canvas = document.createElement('canvas');
  canvas.width = STAGE_WIDTH;
  canvas.height = STAGE_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  const pagePngs: string[] = [];
  const sentences: string[] = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);

    // Background
    const place =
      places.find((pl) => pl.id === page.bgPlaceId) || places[0];
    const bgImg = place ? imageCache.get(place.src) : null;
    if (bgImg) {
      drawCoverImage(ctx, bgImg, STAGE_WIDTH, STAGE_HEIGHT);
    } else {
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    }

    // Characters (sorted by zIndex)
    const sorted = [...page.placed].sort((a, b) => a.zIndex - b.zIndex);
    for (const pc of sorted) {
      const char = characters.find((c) => c.id === pc.charId);
      if (!char) continue;
      const bodyImg = imageCache.get(char.bodySrc) || null;
      const headImg = imageCache.get(char.headDataUrl) || null;
      drawCharacterOnCanvas(
        ctx,
        char,
        bodyImg,
        headImg,
        pc.x * STAGE_WIDTH,
        pc.y * STAGE_HEIGHT,
        pc.scale * 1.15,
        pc.flipX
      );
    }

    const sentence = getPageSentence(page, characters);
    sentences.push(sentence);

    drawStoryBanner(
      ctx,
      sentence,
      page.pageNumber,
      page.pageNumber === 1 ? page.placeName || 'Tung Chung' : undefined
    );

    pagePngs.push(canvas.toDataURL('image/png'));
    onProgress?.(Math.round(((i + 1) / pages.length) * 100));
  }

  const storyText = sentences
    .map((s, i) => `Page ${i + 1}: ${s}`)
    .join('\n');

  return { pagePngs, storyText, sentences };
}

export async function postToGoogleAppsScript(
  url: string,
  payload: Record<string, unknown>
): Promise<void> {
  await fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
}

export function downloadStoryBackupHtml(
  studentName: string,
  pagePngs: string[],
  sentences: string[]
): void {
  const safeName = studentName.replace(/[<>&"]/g, '');
  const pagesHtml = pagePngs
    .map(
      (png, idx) => `
      <section class="page">
        <div class="badge">Page ${idx + 1}</div>
        <img src="${png}" alt="Page ${idx + 1}" />
        <p>${sentences[idx].replace(/</g, '&lt;')}</p>
      </section>`
    )
    .join('\n');

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Special People in a Special Place: ${safeName}</title>
<style>
  @font-face {
    font-family: 'Chicken Pie';
    src: url('data:font/truetype;base64,${CHICKEN_PIE_TTF_BASE64}') format('truetype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  body { font-family: 'Chicken Pie', 'Fredoka', system-ui, sans-serif; background: #fff5e1; color: #3a2e28; max-width: 980px; margin: 0 auto; padding: 24px; }
  h1 { text-align: center; font-size: 2rem; margin-bottom: 8px; }
  .sub { text-align: center; margin-bottom: 28px; font-weight: 600; }
  .page { background: #fffaf0; border: 3px solid #3a2e28; border-radius: 20px; padding: 16px; margin-bottom: 24px; box-shadow: 0 5px 0 #3a2e28; }
  .badge { display: inline-block; background: #ffd93d; border: 2px solid #3a2e28; border-radius: 10px; padding: 4px 12px; font-weight: 700; margin-bottom: 10px; }
  img { width: 100%; border-radius: 14px; border: 2px solid #3a2e28; display: block; }
  p { font-size: 1.2rem; font-weight: 700; text-align: center; margin: 14px 0 4px; }
</style>
</head>
<body>
  <h1>Special People in a Special Place: Tung Chung!</h1>
  <div class="sub">Storybook by ${safeName || 'Student'}</div>
  ${pagesHtml}
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Tung-Chung-Storybook-${(studentName || 'Student').replace(/\s+/g, '_')}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export interface DanceVideoResult {
  blob: Blob;
  mimeType: string;
  videoBase64: string;
  objectUrl: string;
}

function getPreferredVideoMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return 'video/webm';
  const candidates = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const res = String(reader.result || '');
      const commaIdx = res.indexOf(',');
      resolve(commaIdx >= 0 ? res.slice(commaIdx + 1) : res);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function recordDanceMusicVideo(options: {
  page12: PageState;
  characters: Character[];
  places: PlaceAsset[];
  danceSongUrl: string;
  onProgress: (pct: number, elapsedSec: number, totalSec: number) => void;
  signal?: AbortSignal;
}): Promise<DanceVideoResult> {
  const { page12, characters, places, danceSongUrl, onProgress, signal } = options;

  // Preload images
  const imageCache = new Map<string, HTMLImageElement | null>();
  const place = places.find((p) => p.id === page12.bgPlaceId) || places[0];
  if (place) {
    imageCache.set(place.src, await loadImageSafe(place.src));
  }
  await Promise.all(
    characters.flatMap((c) => [
      loadImageSafe(c.bodySrc).then((im) => imageCache.set(c.bodySrc, im)),
      loadImageSafe(c.headDataUrl).then((im) => imageCache.set(c.headDataUrl, im)),
    ])
  );

  const canvas = document.createElement('canvas');
  canvas.width = STAGE_WIDTH;
  canvas.height = STAGE_HEIGHT;
  const ctx = canvas.getContext('2d')!;

  // Set up audio element + Web Audio API MediaElementAudioSourceNode
  const audio = new Audio();
  if (danceSongUrl.startsWith('http://') || danceSongUrl.startsWith('https://')) {
    audio.crossOrigin = 'anonymous';
  }
  audio.src = danceSongUrl;
  audio.preload = 'auto';

  await new Promise<void>((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onErr = () => {
      cleanup();
      reject(new Error('Could not load dance song audio.'));
    };
    const cleanup = () => {
      audio.removeEventListener('canplaythrough', onReady);
      audio.removeEventListener('loadedmetadata', onReady);
      audio.removeEventListener('error', onErr);
    };
    audio.addEventListener('canplaythrough', onReady);
    audio.addEventListener('loadedmetadata', onReady);
    audio.addEventListener('error', onErr);
    audio.load();
  });

  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioCtx = new AudioCtx();
  await audioCtx.resume();

  const sourceNode = audioCtx.createMediaElementSource(audio);
  const streamDest = audioCtx.createMediaStreamDestination();
  sourceNode.connect(audioCtx.destination);
  sourceNode.connect(streamDest);

  const canvasStream = canvas.captureStream(30);
  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...streamDest.stream.getAudioTracks(),
  ]);

  const preferredMime = getPreferredVideoMimeType();
  const recorder = preferredMime
    ? new MediaRecorder(combinedStream, { mimeType: preferredMime, videoBitsPerSecond: 2_500_000 })
    : new MediaRecorder(combinedStream);

  const chunks: BlobPart[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  const totalDuration = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 16;

  // Floating celebratory confetti/music notes
  const particles = Array.from({ length: 18 }, (_, i) => ({
    x: (i / 18) * STAGE_WIDTH + 30,
    y: Math.random() * STAGE_HEIGHT * 0.7,
    speed: 45 + (i % 5) * 18,
    symbol: ['♪', '♫', '★', '✦'][i % 4],
    color: ['#ffd93d', '#ff5946', '#38bdf8', '#4ade80'][i % 4],
  }));

  const sortedPlaced = [...page12.placed].sort((a, b) => a.zIndex - b.zIndex);
  const bgImg = place ? imageCache.get(place.src) : null;

  let rafId = 0;
  let stopped = false;

  const stopAll = () => {
    if (stopped) return;
    stopped = true;
    cancelAnimationFrame(rafId);
    audio.pause();
    if (recorder.state !== 'inactive') {
      recorder.stop();
    }
  };

  signal?.addEventListener('abort', stopAll);

  const recorderStoppedPromise = new Promise<Blob>((resolve) => {
    recorder.onstop = () => {
      const actualMime = recorder.mimeType || preferredMime || 'video/webm';
      resolve(new Blob(chunks, { type: actualMime }));
    };
  });

  recorder.start(250);
  await audio.play();

  const startTime = performance.now();

  const renderFrame = (now: number) => {
    if (stopped) return;
    const elapsedSec = (now - startTime) / 1000;
    const pct = Math.min(99, Math.round((elapsedSec / totalDuration) * 100));
    onProgress(pct, Math.min(elapsedSec, totalDuration), totalDuration);

    ctx.clearRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    if (bgImg) {
      drawCoverImage(ctx, bgImg, STAGE_WIDTH, STAGE_HEIGHT);
    } else {
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(0, 0, STAGE_WIDTH, STAGE_HEIGHT);
    }

    // Draw characters dancing in rhythm (120 BPM = 2 beats/sec)
    const phaseBase = elapsedSec * Math.PI * 2;
    sortedPlaced.forEach((pc, idx) => {
      const char = characters.find((c) => c.id === pc.charId);
      if (!char) return;
      const bodyImg = imageCache.get(char.bodySrc) || null;
      const headImg = imageCache.get(char.headDataUrl) || null;
      drawCharacterOnCanvas(
        ctx,
        char,
        bodyImg,
        headImg,
        pc.x * STAGE_WIDTH,
        pc.y * STAGE_HEIGHT,
        pc.scale * 1.15,
        pc.flipX,
        phaseBase + idx * 0.65
      );
    });

    // Floating musical notes & stars
    ctx.save();
    ctx.font = 'bold 34px "Chicken Pie", "Fredoka", sans-serif';
    ctx.textAlign = 'center';
    for (const pt of particles) {
      const py = ((pt.y - elapsedSec * pt.speed) % (STAGE_HEIGHT * 0.78) + STAGE_HEIGHT * 0.78) % (STAGE_HEIGHT * 0.78);
      const px = pt.x + Math.sin(elapsedSec * 2 + pt.y) * 16;
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#3a2e28';
      ctx.strokeText(pt.symbol, px, py + 30);
      ctx.fillStyle = pt.color;
      ctx.fillText(pt.symbol, px, py + 30);
    }
    ctx.restore();

    drawStoryBanner(
      ctx,
      'We are special people in a special place: Tung Chung!',
      12
    );

    if (!audio.ended && elapsedSec < totalDuration + 0.5) {
      rafId = requestAnimationFrame(renderFrame);
    } else {
      stopAll();
    }
  };

  audio.onended = () => {
    stopAll();
  };

  rafId = requestAnimationFrame(renderFrame);

  const blob = await recorderStoppedPromise;
  await audioCtx.close().catch(() => {});

  if (signal?.aborted) {
    throw new DOMException('Recording cancelled', 'AbortError');
  }

  onProgress(100, totalDuration, totalDuration);
  const mimeType = blob.type || preferredMime || 'video/webm';
  const videoBase64 = await blobToBase64(blob);
  const objectUrl = URL.createObjectURL(blob);

  return { blob, mimeType, videoBase64, objectUrl };
}
