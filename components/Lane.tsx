import React from 'react';
import { LaneColor } from '../types';

interface LaneProps {
  color: LaneColor;
  active: boolean; // Is the button pressed?
  hotkey: string;
}

// Solid Bahian colors for the ribbons
const ribbonColors = {
  [LaneColor.GREEN]: 'bg-axe-green',
  [LaneColor.RED]: 'bg-axe-orange', // Using Orange for Red lane for aesthetics
  [LaneColor.BLUE]: 'bg-axe-turquoise',
  [LaneColor.YELLOW]: 'bg-axe-yellow',
};

// Slot (Receptor) Ring Colors - High contrast neon glow
const slotColors = {
  [LaneColor.GREEN]: 'border-axe-green shadow-[0_0_15px_#00FF00,inset_0_0_10px_#00FF00]',
  [LaneColor.RED]: 'border-axe-orange shadow-[0_0_15px_#FF5500,inset_0_0_10px_#FF5500]',
  [LaneColor.BLUE]: 'border-axe-turquoise shadow-[0_0_15px_#00CED1,inset_0_0_10px_#00CED1]',
  [LaneColor.YELLOW]: 'border-axe-yellow shadow-[0_0_15px_#FFD700,inset_0_0_10px_#FFD700]',
};

const Lane: React.FC<LaneProps> = ({ color, active, hotkey }) => {
  return (
    <div className={`relative h-full w-1/4 flex flex-col justify-end items-center`}>
      
      {/* The Fita (Ribbon) Body */}
      {/* Static, straight, fabric texture */}
      <div className={`
        absolute top-0 bottom-0 w-8 lg:w-10 
        ${ribbonColors[color]}
        opacity-80
        flex flex-col items-center overflow-hidden
        border-x border-white/10
        z-0
      `}>
         {/* Fabric Texture / Text simulation (Dashed line) */}
         <div className="absolute inset-y-0 w-[2px] border-r-2 border-dashed border-black/20" />
      </div>

      {/* The Slot / Receptor */}
      {/* Set to bottom-[40px] as requested */}
      <div className={`
        absolute bottom-[40px] 
        w-14 h-14 lg:w-16 lg:h-16
        rounded-full border-[5px]
        flex items-center justify-center
        z-10
        transition-all duration-75 ease-out
        ${active ? 'scale-110 bg-white/40' : 'bg-black/60'}
        ${slotColors[color]}
      `}>
        {/* Inner thin ring for precision look */}
        <div className="absolute inset-1 rounded-full border border-white/30" />
        
        {/* Center dot - flashes when active */}
        <div className={`
            w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white]
            transition-opacity duration-75
            ${active ? 'opacity-100 scale-125' : 'opacity-40'}
        `} />
      </div>

      {/* Key indicator removed as requested */}

      {/* Active Press Beam (Visual Feedback) */}
      {active && (
        <div className={`
          absolute bottom-[40px] h-[60vh] w-full 
          bg-gradient-to-t from-white/30 via-white/5 to-transparent 
          pointer-events-none z-0
        `} />
      )}
    </div>
  );
};

export default Lane;