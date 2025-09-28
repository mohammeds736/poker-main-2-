import React from 'react';
import { PokerChip as PokerChipType } from '@/types/poker';

interface PokerChipProps {
  chip: PokerChipType;
  onClick?: () => void;
}

const chipDesigns = {
  1: { color: 'bg-gradient-to-br from-gray-300 to-gray-500', border: 'border-gray-600', text: 'text-black' },
  5: { color: 'bg-gradient-to-br from-red-400 to-red-600', border: 'border-red-700', text: 'text-white' },
  10: { color: 'bg-gradient-to-br from-blue-400 to-blue-600', border: 'border-blue-700', text: 'text-white' },
  25: { color: 'bg-gradient-to-br from-green-400 to-green-600', border: 'border-green-700', text: 'text-white' },
  50: { color: 'bg-gradient-to-br from-orange-400 to-orange-600', border: 'border-orange-700', text: 'text-white' },
  100: { color: 'bg-gradient-to-br from-purple-400 to-purple-600', border: 'border-purple-700', text: 'text-white' },
  500: { color: 'bg-gradient-to-br from-pink-400 to-pink-600', border: 'border-pink-700', text: 'text-white' },
  1000: { color: 'bg-gradient-to-br from-yellow-400 to-yellow-600', border: 'border-yellow-700', text: 'text-black' },
  5000: { color: 'bg-gradient-to-br from-indigo-400 to-indigo-600', border: 'border-indigo-700', text: 'text-white' },
  10000: { color: 'bg-gradient-to-br from-emerald-400 to-emerald-600', border: 'border-emerald-700', text: 'text-white' }
};

export default function PokerChip({ chip, onClick }: PokerChipProps) {
  const getChipDesign = (value: number) => {
    const exactMatch = chipDesigns[value as keyof typeof chipDesigns];
    if (exactMatch) return exactMatch;
    
    // Find closest value
    const values = Object.keys(chipDesigns).map(Number).sort((a, b) => a - b);
    let closest = values[0];
    
    for (const val of values) {
      if (Math.abs(val - value) < Math.abs(closest - value)) {
        closest = val;
      }
    }
    
    return chipDesigns[closest as keyof typeof chipDesigns];
  };

  const design = getChipDesign(chip.value);

  return (
    <div
      className={`
        relative w-16 h-16 rounded-full cursor-pointer transform transition-all duration-300
        ${design.color} ${design.border} border-4 shadow-lg hover:scale-110 hover:shadow-xl
        ${chip.animated ? 'animate-bounce' : ''}
        flex items-center justify-center
      `}
      style={{
        position: 'absolute',
        left: chip.position.x,
        top: chip.position.y,
        zIndex: 10
      }}
      onClick={onClick}
    >
      {/* Chip Pattern */}
      <div className="absolute inset-2 rounded-full border-2 border-white/30">
        <div className="absolute inset-1 rounded-full border border-white/20">
          {/* Center Design */}
          <div className="w-full h-full flex items-center justify-center">
            <div className={`text-xs font-bold ${design.text} text-center leading-tight`}>
              {chip.value >= 1000 ? `${chip.value / 1000}K` : chip.value}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Dots */}
      <div className="absolute inset-0">
        {[0, 60, 120, 180, 240, 300].map((angle, index) => (
          <div
            key={index}
            className="absolute w-2 h-2 bg-white/40 rounded-full"
            style={{
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-22px)`
            }}
          />
        ))}
      </div>

      {/* Shine Effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-transparent pointer-events-none" />
      
      {/* Value Display on Hover */}
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
        {chip.value} 🪙
      </div>
    </div>
  );
}

// Chip Stack Component
interface ChipStackProps {
  chips: PokerChipType[];
  position: { x: number; y: number };
  maxVisible?: number;
}

export function ChipStack({ chips, position, maxVisible = 5 }: ChipStackProps) {
  const sortedChips = [...chips].sort((a, b) => b.value - a.value);
  const visibleChips = sortedChips.slice(0, maxVisible);
  const totalValue = chips.reduce((sum, chip) => sum + chip.value, 0);

  return (
    <div
      className="relative"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y
      }}
    >
      {visibleChips.map((chip, index) => (
        <div
          key={chip.id}
          className="absolute"
          style={{
            zIndex: index,
            transform: `translateY(${-index * 4}px)`
          }}
        >
          <PokerChip
            chip={{
              ...chip,
              position: { x: 0, y: 0 }
            }}
          />
        </div>
      ))}
      
      {chips.length > maxVisible && (
        <div
          className="absolute text-white text-xs bg-black/70 px-2 py-1 rounded -top-8 left-1/2 transform -translate-x-1/2"
          style={{ zIndex: maxVisible + 1 }}
        >
          +{chips.length - maxVisible} more
        </div>
      )}
      
      {/* Total Value Display */}
      <div
        className="absolute text-yellow-400 text-sm font-bold bg-black/70 px-2 py-1 rounded -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
        style={{ zIndex: maxVisible + 1 }}
      >
        {totalValue >= 1000 ? `${(totalValue / 1000).toFixed(1)}K` : totalValue} 🪙
      </div>
    </div>
  );
}

// Betting Animation Component
interface BettingAnimationProps {
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  chips: PokerChipType[];
  onComplete: () => void;
}

export function BettingAnimation({ fromPosition, toPosition, chips, onComplete }: BettingAnimationProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {chips.map((chip, index) => (
        <div
          key={chip.id}
          className="absolute transition-all duration-1000 ease-out"
          style={{
            left: fromPosition.x,
            top: fromPosition.y,
            transform: `translate(${toPosition.x - fromPosition.x}px, ${toPosition.y - fromPosition.y}px)`,
            transitionDelay: `${index * 100}ms`
          }}
        >
          <PokerChip chip={chip} />
        </div>
      ))}
    </div>
  );
}
