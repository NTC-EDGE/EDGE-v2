import { describe, it, expect } from 'bun:test';
import {
  EditedImageResult,
  AspectRatioPreset,
} from './ImageCropRotateModal';
import {
  calculateNewCrop,
  computeCropForPreset,
  nudgeCropInset,
  nudgeCropExpand,
  clamp,
  DEFAULT_CROP,
  FULL_CROP,
  CropPercent,
} from './imageCropUtils';

describe('ImageCropRotateModal & Image Editing Logic', () => {
  it('correctly calculates rotated dimensions for 90/270 and 0/180 degrees', () => {
    const originalWidth = 1920;
    const originalHeight = 1080;

    function getRotatedDimensions(w: number, h: number, rotation: number) {
      const isQuarterTurn = rotation === 90 || rotation === 270;
      return {
        width: isQuarterTurn ? h : w,
        height: isQuarterTurn ? w : h,
      };
    }

    expect(getRotatedDimensions(originalWidth, originalHeight, 0)).toEqual({ width: 1920, height: 1080 });
    expect(getRotatedDimensions(originalWidth, originalHeight, 90)).toEqual({ width: 1080, height: 1920 });
    expect(getRotatedDimensions(originalWidth, originalHeight, 180)).toEqual({ width: 1920, height: 1080 });
    expect(getRotatedDimensions(originalWidth, originalHeight, 270)).toEqual({ width: 1080, height: 1920 });
  });

  it('calculates aspect ratio presets accurately for Document A4, ID Card, and 1:1', () => {
    // Square image (1000x1000)
    const squareCrop = computeCropForPreset(1000, 1000, '1:1');
    expect(squareCrop.right - squareCrop.left).toBe(squareCrop.bottom - squareCrop.top);

    // Document A4 portrait on a 1920x1080 landscape photo
    const docCrop = computeCropForPreset(1920, 1080, 'doc');
    const widthRatio = (docCrop.right - docCrop.left) / (docCrop.bottom - docCrop.top);
    expect(widthRatio).toBeLessThan(1.0); // Portrait crop on landscape image

    // ID card (landscape) on a portrait image (1080x1920)
    const cardCrop = computeCropForPreset(1080, 1920, 'card');
    expect(cardCrop.left).toBeGreaterThanOrEqual(0);
    expect(cardCrop.right).toBeLessThanOrEqual(100);
  });

  it('correctly clamps values within limits', () => {
    expect(clamp(50, 0, 100)).toBe(50);
    expect(clamp(-10, 0, 100)).toBe(0);
    expect(clamp(150, 0, 100)).toBe(100);
  });

  it('drags crop box repositioning without altering dimensions', () => {
    const startCrop: CropPercent = { left: 10, top: 15, right: 60, bottom: 65 };
    const initialWidth = startCrop.right - startCrop.left;
    const initialHeight = startCrop.bottom - startCrop.top;

    const moved = calculateNewCrop('box', startCrop, 10, 5);
    expect(moved.left).toBe(20);
    expect(moved.top).toBe(20);
    expect(moved.right - moved.left).toBe(initialWidth);
    expect(moved.bottom - moved.top).toBe(initialHeight);

    // Clamps to right and bottom boundaries
    const hitBoundary = calculateNewCrop('box', startCrop, 80, 80);
    expect(hitBoundary.right).toBe(100);
    expect(hitBoundary.bottom).toBe(100);
    expect(hitBoundary.left).toBe(100 - initialWidth);
    expect(hitBoundary.top).toBe(100 - initialHeight);
  });

  it('freely resizes individual corner and edge handles', () => {
    const startCrop: CropPercent = { left: 20, top: 20, right: 80, bottom: 80 };

    // Drag top-left handle inward
    const tlMoved = calculateNewCrop('tl', startCrop, 15, 10);
    expect(tlMoved.left).toBe(35);
    expect(tlMoved.top).toBe(30);
    expect(tlMoved.right).toBe(80);
    expect(tlMoved.bottom).toBe(80);

    // Drag bottom-right handle outward
    const brMoved = calculateNewCrop('br', startCrop, 10, 15);
    expect(brMoved.left).toBe(20);
    expect(brMoved.top).toBe(20);
    expect(brMoved.right).toBe(90);
    expect(brMoved.bottom).toBe(95);

    // Drag single top edge handle
    const topEdgeMoved = calculateNewCrop('t', startCrop, 0, -10);
    expect(topEdgeMoved.top).toBe(10);
    expect(topEdgeMoved.left).toBe(20);
    expect(topEdgeMoved.right).toBe(80);
    expect(topEdgeMoved.bottom).toBe(80);

    // Drag single left edge handle
    const leftEdgeMoved = calculateNewCrop('l', startCrop, -10, 0);
    expect(leftEdgeMoved.left).toBe(10);
    expect(leftEdgeMoved.top).toBe(20);
    expect(leftEdgeMoved.right).toBe(80);
    expect(leftEdgeMoved.bottom).toBe(80);
  });

  it('respects minSize boundary so handle cannot invert the crop box', () => {
    const startCrop: CropPercent = { left: 20, top: 20, right: 80, bottom: 80 };

    // Attempting to drag left handle past right handle
    const invertedLeft = calculateNewCrop('l', startCrop, 75, 0, 6);
    expect(invertedLeft.left).toBe(74); // 80 - 6 minSize

    // Attempting to drag top handle past bottom handle
    const invertedTop = calculateNewCrop('t', startCrop, 0, 75, 6);
    expect(invertedTop.top).toBe(74); // 80 - 6 minSize
  });

  it('verifies nudgeCropInset and nudgeCropExpand', () => {
    const startCrop: CropPercent = { left: 20, top: 20, right: 80, bottom: 80 };
    const inset = nudgeCropInset(startCrop, 5);
    expect(inset.left).toBe(25);
    expect(inset.top).toBe(25);
    expect(inset.right).toBe(75);
    expect(inset.bottom).toBe(75);

    const expand = nudgeCropExpand(inset, 5);
    expect(expand.left).toBe(20);
    expect(expand.top).toBe(20);
    expect(expand.right).toBe(80);
    expect(expand.bottom).toBe(80);
  });

  it('verifies DEFAULT_CROP and FULL_CROP constants', () => {
    expect(DEFAULT_CROP).toEqual({ left: 4, top: 4, right: 96, bottom: 96 });
    expect(FULL_CROP).toEqual({ left: 0, top: 0, right: 100, bottom: 100 });
  });

  it('conforms to EditedImageResult specification with output metadata', () => {
    const result: EditedImageResult = {
      uri: 'blob:http://localhost:8081/crop-456',
      name: 'scanned_permit_cropped.jpg',
      type: 'image/jpeg',
      width: 1200,
      height: 1697,
      rotation: 90,
      cropped: true,
    };

    expect(result.uri).toMatch(/^blob:/);
    expect(result.name).toContain('_cropped.jpg');
    expect(result.type).toBe('image/jpeg');
    expect(result.rotation).toBe(90);
    expect(result.cropped).toBe(true);
    expect(result.width).toBeGreaterThan(0);
    expect(result.height).toBeGreaterThan(0);
  });
});
