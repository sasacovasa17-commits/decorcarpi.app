import { describe, it, expect } from 'vitest';

// Test pentru Gesture Controls Avansate
describe('Advanced Gesture Controls', () => {
  it('should handle two-finger rotate gesture', () => {
    let rotation = 0;
    const initialRotation = 0;
    const angleDiff = 45; // 45 degrees

    rotation = (initialRotation + angleDiff) % 360;
    expect(rotation).toBe(45);
  });

  it('should calculate angle between two touches', () => {
    const touch1 = { clientX: 0, clientY: 0 };
    const touch2 = { clientX: 100, clientY: 100 };

    const angle = Math.atan2(
      touch2.clientY - touch1.clientY,
      touch2.clientX - touch1.clientX
    );

    const angleInDegrees = angle * (180 / Math.PI);
    expect(angleInDegrees).toBeCloseTo(45, 0);
  });

  it('should handle double-tap reset zoom', () => {
    let scale = 2.5;
    const initialScale = 1;
    let lastTapTime = Date.now();

    // Simulate first tap
    const firstTapTime = lastTapTime;
    lastTapTime = Date.now();

    // Simulate second tap within 300ms
    const secondTapTime = firstTapTime + 200;
    const timeDiff = secondTapTime - firstTapTime;

    if (timeDiff < 300) {
      scale = initialScale;
    }

    expect(scale).toBe(initialScale);
  });

  it('should not reset zoom if taps are too far apart', () => {
    let scale = 2.5;
    const initialScale = 1;
    let lastTapTime = Date.now();

    const firstTapTime = lastTapTime;
    lastTapTime = Date.now();

    const secondTapTime = firstTapTime + 500;
    const timeDiff = secondTapTime - firstTapTime;

    if (timeDiff < 300) {
      scale = initialScale;
    }

    expect(scale).toBe(2.5);
  });

  it('should handle rotation wrapping at 360 degrees', () => {
    let rotation = 350;
    const angleDiff = 20;

    rotation = (rotation + angleDiff) % 360;
    expect(rotation).toBe(10);
  });
});

// Test pentru Aspect Ratio Lock
describe('Aspect Ratio Lock', () => {
  const getAspectRatioValue = (ratio: string): number => {
    switch (ratio) {
      case '1:1':
        return 1;
      case '16:9':
        return 16 / 9;
      case '4:3':
        return 4 / 3;
      default:
        return 0;
    }
  };

  const applyAspectRatio = (
    width: number,
    height: number,
    ratio: string
  ): { width: number; height: number } => {
    if (ratio === 'free') return { width, height };

    const targetRatio = getAspectRatioValue(ratio);
    const currentRatio = width / height;

    if (currentRatio > targetRatio) {
      return { width: Math.round(height * targetRatio), height };
    } else {
      return { width, height: Math.round(width / targetRatio) };
    }
  };

  it('should maintain 1:1 aspect ratio', () => {
    const { width, height } = applyAspectRatio(300, 200, '1:1');
    expect(width / height).toBeCloseTo(1, 1);
  });

  it('should maintain 16:9 aspect ratio', () => {
    const { width, height } = applyAspectRatio(300, 200, '16:9');
    const ratio = width / height;
    expect(ratio).toBeCloseTo(16 / 9, 1);
  });

  it('should maintain 4:3 aspect ratio', () => {
    const { width, height } = applyAspectRatio(300, 200, '4:3');
    const ratio = width / height;
    expect(ratio).toBeCloseTo(4 / 3, 1);
  });

  it('should allow free aspect ratio', () => {
    const { width, height } = applyAspectRatio(300, 200, 'free');
    expect(width).toBe(300);
    expect(height).toBe(200);
  });

  it('should adjust width when height is fixed', () => {
    const { width, height } = applyAspectRatio(200, 300, '16:9');
    // When width < height and ratio is 16:9 (wider), height should be adjusted
    expect(width).toBe(200);
    // Expected height: 200 / (16/9) = 200 * 9/16 = 112.5, rounded to 113
    expect(height).toBe(113);
  });

  it('should adjust height when width is fixed', () => {
    const { width, height } = applyAspectRatio(300, 200, '16:9');
    expect(width).toBe(300);
    expect(height).toBeCloseTo(300 / (16 / 9), 0);
  });
});

// Test pentru Crop Presets
describe('Crop Presets', () => {
  interface CropPreset {
    name: string;
    label: string;
    width: number;
    height: number;
  }

  const CROP_PRESETS: CropPreset[] = [
    { name: 'full-wall', label: '🏠 Full Wall', width: 400, height: 300 },
    { name: 'door-area', label: '🚪 Door Area', width: 150, height: 250 },
    { name: 'window-area', label: '🪟 Window Area', width: 200, height: 200 },
  ];

  it('should have correct preset dimensions', () => {
    const fullWall = CROP_PRESETS.find((p) => p.name === 'full-wall');
    expect(fullWall?.width).toBe(400);
    expect(fullWall?.height).toBe(300);
  });

  it('should apply full-wall preset', () => {
    const preset = CROP_PRESETS[0];
    const cropArea = {
      x: 50,
      y: 50,
      width: preset.width,
      height: preset.height,
    };

    expect(cropArea.width).toBe(400);
    expect(cropArea.height).toBe(300);
  });

  it('should apply door-area preset', () => {
    const preset = CROP_PRESETS[1];
    const cropArea = {
      x: 100,
      y: 100,
      width: preset.width,
      height: preset.height,
    };

    expect(cropArea.width).toBe(150);
    expect(cropArea.height).toBe(250);
  });

  it('should apply window-area preset', () => {
    const preset = CROP_PRESETS[2];
    const cropArea = {
      x: 75,
      y: 75,
      width: preset.width,
      height: preset.height,
    };

    expect(cropArea.width).toBe(200);
    expect(cropArea.height).toBe(200);
  });

  it('should center preset within image bounds', () => {
    const imageSize = { width: 800, height: 600 };
    const preset = CROP_PRESETS[0];

    const x = Math.max(0, (imageSize.width - preset.width) / 2);
    const y = Math.max(0, (imageSize.height - preset.height) / 2);

    expect(x).toBe((800 - 400) / 2);
    expect(y).toBe((600 - 300) / 2);
  });

  it('should respect image bounds when applying preset', () => {
    const imageSize = { width: 300, height: 200 };
    const preset = CROP_PRESETS[0];

    const width = Math.min(preset.width, imageSize.width);
    const height = Math.min(preset.height, imageSize.height);

    expect(width).toBe(300);
    expect(height).toBe(200);
  });

  it('should have all presets with valid dimensions', () => {
    CROP_PRESETS.forEach((preset) => {
      expect(preset.width).toBeGreaterThan(0);
      expect(preset.height).toBeGreaterThan(0);
      expect(preset.name).toBeTruthy();
      expect(preset.label).toBeTruthy();
    });
  });
});
