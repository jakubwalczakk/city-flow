import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthForm } from '@/components/auth/AuthForm';

// Mock the child components
vi.mock('@/components/auth/LoginForm', () => ({
  LoginForm: vi.fn(() => <div data-testid='login-form'>Login Form</div>),
}));

vi.mock('@/components/auth/RegisterForm', () => ({
  RegisterForm: vi.fn(() => <div data-testid='register-form'>Register Form</div>),
}));

describe('AuthForm', () => {
  it('renders LoginForm when mode is login', () => {
    render(<AuthForm mode='login' />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
    expect(screen.queryByTestId('register-form')).not.toBeInTheDocument();
  });

  it('renders RegisterForm when mode is register', () => {
    render(<AuthForm mode='register' />);
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
    expect(screen.queryByTestId('login-form')).not.toBeInTheDocument();
  });

  it('passes onSuccess callback to LoginForm', () => {
    const onSuccess = vi.fn();
    render(<AuthForm mode='login' onSuccess={onSuccess} />);
    expect(screen.getByTestId('login-form')).toBeInTheDocument();
  });

  it('passes onSuccess callback to RegisterForm', () => {
    const onSuccess = vi.fn();
    render(<AuthForm mode='register' onSuccess={onSuccess} />);
    expect(screen.getByTestId('register-form')).toBeInTheDocument();
  });
});
