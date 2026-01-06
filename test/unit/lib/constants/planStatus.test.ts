import { describe, it, expect } from 'vitest';
import { PLAN_STATUS_CONFIG, getPlanStatusConfig } from '@/lib/constants/planStatus';
import type { PlanStatus } from '@/types';

describe('planStatus', () => {
  describe('PLAN_STATUS_CONFIG constant', () => {
    it('should be defined', () => {
      expect(PLAN_STATUS_CONFIG).toBeDefined();
    });

    it('should be an object', () => {
      expect(typeof PLAN_STATUS_CONFIG).toBe('object');
    });

    it('should have configuration for all plan statuses', () => {
      expect(PLAN_STATUS_CONFIG.draft).toBeDefined();
      expect(PLAN_STATUS_CONFIG.generated).toBeDefined();
      expect(PLAN_STATUS_CONFIG.archived).toBeDefined();
    });

    it('should have correct structure for "draft" status', () => {
      expect(PLAN_STATUS_CONFIG.draft).toEqual({
        label: 'Szkic',
        variant: 'secondary',
      });
    });

    it('should have correct structure for "generated" status', () => {
      expect(PLAN_STATUS_CONFIG.generated).toEqual({
        label: 'Wygenerowany',
        variant: 'default',
      });
    });

    it('should have correct structure for "archived" status', () => {
      expect(PLAN_STATUS_CONFIG.archived).toEqual({
        label: 'Zarchiwizowany',
        variant: 'outline',
      });
    });

    it('should have Polish labels', () => {
      const labels = Object.values(PLAN_STATUS_CONFIG).map((config) => config.label);
      expect(labels).toContain('Szkic');
      expect(labels).toContain('Wygenerowany');
      expect(labels).toContain('Zarchiwizowany');
    });

    it('should have valid badge variants', () => {
      const validVariants = ['default', 'secondary', 'outline', 'destructive'];
      Object.values(PLAN_STATUS_CONFIG).forEach((config) => {
        expect(validVariants).toContain(config.variant);
      });
    });
  });

  describe('getPlanStatusConfig', () => {
    it('should return correct config for "draft" status', () => {
      const result = getPlanStatusConfig('draft');
      expect(result).toEqual({
        label: 'Szkic',
        variant: 'secondary',
      });
    });

    it('should return correct config for "generated" status', () => {
      const result = getPlanStatusConfig('generated');
      expect(result).toEqual({
        label: 'Wygenerowany',
        variant: 'default',
      });
    });

    it('should return correct config for "archived" status', () => {
      const result = getPlanStatusConfig('archived');
      expect(result).toEqual({
        label: 'Zarchiwizowany',
        variant: 'outline',
      });
    });

    it('should return label property', () => {
      const result = getPlanStatusConfig('draft');
      expect(result.label).toBeDefined();
      expect(typeof result.label).toBe('string');
    });

    it('should return variant property', () => {
      const result = getPlanStatusConfig('draft');
      expect(result.variant).toBeDefined();
      expect(typeof result.variant).toBe('string');
    });

    it('should return undefined for invalid status', () => {
      const result = getPlanStatusConfig('invalid' as PlanStatus);
      expect(result).toBeUndefined();
    });
  });
});
