import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BeachScene } from '@/components/loading-scenes/BeachScene';

describe('BeachScene', () => {
  describe('rendering', () => {
    it('should render beach scene', () => {
      const { container } = render(<BeachScene isActive={true} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render sun element', () => {
      const { container } = render(<BeachScene isActive={true} />);

      const sun = container.querySelector('.animate-pulse-slow');
      expect(sun).toBeInTheDocument();
    });

    it('should render beach element', () => {
      const { container } = render(<BeachScene isActive={true} />);

      // Beach has gradient from amber
      const beach = container.querySelector('.from-amber-200');
      expect(beach).toBeInTheDocument();
    });

    it('should render palm trees', () => {
      const { container } = render(<BeachScene isActive={true} />);

      const palmTreeLeft = container.querySelector('.animate-sway');
      const palmTreeRight = container.querySelector('.animate-sway-delayed');

      expect(palmTreeLeft).toBeInTheDocument();
      expect(palmTreeRight).toBeInTheDocument();
    });

    it('should render waves', () => {
      const { container } = render(<BeachScene isActive={true} />);

      const wave1 = container.querySelector('.animate-wave');
      const wave2 = container.querySelector('.animate-wave-delayed');

      expect(wave1).toBeInTheDocument();
      expect(wave2).toBeInTheDocument();
    });

    it('should have gradient background', () => {
      const { container } = render(<BeachScene isActive={true} />);

      const background = container.querySelector('.bg-gradient-to-b.from-sky-300.to-blue-200');
      expect(background).toBeInTheDocument();
    });
  });

  describe('isActive prop', () => {
    it('should have opacity-100 when isActive is true', () => {
      const { container } = render(<BeachScene isActive={true} />);

      expect(container.firstChild).toHaveClass('opacity-100');
    });

    it('should have opacity-0 when isActive is false', () => {
      const { container } = render(<BeachScene isActive={false} />);

      expect(container.firstChild).toHaveClass('opacity-0');
    });

    it('should not have aria-hidden when isActive is true', () => {
      const { container } = render(<BeachScene isActive={true} />);

      expect(container.firstChild).not.toHaveAttribute('aria-hidden', 'true');
    });

    it('should have aria-hidden when isActive is false', () => {
      const { container } = render(<BeachScene isActive={false} />);

      expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('animations', () => {
    it('should have animation on sun', () => {
      const { container } = render(<BeachScene isActive={true} />);

      const sun = container.querySelector('.animate-pulse-slow');
      expect(sun).toBeInTheDocument();
    });

    it('should have sway animation on palm trees', () => {
      const { container } = render(<BeachScene isActive={true} />);

      expect(container.querySelector('.animate-sway')).toBeInTheDocument();
      expect(container.querySelector('.animate-sway-delayed')).toBeInTheDocument();
    });

    it('should have wave animations', () => {
      const { container } = render(<BeachScene isActive={true} />);

      expect(container.querySelector('.animate-wave')).toBeInTheDocument();
      expect(container.querySelector('.animate-wave-delayed')).toBeInTheDocument();
    });
  });

  describe('structure', () => {
    it('should have absolute positioning on main container', () => {
      const { container } = render(<BeachScene isActive={true} />);

      expect(container.firstChild).toHaveClass('absolute');
      expect(container.firstChild).toHaveClass('inset-0');
    });

    it('should have transition classes', () => {
      const { container } = render(<BeachScene isActive={true} />);

      expect(container.firstChild).toHaveClass('transition-opacity');
      expect(container.firstChild).toHaveClass('duration-1000');
    });
  });

  describe('rerendering', () => {
    it('should update opacity when isActive changes', () => {
      const { container, rerender } = render(<BeachScene isActive={true} />);

      expect(container.firstChild).toHaveClass('opacity-100');

      rerender(<BeachScene isActive={false} />);

      expect(container.firstChild).toHaveClass('opacity-0');
    });

    it('should update aria-hidden when isActive changes', () => {
      const { container, rerender } = render(<BeachScene isActive={false} />);

      expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');

      rerender(<BeachScene isActive={true} />);

      expect(container.firstChild).not.toHaveAttribute('aria-hidden', 'true');
    });
  });
});
