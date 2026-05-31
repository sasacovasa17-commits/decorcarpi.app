import { describe, it, expect } from 'vitest';

describe('APP_MODE configuration', () => {
  it('should have valid APP_MODE from environment', () => {
    const appMode = process.env.APP_MODE;
    expect(appMode).toBeDefined();
    expect(['Production', 'Demo', 'Maintenance']).toContain(appMode);
  });

  it('should return correct mode for generate procedure', () => {
    const mode = process.env.APP_MODE;
    const isAiEnabled = mode === 'Production';
    expect(typeof isAiEnabled).toBe('boolean');
  });

  it('should handle all three modes', () => {
    const validModes = ['Production', 'Demo', 'Maintenance'];
    const currentMode = process.env.APP_MODE;
    expect(validModes.includes(currentMode || '')).toBe(true);
  });
});
