type SunsetSceneProps = {
  isActive: boolean;
};

/**
 * Animated sunset over ocean scene for loading states.
 */
export function SunsetScene({ isActive }: SunsetSceneProps) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!isActive}
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
          <BirdIcon size={4} />
        </div>
        <div className='absolute top-16 right-1/3 animate-bird-fly-delayed'>
          <BirdIcon size={3} opacity={0.7} />
        </div>
      </div>
    </div>
  );
}

function BirdIcon({ size, opacity = 1 }: { size: number; opacity?: number }) {
  return (
    <svg
      className={`h-${size} w-${size}`}
      style={{ height: `${size * 0.25}rem`, width: `${size * 0.25}rem`, opacity }}
      fill='currentColor'
      viewBox='0 0 24 24'
    >
      <path d='M12 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z' />
    </svg>
  );
}
