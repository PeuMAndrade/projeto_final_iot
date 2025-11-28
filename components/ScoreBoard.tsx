import React from 'react';
import { ScoreState } from '../types';

interface ScoreBoardProps {
  scoreState: ScoreState;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ scoreState }) => {
  const { currentScore, multiplier, streak } = scoreState;

  const getMultiplierText = (m: number) => {
    if (m >= 4) return 'BARRIL RETADO';
    if (m === 3) return 'BARRIL TRIPLICADO';
    if (m === 2) return 'BARRIL DOBRADO';
    return 'BARRIL';
  };

  return (
    <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-start z-20 pointer-events-none">
      
      {/* Multiplier Gauge */}
      <div className="flex flex-col items-center">
        <div className={`
          w-16 h-16 md:w-24 md:h-24 rounded-full border-4 md:border-8 flex items-center justify-center bg-black/50 backdrop-blur
          ${multiplier >= 4 ? 'border-axe-purple shadow-[0_0_30px_#8A2BE2] animate-bounce-short' : 
            multiplier >= 3 ? 'border-axe-pink' : 
            multiplier >= 2 ? 'border-axe-blue' : 'border-white/20'}
        `}>
          <span className="text-2xl md:text-4xl font-black text-white italic">{multiplier}x</span>
        </div>
        <div className="mt-1 md:mt-2 text-axe-yellow font-bold text-shadow text-[10px] md:text-lg uppercase tracking-wider text-center whitespace-nowrap">
            {getMultiplierText(multiplier)}
        </div>
        <div className="w-16 md:w-24 h-1 md:h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
             {/* Simple visual representation of streak progress towards next multiplier */}
             <div 
                className="h-full bg-gradient-to-r from-axe-green to-axe-yellow transition-all duration-200"
                style={{ width: `${Math.min((streak % 10) * 10, 100)}%` }}
             />
        </div>
      </div>

      {/* Score */}
      <div className="flex flex-col items-end">
        <div className="text-4xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg">
          {currentScore.toLocaleString()}
        </div>
        <div className="text-axe-green font-bold text-xs md:text-xl uppercase tracking-widest">
            Energia do Axé
        </div>
        
        {streak > 5 && (
            <div className="mt-2 md:mt-4 text-lg md:text-2xl font-black text-axe-pink animate-pulse">
                {streak} DE SWINGZÃO!
            </div>
        )}
      </div>
    </div>
  );
};

export default ScoreBoard;