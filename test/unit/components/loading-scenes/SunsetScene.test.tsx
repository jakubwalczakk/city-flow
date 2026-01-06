import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SunsetScene } from '@/components/loading-scenes/SunsetScene';

describe('SunsetScene', () => {
  describe('rendering', () => {
    it('should render sunset scene', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render sun element', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      const sun = container.querySelector('.animate-pulse-slow');
      expect(sun).toBeInTheDocument();
    });

    it('should render sun reflection', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      const shimmerElements = container.querySelectorAll('[class*="animate-shimmer"]');
      expect(shimmerElements.length).toBeGreaterThan(0);
    });

    it('should render birds', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      const bird1 = container.querySelector('.animate-bird-fly');
      const bird2 = container.querySelector('.animate-bird-fly-delayed');

      expect(bird1).toBeInTheDocument();
      expect(bird2).toBeInTheDocument();
    });

    it('should render bird SVGs', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      const birdSvgs = container.querySelectorAll('svg');
      expect(birdSvgs.length).toBeGreaterThanOrEqual(2);
    });

    it('should have gradient background', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      const background = container.querySelector('.bg-gradient-to-b.from-orange-300');
      expect(background).toBeInTheDocument();
    });
  });

  describe('isActive prop', () => {
    it('should have opacity-100 when isActive is true', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      expect(container.firstChild).toHaveClass('opacity-100');
    });

    it('should have opacity-0 when isActive is false', () => {
      const { container } = render(<SunsetScene isActive={false} />);

      expect(container.firstChild).toHaveClass('opacity-0');
    });

    it('should not have aria-hidden when isActive is true', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      expect(container.firstChild).not.toHaveAttribute('aria-hidden', 'true');
    });

    it('should have aria-hidden when isActive is false', () => {
      const { container } = render(<SunsetScene isActive={false} />);

      expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('animations', () => {
    it('should have animation on sun', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      const sun = container.querySelector('.animate-pulse-slow');
      expect(sun).toBeInTheDocument();
    });

    it('should have shimmer animations on water reflection', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      expect(container.querySelector('.animate-shimmer')).toBeInTheDocument();
      expect(container.querySelector('.animate-shimmer-delayed')).toBeInTheDocument();
      expect(container.querySelector('.animate-shimmer-delayed-2')).toBeInTheDocument();
    });

    it('should have bird fly animations', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      expect(container.querySelector('.animate-bird-fly')).toBeInTheDocument();
      expect(container.querySelector('.animate-bird-fly-delayed')).toBeInTheDocument();
    });
  });

  describe('structure', () => {
    it('should have absolute positioning on main container', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      expect(container.firstChild).toHaveClass('absolute');
      expect(container.firstChild).toHaveClass('inset-0');
    });

    it('should have transition classes', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      expect(container.firstChild).toHaveClass('transition-opacity');
      expect(container.firstChild).toHaveClass('duration-1000');
    });
  });

  describe('sun positioning', () => {
    it('should position sun at center', () => {
      const { container } = render(<SunsetScene isActive={true} />);

      const sun = container.querySelector('.animate-pulse-slow');
      expect(sun).toHaveClass('left-1/2');
      expect(sun).toHaveClass('top-1/2');
      expect(sun).toHaveClass('-translate-x-1/2');
      expect(sun).toHaveClass('-translate-y-1/2');
    });
  });

  describe('rerendering', () => {
    it('should update opacity when isActive changes', () => {
      const { container, rerender } = render(<SunsetScene isActive={true} />);

      expect(container.firstChild).toHaveClass('opacity-100');

      rerender(<SunsetScene isActive={false} />);

      expect(container.firstChild).toHaveClass('opacity-0');
    });

    it('should update aria-hidden when isActive changes', () => {
      const { container, rerender } = render(<SunsetScene isActive={false} />);

      expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');

      rerender(<SunsetScene isActive={true} />);

      expect(container.firstChild).not.toHaveAttribute('aria-hidden', 'true');
    });
  });
});
