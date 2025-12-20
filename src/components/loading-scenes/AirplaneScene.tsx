type AirplaneSceneProps = {
  isActive: boolean;
};

/**
 * Animated airplane takeoff scene for loading states.
 */
export function AirplaneScene({ isActive }: AirplaneSceneProps) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!isActive}
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
  );
}
