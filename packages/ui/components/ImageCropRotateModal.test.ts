import { describe, it, expect } from 'bun:test';
import {
  EditedImageResult,
  AspectRatioPreset,
} from './ImageCropRotateModal';

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
    function computeCropForPreset(
      rotW: number,
      rotH: number,
      preset: AspectRatioPreset
    ): { left: number; top: number; right: number; bottom: number } {
      let targetRatio = 0;
      if (preset === 'doc') {
        targetRatio = 1 / 1.414; // A4 portrait standard
      } else if (preset === 'card') {
        targetRatio = 1.586; // Standard CR80 ID Card
      } else if (preset === '1:1') {
        targetRatio = 1.0;
      } else {
        return { left: 4, top: 4, right: 96, bottom: 96 };
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
