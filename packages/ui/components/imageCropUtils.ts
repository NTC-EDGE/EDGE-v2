export interface CropPercent {
  left: number;   // 0 to 100
  top: number;    // 0 to 100
  right: number;  // 0 to 100
  bottom: number; // 0 to 100
}

export type AspectRatioPreset = 'free' | 'doc' | 'card' | '1:1' | 'orig';

export type DragHandleType = 'box' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r';

export const DEFAULT_CROP: CropPercent = {
  left: 4,
  top: 4,
  right: 96,
  bottom: 96,
};

export const FULL_CROP: CropPercent = {
  left: 0,
  top: 0,
  right: 100,
  bottom: 100,
};

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(val, max));
}

export function calculateNewCrop(
  handle: DragHandleType,
  startCrop: CropPercent,
  deltaXPercent: number,
  deltaYPercent: number,
  minSize = 6
): CropPercent {
  if (handle === 'box') {
    const boxW = startCrop.right - startCrop.left;
    const boxH = startCrop.bottom - startCrop.top;
    const newLeft = clamp(startCrop.left + deltaXPercent, 0, 100 - boxW);
    const newTop = clamp(startCrop.top + deltaYPercent, 0, 100 - boxH);
    return {
      left: Math.round(newLeft * 10) / 10,
      top: Math.round(newTop * 10) / 10,
      right: Math.round((newLeft + boxW) * 10) / 10,
      bottom: Math.round((newTop + boxH) * 10) / 10,
    };
  }

  let nextLeft = startCrop.left;
  let nextTop = startCrop.top;
  let nextRight = startCrop.right;
  let nextBottom = startCrop.bottom;

  if (handle === 'tl' || handle === 'l' || handle === 'bl') {
    nextLeft = clamp(startCrop.left + deltaXPercent, 0, nextRight - minSize);
  }
  if (handle === 'tr' || handle === 'r' || handle === 'br') {
    nextRight = clamp(startCrop.right + deltaXPercent, nextLeft + minSize, 100);
  }
  if (handle === 'tl' || handle === 't' || handle === 'tr') {
    nextTop = clamp(startCrop.top + deltaYPercent, 0, nextBottom - minSize);
  }
  if (handle === 'bl' || handle === 'b' || handle === 'br') {
    nextBottom = clamp(startCrop.bottom + deltaYPercent, nextTop + minSize, 100);
  }

  return {
    left: Math.round(nextLeft * 10) / 10,
    top: Math.round(nextTop * 10) / 10,
    right: Math.round(nextRight * 10) / 10,
    bottom: Math.round(nextBottom * 10) / 10,
  };
}

export function computeCropForPreset(
  rotW: number,
  rotH: number,
  preset: AspectRatioPreset
): CropPercent {
  let targetRatio = 0; // width / height

  if (preset === 'doc') {
    targetRatio = 1 / 1.414; // A4 portrait standard
  } else if (preset === 'card') {
    targetRatio = 1.586; // Standard CR80 ID Card
  } else if (preset === '1:1') {
    targetRatio = 1.0;
  } else if (preset === 'orig') {
    targetRatio = rotW / rotH;
  } else {
    return DEFAULT_CROP;
  }

  const currentRotRatio = rotW / rotH;
  let newCropW = 90;
  let newCropH = 90;

  if (targetRatio > currentRotRatio) {
    newCropW = 90;
    newCropH = Math.min(90, (90 * currentRotRatio) / targetRatio);
  } else {
    newCropH = 90;
    newCropW = Math.min(90, (90 * targetRatio) / currentRotRatio);
  }

  const halfW = newCropW / 2;
  const halfH = newCropH / 2;
  return {
    left: Math.round(50 - halfW),
    top: Math.round(50 - halfH),
    right: Math.round(50 + halfW),
    bottom: Math.round(50 + halfH),
  };
}

export function nudgeCropInset(current: CropPercent, step = 4, minGap = 10): CropPercent {
  const nextLeft = clamp(current.left + step, 0, 50 - minGap / 2);
  const nextRight = clamp(current.right - step, 50 + minGap / 2, 100);
  const nextTop = clamp(current.top + step, 0, 50 - minGap / 2);
  const nextBottom = clamp(current.bottom - step, 50 + minGap / 2, 100);
  return {
    left: Math.round(nextLeft),
    top: Math.round(nextTop),
    right: Math.round(nextRight),
    bottom: Math.round(nextBottom),
  };
}

export function nudgeCropExpand(current: CropPercent, step = 4, minGap = 6): CropPercent {
  const nextLeft = clamp(current.left - step, 0, current.right - minGap);
  const nextRight = clamp(current.right + step, current.left + minGap, 100);
  const nextTop = clamp(current.top - step, 0, current.bottom - minGap);
  const nextBottom = clamp(current.bottom + step, current.top + minGap, 100);
  return {
    left: Math.round(nextLeft),
    top: Math.round(nextTop),
    right: Math.round(nextRight),
    bottom: Math.round(nextBottom),
  };
}
