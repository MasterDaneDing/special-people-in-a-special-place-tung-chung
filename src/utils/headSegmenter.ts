import {
  FaceLandmarker,
  FilesetResolver,
  ImageSegmenter,
} from '@mediapipe/tasks-vision';

let faceLandmarkerPromise: Promise<FaceLandmarker | null> | null = null;
let imageSegmenterPromise: Promise<ImageSegmenter | null> | null = null;

const FACE_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const SEGMENTER_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite';

async function getVisionFileset() {
  try {
    return await FilesetResolver.forVisionTasks('./wasm');
  } catch {
    return await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
    );
  }
}

async function getFaceLandmarker(): Promise<FaceLandmarker | null> {
  if (!faceLandmarkerPromise) {
    faceLandmarkerPromise = (async () => {
      try {
        const vision = await getVisionFileset();
        return await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: FACE_MODEL_URL,
            delegate: 'CPU',
          },
          runningMode: 'IMAGE',
          numFaces: 1,
        });
      } catch (err) {
        console.warn('FaceLandmarker unavailable, using oval fallback:', err);
        return null;
      }
    })();
  }
  return faceLandmarkerPromise;
}

async function getImageSegmenter(): Promise<ImageSegmenter | null> {
  if (!imageSegmenterPromise) {
    imageSegmenterPromise = (async () => {
      try {
        const vision = await getVisionFileset();
        return await ImageSegmenter.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: SEGMENTER_MODEL_URL,
            delegate: 'CPU',
          },
          runningMode: 'IMAGE',
          outputCategoryMask: false,
          outputConfidenceMasks: true,
        });
      } catch (err) {
        console.warn('ImageSegmenter unavailable, using oval fallback:', err);
        return null;
      }
    })();
  }
  return imageSegmenterPromise;
}

export function warmUpHeadSegmenter(): void {
  void getFaceLandmarker();
  void getImageSegmenter();
}

export interface HeadCutoutResult {
  dataUrl: string;
  usedMediaPipe: boolean;
  detectedFace: boolean;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Isolates the student's head/face oval with smooth feathered edges onto a transparent PNG canvas,
 * removing background and shoulders using @mediapipe/tasks-vision (FaceLandmarker + ImageSegmenter).
 */
export async function extractFeatheredHead(
  imageSrc: string
): Promise<HeadCutoutResult> {
  const img = await loadImage(imageSrc);

  // Normalize working size for fast, consistent mobile Safari segmentation
  const maxDim = 768;
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
  const w = Math.max(64, Math.round((img.naturalWidth || img.width) * scale));
  const h = Math.max(64, Math.round((img.naturalHeight || img.height) * scale));

  const workCanvas = document.createElement('canvas');
  workCanvas.width = w;
  workCanvas.height = h;
  const workCtx = workCanvas.getContext('2d', { willReadFrequently: true })!;
  workCtx.drawImage(img, 0, 0, w, h);

  const [landmarker, segmenter] = await Promise.all([
    getFaceLandmarker(),
    getImageSegmenter(),
  ]);

  let cx = w * 0.5;
  let cy = h * 0.44;
  let rx = w * 0.28;
  let ry = h * 0.34;
  let chinLimitY = cy + ry * 0.92;
  let detectedFace = false;

  if (landmarker) {
    try {
      const faceRes = landmarker.detect(workCanvas);
      if (faceRes.faceLandmarks && faceRes.faceLandmarks.length > 0) {
        const lm = faceRes.faceLandmarks[0];
        let minX = 1,
          maxX = 0,
          minY = 1,
          maxY = 0;
        for (const p of lm) {
          if (p.x < minX) minX = p.x;
          if (p.x > maxX) maxX = p.x;
          if (p.y < minY) minY = p.y;
          if (p.y > maxY) maxY = p.y;
        }
        const faceW = (maxX - minX) * w;
        const faceH = (maxY - minY) * h;

        const foreheadY = (lm[10]?.y ?? minY) * h;
        const chinY = (lm[152]?.y ?? maxY) * h;
        const faceCenterX = ((minX + maxX) * 0.5) * w;

        // Extend upward to capture hair, gently outward for ears/hair, stop neatly at chin
        const topHeadY = Math.max(0, foreheadY - faceH * 0.46);
        const bottomHeadY = Math.min(h, chinY + faceH * 0.08);

        cx = faceCenterX;
        cy = (topHeadY + bottomHeadY) * 0.5;
        rx = Math.max(faceW * 0.72, (bottomHeadY - topHeadY) * 0.43);
        ry = Math.max((bottomHeadY - topHeadY) * 0.52, faceH * 0.72);
        chinLimitY = chinY + faceH * 0.06;
        detectedFace = true;
      }
    } catch (err) {
      console.warn('Face detection step failed:', err);
    }
  }

  // Run ImageSegmenter to strip background around hair & ears
  let segHeadAlpha: Float32Array | null = null;
  let segW = w;
  let segH = h;
  let usedMediaPipe = detectedFace;

  if (segmenter) {
    try {
      const segResult = segmenter.segment(workCanvas);
      const masks = segResult.confidenceMasks;
      if (masks && masks.length >= 4) {
        // selfie_multiclass_256x256:
        // 0: background, 1: hair, 2: body-skin, 3: face-skin, 4: clothes, 5: others (glasses/hat)
        segW = masks[0].width;
        segH = masks[0].height;
        const hair = masks[1].getAsFloat32Array();
        const bodySkin = masks[2].getAsFloat32Array();
        const faceSkin = masks[3].getAsFloat32Array();
        const clothes = masks[4]?.getAsFloat32Array();
        const others = masks[5]?.getAsFloat32Array();

        segHeadAlpha = new Float32Array(segW * segH);
        for (let i = 0; i < segW * segH; i++) {
          const headConfidence =
            hair[i] +
            faceSkin[i] +
            (others ? others[i] * 0.9 : 0) +
            bodySkin[i] * 0.55;
          const clothesPenalty = clothes ? clothes[i] : 0;
          const raw = Math.max(0, Math.min(1, headConfidence - clothesPenalty * 0.75));
          segHeadAlpha[i] = smoothstep(0.22, 0.62, raw);
        }
        usedMediaPipe = true;
      } else if (masks && masks.length >= 1) {
        // 2-class fallback: index 0 or 1 person confidence
        const personMask = masks[masks.length > 1 ? 1 : 0];
        segW = personMask.width;
        segH = personMask.height;
        const data = personMask.getAsFloat32Array();
        segHeadAlpha = new Float32Array(segW * segH);
        for (let i = 0; i < segW * segH; i++) {
          segHeadAlpha[i] = smoothstep(0.25, 0.65, data[i]);
        }
        usedMediaPipe = true;
      }
      segResult.close();
    } catch (err) {
      console.warn('Image segmentation step failed:', err);
    }
  }

  // Composite feathered alpha onto the working image
  const imgData = workCtx.getImageData(0, 0, w, h);
  const px = imgData.data;

  for (let y = 0; y < h; y++) {
    const sy = Math.min(segH - 1, Math.floor((y / h) * segH));
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;

      // Elliptical head oval factor (1 inside, feathered to 0 at edge)
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const ovalMask = 1 - smoothstep(0.8, 1.04, dist);

      // Soft chin/neck cutoff to remove shoulders cleanly
      const chinMask = 1 - smoothstep(chinLimitY - ry * 0.12, chinLimitY + ry * 0.08, y);

      let alpha = ovalMask * chinMask;

      if (segHeadAlpha) {
        const sx = Math.min(segW - 1, Math.floor((x / w) * segW));
        const segVal = segHeadAlpha[sy * segW + sx];
        // Keep interior of face solid even if eyes/glasses have lower skin confidence
        const coreFaceMask = 1 - smoothstep(0.45, 0.72, dist);
        const combinedSeg = Math.max(segVal, coreFaceMask);
        alpha *= combinedSeg;
      }

      px[idx + 3] = Math.round(px[idx + 3] * alpha);
    }
  }
  workCtx.putImageData(imgData, 0, 0);

  // Crop tightly around the feathered head oval into a clean 360x400 transparent PNG
  const padX = rx * 1.15;
  const padTop = ry * 1.12;
  const padBottom = Math.min(ry * 1.1, chinLimitY - cy + ry * 0.16);

  const cropX = Math.max(0, Math.floor(cx - padX));
  const cropY = Math.max(0, Math.floor(cy - padTop));
  const cropRight = Math.min(w, Math.ceil(cx + padX));
  const cropBottom = Math.min(h, Math.ceil(cy + padBottom));
  const cropW = Math.max(16, cropRight - cropX);
  const cropH = Math.max(16, cropBottom - cropY);

  const outSize = 380;
  const outScale = Math.min(outSize / cropW, outSize / cropH);
  const outCanvas = document.createElement('canvas');
  outCanvas.width = Math.round(cropW * outScale);
  outCanvas.height = Math.round(cropH * outScale);
  const outCtx = outCanvas.getContext('2d')!;
  outCtx.drawImage(
    workCanvas,
    cropX,
    cropY,
    cropW,
    cropH,
    0,
    0,
    outCanvas.width,
    outCanvas.height
  );

  return {
    dataUrl: outCanvas.toDataURL('image/png'),
    usedMediaPipe,
    detectedFace,
  };
}
