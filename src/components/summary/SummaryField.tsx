import { memo } from 'react';
import type { LucideIcon } from 'lucide-react';

type SummaryFieldProps = {
  icon?: LucideIcon;
  label: string;
  children: React.ReactNode;
};

/**
 * Reusable field component for displaying labeled summary data.
 * Optionally renders an icon before the label.
 */
export const SummaryField = memo(function SummaryField({ icon: Icon, label, children }: SummaryFieldProps) {
  return (
    <div>
      <p className='text-sm text-muted-foreground mb-1 flex items-center gap-1'>
        {Icon && <Icon className='h-3 w-3' />}
        {label}
      </p>
      <div className='font-medium'>{children}</div>
    </div>
  );
});
