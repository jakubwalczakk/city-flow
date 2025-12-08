import { useEffect, useState } from 'react';

type PlanGenerationLoadingProps = {
  planName: string;
};

/**
 * Beautiful loading dialog shown during plan generation with animated travel scenes
 * This component replaces the entire dialog content during generation
 */
export function PlanGenerationLoading({ planName }: PlanGenerationLoadingProps) {
  const [currentScene, setCurrentScene] = useState(0);

  // Rotate through different scenes every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentScene((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='w-full'>
      <div className='space-y-2 mb-6'>
        <h2 className='text-center text-2xl font-semibold'>Tworzenie planu</h2>
      </div>

      <div className='space-y-6 py-6'>
        {/* Plan Name */}
        <div className='text-center'>
          <p className='text-lg font-semibold text-primary'>{planName}</p>
        </div>

        {/* Animation Container */}
        <div className='relative h-48 overflow-hidden rounded-lg bg-gradient-to-b from-sky-200 to-sky-50'>
          {/* Scene 1: Airplane Taking Off */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentScene === 0 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className='relative h-full w-full'>
              {/* Clouds */}
              <div className='absolute top-8 left-10 h-12 w-20 animate-float-slow rounded-full bg-white/80 blur-sm' />
              <div className='absolute top-16 right-16 h-10 w-16 animate-float-slower rounded-full bg-white/70 blur-sm' />
              <div className='absolute top-24 left-1/3 h-8 w-14 animate-float rounded-full bg-white/60 blur-sm' />

              {/* Airplane */}
              <div className='absolute bottom-8 left-0 animate-plane-takeoff'>
                <svg className='h-12 w-12 text-blue-600' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z' />
                </svg>
              </div>
            </div>
          </div>

          {/* Scene 2: Beach with Palms */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentScene === 1 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className='relative h-full w-full bg-gradient-to-b from-sky-300 to-blue-200'>
              {/* Sun */}
              <div className='absolute top-4 right-8 h-16 w-16 animate-pulse-slow rounded-full bg-yellow-400 shadow-lg shadow-yellow-300/50' />

              {/* Beach */}
              <div className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-amber-200 to-amber-100' />

              {/* Palm Trees */}
              <div className='absolute bottom-20 left-12 animate-sway'>
                <div className='relative'>
                  {/* Trunk */}
                  <div className='h-16 w-2 bg-amber-700 mx-auto' />
                  {/* Leaves */}
                  <div className='absolute -top-2 left-1/2 -translate-x-1/2'>
                    <div className='h-8 w-8 rotate-45 bg-green-600 rounded-full' />
                    <div className='absolute top-0 left-0 h-8 w-8 -rotate-45 bg-green-500 rounded-full' />
                  </div>
                </div>
              </div>

              <div className='absolute bottom-20 right-16 animate-sway-delayed'>
                <div className='relative'>
                  {/* Trunk */}
                  <div className='h-20 w-2 bg-amber-700 mx-auto' />
                  {/* Leaves */}
                  <div className='absolute -top-2 left-1/2 -translate-x-1/2'>
                    <div className='h-8 w-8 rotate-45 bg-green-600 rounded-full' />
                    <div className='absolute top-0 left-0 h-8 w-8 -rotate-45 bg-green-500 rounded-full' />
                  </div>
                </div>
              </div>

              {/* Waves */}
              <div className='absolute bottom-16 left-0 right-0'>
                <div className='h-4 animate-wave bg-blue-400/50 rounded-full' />
                <div className='h-3 animate-wave-delayed bg-blue-300/40 rounded-full mt-1' />
              </div>
            </div>
          </div>

          {/* Scene 3: Sunset over Ocean */}
          <div
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentScene === 2 ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className='relative h-full w-full bg-gradient-to-b from-orange-300 via-pink-300 to-purple-400'>
              {/* Sun setting */}
              <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-20 w-20 animate-pulse-slow rounded-full bg-gradient-to-b from-orange-400 to-red-400 shadow-2xl shadow-orange-500/50' />

              {/* Sun reflection on water */}
              <div className='absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-500/30 to-transparent'>
                <div className='absolute top-8 left-1/2 -translate-x-1/2 h-16 w-1 animate-shimmer bg-gradient-to-b from-orange-300/80 to-transparent' />
                <div className='absolute top-4 left-1/2 -translate-x-1/2 -translate-x-4 h-12 w-1 animate-shimmer-delayed bg-gradient-to-b from-orange-300/60 to-transparent' />
                <div className='absolute top-4 left-1/2 -translate-x-1/2 translate-x-4 h-12 w-1 animate-shimmer-delayed-2 bg-gradient-to-b from-orange-300/60 to-transparent' />
              </div>

              {/* Birds */}
              <div className='absolute top-12 left-1/4 animate-bird-fly'>
                <svg className='h-4 w-4 text-gray-800' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z' />
                </svg>
              </div>
              <div className='absolute top-16 right-1/3 animate-bird-fly-delayed'>
                <svg className='h-3 w-3 text-gray-700' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z' />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Text */}
        <div className='text-center space-y-2'>
          <p className='text-sm text-muted-foreground animate-pulse'>Tworzenie idealnego planu podróży...</p>
          <div className='flex justify-center gap-1'>
            <div className='h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]' />
            <div className='h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]' />
            <div className='h-2 w-2 animate-bounce rounded-full bg-primary' />
          </div>
        </div>
      </div>
    </div>
  );
}
