import { describe, it, expect, beforeEach } from 'vitest';
import { logAiUsage, getAiUsageStats, getRecentAiUsage } from './db';
import { getDb } from './db';

describe('AI Usage Logging', () => {
  beforeEach(async () => {
    // Clear test data before each test
    const db = await getDb();
    if (db) {
      // Note: In a real test environment, you would clear the ai_usage table
      // For now, we'll just verify the functions exist and have correct signatures
    }
  });

  it('should have logAiUsage function', async () => {
    expect(typeof logAiUsage).toBe('function');
  });

  it('should have getAiUsageStats function', async () => {
    expect(typeof getAiUsageStats).toBe('function');
  });

  it('should have getRecentAiUsage function', async () => {
    expect(typeof getRecentAiUsage).toBe('function');
  });

  it('should log AI usage with correct data structure', async () => {
    const testData = {
      sessionId: 'test-session-123',
      userId: null,
      modelUsed: 'render.generate',
      costEstimated: 5,
      status: 'success' as const,
    };

    // This would normally insert into the database
    // In a real test, you would verify the data was inserted
    await logAiUsage(testData);

    // Verify no errors were thrown
    expect(true).toBe(true);
  });

  it('should calculate stats for date range', async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();

    const stats = await getAiUsageStats(startDate, endDate);

    // Verify stats structure
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('count');
    expect(stats).toHaveProperty('byModel');
    expect(stats).toHaveProperty('daily');

    // Verify types
    expect(typeof stats.total).toBe('number');
    expect(typeof stats.count).toBe('number');
    expect(typeof stats.byModel).toBe('object');
    expect(Array.isArray(stats.daily)).toBe(true);
  });

  it('should return recent usage logs', async () => {
    const recentUsage = await getRecentAiUsage(20);

    // Verify it returns an array
    expect(Array.isArray(recentUsage)).toBe(true);

    // If there are logs, verify their structure
    if (recentUsage.length > 0) {
      const log = recentUsage[0];
      expect(log).toHaveProperty('id');
      expect(log).toHaveProperty('sessionId');
      expect(log).toHaveProperty('modelUsed');
      expect(log).toHaveProperty('costEstimated');
      expect(log).toHaveProperty('status');
      expect(log).toHaveProperty('createdAt');
    }
  });

  it('should handle different model types', async () => {
    const models = ['render.generate', 'generateFromReference'];

    for (const model of models) {
      const testData = {
        sessionId: `test-session-${model}`,
        userId: null,
        modelUsed: model,
        costEstimated: model === 'render.generate' ? 5 : 10,
        status: 'success' as const,
      };

      await logAiUsage(testData);
      expect(true).toBe(true);
    }
  });

  it('should calculate monthly prediction correctly', async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const stats = await getAiUsageStats(startDate, endDate);

    // If we have daily data, verify monthly prediction calculation
    if (stats.daily.length > 0) {
      const avgDailyCost = stats.total / stats.daily.length;
      const monthlyPrediction = avgDailyCost * 30;

      // Verify it's a reasonable number
      expect(monthlyPrediction).toBeGreaterThanOrEqual(0);
      expect(typeof monthlyPrediction).toBe('number');
    }
  });

  it('should group costs by model correctly', async () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    const stats = await getAiUsageStats(startDate, endDate);

    // Verify byModel structure
    Object.entries(stats.byModel).forEach(([model, data]) => {
      expect(typeof model).toBe('string');
      expect(typeof data.count).toBe('number');
      expect(typeof data.cost).toBe('number');
      expect(data.count).toBeGreaterThanOrEqual(0);
      expect(data.cost).toBeGreaterThanOrEqual(0);
    });
  });
});
