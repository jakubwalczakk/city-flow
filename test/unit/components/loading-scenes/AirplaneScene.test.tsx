import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AirplaneScene } from '@/components/loading-scenes/AirplaneScene';

describe('AirplaneScene', () => {
  describe('rendering', () => {
    it('should render airplane scene', () => {
      const { container } = render(<AirplaneScene isActive={true} />);

      expect(container.firstChild).toBeInTheDocument();
    });

    it('should render airplane SVG', () => {
      const { container } = render(<AirplaneScene isActive={true} />);

      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render clouds', () => {
      const { container } = render(<AirplaneScene isActive={true} />);

      // Check for cloud elements (they have blur-sm class)
      const clouds = container.querySelectorAll('.blur-sm');
      expect(clouds.length).toBeGreaterThan(0);
    });
  });

  describe('isActive prop', () => {
    it('should have opacity-100 when isActive is true', () => {
      const { container } = render(<AirplaneScene isActive={true} />);

      expect(container.firstChild).toHaveClass('opacity-100');
    });

    it('should have opacity-0 when isActive is false', () => {
      const { container } = render(<AirplaneScene isActive={false} />);

      expect(container.firstChild).toHaveClass('opacity-0');
    });

    it('should not have aria-hidden when isActive is true', () => {
      const { container } = render(<AirplaneScene isActive={true} />);

      expect(container.firstChild).not.toHaveAttribute('aria-hidden', 'true');
    });

    it('should have aria-hidden when isActive is false', () => {
      const { container } = render(<AirplaneScene isActive={false} />);

      expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('animations', () => {
    it('should have animation classes on airplane', () => {
      const { container } = render(<AirplaneScene isActive={true} />);

      const airplane = container.querySelector('.animate-plane-takeoff');
      expect(airplane).toBeInTheDocument();
    });

    it('should have animation classes on clouds', () => {
      const { container } = render(<AirplaneScene isActive={true} />);

      expect(container.querySelector('.animate-float-slow')).toBeInTheDocument();
      expect(container.querySelector('.animate-float-slower')).toBeInTheDocument();
      expect(container.querySelector('.animate-float')).toBeInTheDocument();
    });
  });

  describe('structure', () => {
    it('should have absolute positioning on main container', () => {
      const { container } = render(<AirplaneScene isActive={true} />);

      expect(container.firstChild).toHaveClass('absolute');
      expect(container.firstChild).toHaveClass('inset-0');
    });

    it('should have transition classes', () => {
      const { container } = render(<AirplaneScene isActive={true} />);

      expect(container.firstChild).toHaveClass('transition-opacity');
      expect(container.firstChild).toHaveClass('duration-1000');
    });
  });

  describe('rerendering', () => {
    it('should update opacity when isActive changes', () => {
      const { container, rerender } = render(<AirplaneScene isActive={true} />);

      expect(container.firstChild).toHaveClass('opacity-100');

      rerender(<AirplaneScene isActive={false} />);

      expect(container.firstChild).toHaveClass('opacity-0');
    });

    it('should update aria-hidden when isActive changes', () => {
      const { container, rerender } = render(<AirplaneScene isActive={false} />);

      expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');

      rerender(<AirplaneScene isActive={true} />);

      expect(container.firstChild).not.toHaveAttribute('aria-hidden', 'true');
    });
  });
});
