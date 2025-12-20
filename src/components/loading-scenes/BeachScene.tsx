type BeachSceneProps = {
  isActive: boolean;
};

/**
 * Animated beach with palm trees scene for loading states.
 */
export function BeachScene({ isActive }: BeachSceneProps) {
  return (
    <div
      className={`absolute inset-0 transition-opacity duration-1000 ${isActive ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={!isActive}
    >
      <div className='relative h-full w-full bg-gradient-to-b from-sky-300 to-blue-200'>
        {/* Sun */}
        <div className='absolute top-4 right-8 h-16 w-16 animate-pulse-slow rounded-full bg-yellow-400 shadow-lg shadow-yellow-300/50' />

        {/* Beach */}
        <div className='absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-amber-200 to-amber-100' />

        {/* Palm Tree Left */}
        <div className='absolute bottom-20 left-12 animate-sway'>
          <PalmTree height={16} />
        </div>

        {/* Palm Tree Right */}
        <div className='absolute bottom-20 right-16 animate-sway-delayed'>
          <PalmTree height={20} />
        </div>

        {/* Waves */}
        <div className='absolute bottom-16 left-0 right-0'>
          <div className='h-4 animate-wave bg-blue-400/50 rounded-full' />
          <div className='h-3 animate-wave-delayed bg-blue-300/40 rounded-full mt-1' />
        </div>
      </div>
    </div>
  );
}

function PalmTree({ height }: { height: number }) {
  return (
    <div className='relative'>
      {/* Trunk */}
      <div className={`h-${height} w-2 bg-amber-700 mx-auto`} style={{ height: `${height * 0.25}rem` }} />
      {/* Leaves */}
      <div className='absolute -top-2 left-1/2 -translate-x-1/2'>
        <div className='h-8 w-8 rotate-45 bg-green-600 rounded-full' />
        <div className='absolute top-0 left-0 h-8 w-8 -rotate-45 bg-green-500 rounded-full' />
      </div>
    </div>
  );
}
