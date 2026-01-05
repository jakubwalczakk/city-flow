import { useSceneRotation } from '@/hooks/useSceneRotation';
import { AirplaneScene, BeachScene, SunsetScene } from '@/components/loading-scenes';

type PlanGenerationLoadingProps = {
  planName: string;
};

const SCENE_COUNT = 3;
const SCENE_INTERVAL_MS = 3000;

/**
 * Beautiful loading dialog shown during plan generation with animated travel scenes.
 * This component replaces the entire dialog content during generation.
 */
export function PlanGenerationLoading({ planName }: PlanGenerationLoadingProps) {
  const { currentScene } = useSceneRotation(SCENE_COUNT, SCENE_INTERVAL_MS);

  return (
    <div className='w-full' role='status' aria-live='polite' data-testid='generation-loader'>
      <div className='space-y-2 mb-6'>
        <h2 className='text-center text-2xl font-semibold' data-testid='generation-title'>
          Tworzenie planu
        </h2>
      </div>

      <div className='space-y-6 py-6'>
        {/* Plan Name */}
        <div className='text-center'>
          <p className='text-lg font-semibold text-primary' data-testid='generation-plan-name'>
            {planName}
          </p>
        </div>

        {/* Animation Container */}
        <div
          className='relative h-48 overflow-hidden rounded-lg bg-gradient-to-b from-sky-200 to-sky-50'
          data-testid='generation-animation'
        >
          <AirplaneScene isActive={currentScene === 0} />
          <BeachScene isActive={currentScene === 1} />
          <SunsetScene isActive={currentScene === 2} />
        </div>

        {/* Loading Text */}
        <LoadingIndicator />
      </div>
    </div>
  );
}

/**
 * Loading indicator with animated dots.
 */
function LoadingIndicator() {
  return (
    <div className='text-center space-y-2' data-testid='generation-loading-indicator'>
      <p className='text-sm text-muted-foreground animate-pulse'>Tworzenie idealnego planu podróży...</p>
      <div className='flex justify-center gap-1' data-testid='generation-loading-dots'>
        <div className='h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]' />
        <div className='h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]' />
        <div className='h-2 w-2 animate-bounce rounded-full bg-primary' />
      </div>
    </div>
  );
}
