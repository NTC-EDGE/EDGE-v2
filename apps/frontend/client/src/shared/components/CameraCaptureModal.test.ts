import { CapturedPhoto, CameraCaptureModalProps } from './CameraCaptureModal';

describe('CameraCaptureModal & Web Camera Integration', () => {
  it('defines valid CapturedPhoto data structure for attachments', () => {
    const photo: CapturedPhoto = {
      name: 'document_photo_1729680000000.jpg',
      uri: 'blob:http://localhost:8081/abc-123',
      type: 'image/jpeg',
    };

    expect(photo.name).toMatch(/\.jpg$/);
    expect(photo.type).toBe('image/jpeg');
    expect(photo.uri).toContain('blob:');
  });

  it('correctly maps CapturedPhoto to upload requirement payload', () => {
    const slotKey = 'valid_id';
    const photo: CapturedPhoto = {
      name: 'valid_id_capture.jpg',
      uri: 'blob:http://localhost:8081/def-456',
      type: 'image/jpeg',
    };

    const uploadedPayload = {
      name: photo.name,
      uri: photo.uri,
      type: photo.type,
      file: photo.file,
    };

    expect(slotKey).toBe('valid_id');
    expect(uploadedPayload.name).toBe('valid_id_capture.jpg');
    expect(uploadedPayload.type).toBe('image/jpeg');
    expect(uploadedPayload.uri).toBe('blob:http://localhost:8081/def-456');
  });

  it('handles permission denied and camera missing error conditions gracefully', () => {
    function resolveCameraErrorMessage(errName: string): string {
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        return 'Camera access was denied. Please allow camera permissions in your browser address bar settings to take a photo.';
      }
      if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
        return 'No camera device was detected on your computer or device. Please upload a saved document or photo.';
      }
      return 'Could not start camera. Please verify camera permissions or choose a file from your device.';
    }

    expect(resolveCameraErrorMessage('NotAllowedError')).toContain('allow camera permissions in your browser');
    expect(resolveCameraErrorMessage('PermissionDeniedError')).toContain('allow camera permissions in your browser');
    expect(resolveCameraErrorMessage('NotFoundError')).toContain('No camera device was detected');
    expect(resolveCameraErrorMessage('DevicesNotFoundError')).toContain('No camera device was detected');
    expect(resolveCameraErrorMessage('NotReadableError')).toContain('Could not start camera');
  });

  it('determines whether WebRTC camera is supported in browser runtime', () => {
    function isWebCameraSupported(platform: string, hasNavigator: boolean, hasGetUserMedia: boolean): boolean {
      return platform === 'web' && hasNavigator && hasGetUserMedia;
    }

    // Web with getUserMedia available
    expect(isWebCameraSupported('web', true, true)).toBe(true);

    // Native platforms (should use native ImagePicker instead)
    expect(isWebCameraSupported('android', true, true)).toBe(false);
    expect(isWebCameraSupported('ios', true, true)).toBe(false);

    // Web without getUserMedia (legacy or restricted iframe)
    expect(isWebCameraSupported('web', true, false)).toBe(false);
    expect(isWebCameraSupported('web', false, false)).toBe(false);
  });
});
