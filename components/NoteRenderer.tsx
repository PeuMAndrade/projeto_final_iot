import React from 'react';
import { Note } from '../types';
import { GAME_CONFIG } from '../constants';

interface NoteRendererProps {
  notes: Note[];
  songTime: number;
}

// Circular Note Styles
const NOTE_STYLES = [
  'bg-gradient-to-br from-green-300 to-axe-green border-white',      // 0
  'bg-gradient-to-br from-orange-300 to-axe-orange border-white',    // 1
  'bg-gradient-to-br from-cyan-300 to-axe-turquoise border-white',   // 2
  'bg-gradient-to-br from-yellow-200 to-axe-yellow border-white'     // 3
];

const NoteRenderer: React.FC<NoteRendererProps> = ({ notes, songTime }) => {
  const VISIBLE_WINDOW = 1600; 
  // Offset to match the Lane's Slot position (40px from bottom)
  const HIT_LINE_OFFSET = 40; 

  const visibleNotes = notes.filter(n => 
    !n.hit && !n.missed && 
    (n.time - songTime) < VISIBLE_WINDOW && 
    (n.time - songTime) > -200
  );

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 20 }}>
      {visibleNotes.map(note => {
        const timeToHit = note.time - songTime;
        const distance = timeToHit * GAME_CONFIG.trackSpeed;
        
        return (
            <div
                key={note.id}
                className={`
                  absolute w-14 h-14 lg:w-16 lg:h-16
                  flex items-center justify-center
                `}
                style={{
                    left: `${(note.lane * 25) + 12.5}%`, 
                    bottom: `${HIT_LINE_OFFSET + distance}px`,
                    transform: 'translateX(-50%) translateZ(0)',
                }}
            >
                {/* The Circular Note */}
                <div className={`
                  w-full h-full rounded-full
                  ${NOTE_STYLES[note.lane]}
                  border-2 shadow-[0_4px_6px_rgba(0,0,0,0.5)]
                  relative
                `}>
                  {/* Inner bevel/shine (3D Button Look) */}
                  <div className="absolute inset-2 rounded-full border border-white/40" />
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-white/40 rounded-full blur-[1px]" />
                  
                  {/* Center detail */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-inner opacity-80" />
                </div>
            </div>
        );
      })}
    </div>
  );
};

export default NoteRenderer;