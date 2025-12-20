import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { InputHTMLAttributes } from 'react';

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/**
 * Reusable password input component with visibility toggle
 * Provides a consistent password input experience across all auth forms
 */
export function PasswordInput({ value, onChange, disabled, className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className='relative'>
      <Input
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`pr-10 ${className || ''}`}
        {...props}
      />
      <Button
        type='button'
        variant='ghost'
        size='sm'
        className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
        onClick={() => setShowPassword(!showPassword)}
        disabled={disabled}
        aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
        tabIndex={-1}
      >
        {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
      </Button>
    </div>
  );
}
