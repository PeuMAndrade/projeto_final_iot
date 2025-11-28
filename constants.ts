import { Note, GameConfig } from './types';

export const GAME_CONFIG: GameConfig = {
  trackSpeed: 0.6, // Pixels per ms (adjusted for perspective)
  hitWindow: 150, // ms +/- to count as a hit
  songDuration: 60000, // 60 seconds demo
};

export const LANE_KEYS = ['a', 's', 'd', 'f'];

// Generate a rhythmic pattern simulating a Samba-Reggae beat
export const GENERATE_SONG = (): Note[] => {
  const notes: Note[] = [];
  let noteId = 0;
  const bpm = 110;
  const beatInterval = 60000 / bpm;
  
  // Create pattern for 60 seconds
  for (let i = 0; i < (GAME_CONFIG.songDuration / beatInterval); i++) {
    const time = i * beatInterval;
    
    // Axé pattern simulation (syncope)
    // Beat 1: Green (Bass)
    if (i % 4 === 0) {
        notes.push({ id: noteId++, lane: 0, time: time + 2000, hit: false, missed: false });
    }
    
    // Beat 2: Red & Blue (Snare/Repique)
    if (i % 2 !== 0) {
         notes.push({ id: noteId++, lane: 1, time: time + 2000, hit: false, missed: false });
    }

    // Beat 3: Yellow (Surdo virado) - complex pattern
    if (i % 8 === 7 || i % 8 === 6) {
        notes.push({ id: noteId++, lane: 3, time: time + 2000, hit: false, missed: false });
    }
    
    // Random fills on Blue
    if (Math.random() > 0.7 && i % 2 === 0) {
        notes.push({ id: noteId++, lane: 2, time: time + 2250, hit: false, missed: false });
    }
  }
  
  return notes.sort((a, b) => a.time - b.time);
};