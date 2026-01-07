import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanGenerationLoading } from '@/components/PlanGenerationLoading';
import * as useSceneRotationModule from '@/hooks/useSceneRotation';

// Mock hooks
vi.mock('@/hooks/useSceneRotation');

// Mock scene components
vi.mock('@/components/loading-scenes', () => ({
  AirplaneScene: ({ isActive }: { isActive: boolean }) => (
    <div data-testid='airplane-scene' data-active={isActive}>
      Airplane Scene
    </div>
  ),
  BeachScene: ({ isActive }: { isActive: boolean }) => (
    <div data-testid='beach-scene' data-active={isActive}>
      Beach Scene
    </div>
  ),
  SunsetScene: ({ isActive }: { isActive: boolean }) => (
    <div data-testid='sunset-scene' data-active={isActive}>
      Sunset Scene
    </div>
  ),
}));

describe('PlanGenerationLoading', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSceneRotationModule.useSceneRotation).mockReturnValue({
      currentScene: 0,
    });
  });

  describe('rendering', () => {
    it('should render generation loader', () => {
      render(<PlanGenerationLoading planName='Paris Trip' />);

      expect(screen.getByTestId('generation-loader')).toBeInTheDocument();
    });

    it('should have status role and aria-live', () => {
      render(<PlanGenerationLoading planName='Paris Trip' />);

      const loader = screen.getByTestId('generation-loader');
      expect(loader).toHaveAttribute('role', 'status');
      expect(loader).toHaveAttribute('aria-live', 'polite');
    });

    it('should render generation title', () => {
      render(<PlanGenerationLoading planName='Paris Trip' />);

      expect(screen.getByTestId('generation-title')).toBeInTheDocument();
      expect(screen.getByText('Tworzenie planu')).toBeInTheDocument();
    });

    it('should render plan name', () => {
      render(<PlanGenerationLoading planName='Tokyo Adventure' />);

      expect(screen.getByTestId('generation-plan-name')).toBeInTheDocument();
      expect(screen.getByText('Tokyo Adventure')).toBeInTheDocument();
    });

    it('should render animation container', () => {
      render(<PlanGenerationLoading planName='Paris Trip' />);

      expect(screen.getByTestId('generation-animation')).toBeInTheDocument();
    });

    it('should render loading indicator', () => {
      render(<PlanGenerationLoading planName='Paris Trip' />);

      expect(screen.getByTestId('generation-loading-indicator')).toBeInTheDocument();
    });
  });

  describe('loading indicator', () => {
    it('should show loading text', () => {
      render(<PlanGenerationLoading planName='Paris Trip' />);

      expect(screen.getByText('Tworzenie idealnego planu podróży...')).toBeInTheDocument();
    });

    it('should render loading dots', () => {
      render(<PlanGenerationLoading planName='Paris Trip' />);

      expect(screen.getByTestId('generation-loading-dots')).toBeInTheDocument();
    });
  });

  describe('scene components', () => {
    it('should render all three scene components', () => {
      render(<PlanGenerationLoading planName='Paris Trip' />);

      expect(screen.getByTestId('airplane-scene')).toBeInTheDocument();
      expect(screen.getByTestId('beach-scene')).toBeInTheDocument();
      expect(screen.getByTestId('sunset-scene')).toBeInTheDocument();
    });

    it('should set airplane scene as active when currentScene is 0', () => {
      vi.mocked(useSceneRotationModule.useSceneRotation).mockReturnValue({
        currentScene: 0,
      });

      render(<PlanGenerationLoading planName='Paris Trip' />);

      expect(screen.getByTestId('airplane-scene')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('beach-scene')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('sunset-scene')).toHaveAttribute('data-active', 'false');
    });

    it('should set beach scene as active when currentScene is 1', () => {
      vi.mocked(useSceneRotationModule.useSceneRotation).mockReturnValue({
        currentScene: 1,
      });

      render(<PlanGenerationLoading planName='Paris Trip' />);

      expect(screen.getByTestId('airplane-scene')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('beach-scene')).toHaveAttribute('data-active', 'true');
      expect(screen.getByTestId('sunset-scene')).toHaveAttribute('data-active', 'false');
    });

    it('should set sunset scene as active when currentScene is 2', () => {
      vi.mocked(useSceneRotationModule.useSceneRotation).mockReturnValue({
        currentScene: 2,
      });

      render(<PlanGenerationLoading planName='Paris Trip' />);

      expect(screen.getByTestId('airplane-scene')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('beach-scene')).toHaveAttribute('data-active', 'false');
      expect(screen.getByTestId('sunset-scene')).toHaveAttribute('data-active', 'true');
    });
  });

  describe('hook initialization', () => {
    it('should call useSceneRotation with correct parameters', () => {
      render(<PlanGenerationLoading planName='Paris Trip' />);

      expect(useSceneRotationModule.useSceneRotation).toHaveBeenCalledWith(3, 3000);
    });
  });

  describe('different plan names', () => {
    it('should display different plan names correctly', () => {
      const { rerender } = render(<PlanGenerationLoading planName='Berlin Adventure' />);
      expect(screen.getByText('Berlin Adventure')).toBeInTheDocument();

      rerender(<PlanGenerationLoading planName='New York City Tour' />);
      expect(screen.getByText('New York City Tour')).toBeInTheDocument();
    });

    it('should handle long plan names', () => {
      render(<PlanGenerationLoading planName='Extended European Multi-City Adventure 2024' />);

      expect(screen.getByText('Extended European Multi-City Adventure 2024')).toBeInTheDocument();
    });

    it('should handle empty plan name', () => {
      render(<PlanGenerationLoading planName='' />);

      expect(screen.getByTestId('generation-plan-name')).toHaveTextContent('');
    });
  });
});
