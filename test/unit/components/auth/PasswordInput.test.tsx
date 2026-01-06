import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordInput } from '@/components/auth/PasswordInput';

describe('PasswordInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render password input field', () => {
      render(<PasswordInput value='' onChange={mockOnChange} data-testid='password-input' />);

      const input = screen.getByTestId('password-input');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render toggle visibility button', () => {
      render(<PasswordInput value='' onChange={mockOnChange} />);

      const toggleButton = screen.getByLabelText('Pokaż hasło');
      expect(toggleButton).toBeInTheDocument();
    });

    it('should render Eye icon by default', () => {
      render(<PasswordInput value='' onChange={mockOnChange} />);

      const toggleButton = screen.getByLabelText('Pokaż hasło');
      const eyeIcon = toggleButton.querySelector('.lucide-eye');

      expect(eyeIcon).toBeInTheDocument();
    });

    it('should display the provided value', () => {
      render(<PasswordInput value='test123' onChange={mockOnChange} data-testid='password-input' />);

      const input = screen.getByTestId('password-input') as HTMLInputElement;
      expect(input.value).toBe('test123');
    });
  });

  describe('visibility toggle', () => {
    it('should switch to text type when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<PasswordInput value='' onChange={mockOnChange} data-testid='password-input' />);

      const toggleButton = screen.getByLabelText('Pokaż hasło');
      await user.click(toggleButton);

      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should change icon to EyeOff when password is visible', async () => {
      const user = userEvent.setup();
      render(<PasswordInput value='' onChange={mockOnChange} />);

      const toggleButton = screen.getByLabelText('Pokaż hasło');
      await user.click(toggleButton);

      const hideButton = screen.getByLabelText('Ukryj hasło');
      const eyeOffIcon = hideButton.querySelector('.lucide-eye-off');

      expect(eyeOffIcon).toBeInTheDocument();
    });

    it('should switch back to password type when toggled again', async () => {
      const user = userEvent.setup();
      render(<PasswordInput value='' onChange={mockOnChange} data-testid='password-input' />);

      const toggleButton = screen.getByLabelText('Pokaż hasło');

      // Click once to show
      await user.click(toggleButton);
      expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'text');

      // Click again to hide
      const hideButton = screen.getByLabelText('Ukryj hasło');
      await user.click(hideButton);
      expect(screen.getByTestId('password-input')).toHaveAttribute('type', 'password');
    });
  });

  describe('user input', () => {
    it('should call onChange when user types', async () => {
      const user = userEvent.setup();
      render(<PasswordInput value='' onChange={mockOnChange} data-testid='password-input' />);

      const input = screen.getByTestId('password-input');
      await user.type(input, 'a');

      expect(mockOnChange).toHaveBeenCalledWith('a');
    });

    it('should update value when typing multiple characters', async () => {
      const user = userEvent.setup();
      render(<PasswordInput value='' onChange={mockOnChange} data-testid='password-input' />);

      const input = screen.getByTestId('password-input');
      await user.type(input, 'abc');

      expect(mockOnChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      render(<PasswordInput value='' onChange={mockOnChange} disabled data-testid='password-input' />);

      const input = screen.getByTestId('password-input');
      expect(input).toBeDisabled();
    });

    it('should disable toggle button when disabled prop is true', () => {
      render(<PasswordInput value='' onChange={mockOnChange} disabled />);

      const toggleButton = screen.getByLabelText('Pokaż hasło');
      expect(toggleButton).toBeDisabled();
    });

    it('should not call onChange when disabled', async () => {
      const user = userEvent.setup();
      render(<PasswordInput value='' onChange={mockOnChange} disabled data-testid='password-input' />);

      const input = screen.getByTestId('password-input');
      await user.type(input, 'test');

      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  describe('props forwarding', () => {
    it('should accept placeholder prop', () => {
      render(
        <PasswordInput value='' onChange={mockOnChange} placeholder='Enter password' data-testid='password-input' />
      );

      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('placeholder', 'Enter password');
    });

    it('should accept data-testid prop', () => {
      render(<PasswordInput value='' onChange={mockOnChange} data-testid='custom-test-id' />);

      expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
    });

    it('should accept className prop', () => {
      render(<PasswordInput value='' onChange={mockOnChange} className='custom-class' data-testid='password-input' />);

      const input = screen.getByTestId('password-input');
      expect(input).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label on toggle button', () => {
      render(<PasswordInput value='' onChange={mockOnChange} />);

      const toggleButton = screen.getByLabelText('Pokaż hasło');
      expect(toggleButton).toHaveAttribute('aria-label');
    });

    it('should update aria-label when toggled', async () => {
      const user = userEvent.setup();
      render(<PasswordInput value='' onChange={mockOnChange} />);

      const toggleButton = screen.getByLabelText('Pokaż hasło');
      await user.click(toggleButton);

      expect(screen.getByLabelText('Ukryj hasło')).toBeInTheDocument();
    });

    it('should have tabIndex -1 on toggle button', () => {
      render(<PasswordInput value='' onChange={mockOnChange} />);

      const toggleButton = screen.getByLabelText('Pokaż hasło');
      expect(toggleButton).toHaveAttribute('tabIndex', '-1');
    });
  });
});
