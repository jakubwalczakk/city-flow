import { cn } from '@/lib/utils';

type StepIndicatorProps = {
  currentStep: number;
  steps: string[];
};

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className='w-full mb-8'>
      <div className='flex items-center justify-between'>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={step} className='flex items-center flex-1'>
              <div className='flex flex-col items-center flex-1'>
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'bg-primary text-primary-foreground ring-4 ring-primary/20',
                    isUpcoming && 'bg-muted text-muted-foreground'
                  )}
                >
                  {stepNumber}
                </div>
                <span
                  className={cn(
                    'mt-2 text-sm font-medium text-center',
                    isCurrent && 'text-foreground',
                    (isCompleted || isUpcoming) && 'text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn('h-0.5 flex-1 mx-2 mb-6 transition-colors', isCompleted ? 'bg-primary' : 'bg-muted')}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
