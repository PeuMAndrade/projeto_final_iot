import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note, ScoreState, GameConfig, LaneColor, HighScoreEntry, WebSocketMessage } from './types';
import { GAME_CONFIG, GENERATE_SONG, LANE_KEYS } from './constants';
import { audioService } from './services/audioService';
import { wsService } from './services/webSocketService';

import Menu from './components/Menu';
import Lane from './components/Lane';
import ScoreBoard from './components/ScoreBoard';
import NoteRenderer from './components/NoteRenderer';
import Results from './components/Results';

// Simple Particle Component for visual flair
const ConfettiParticle = ({ color, style }: { color: string, style: React.CSSProperties }) => (
  <div 
    className={`absolute w-3 h-3 ${color} rounded-sm animate-confetti`}
    style={style}
  />
);

const App: React.FC = () => {
  // -- Game State --
  const [gameStatus, setGameStatus] = useState<'menu' | 'playing' | 'ended'>('menu');
  const [scoreState, setScoreState] = useState<ScoreState>({
    currentScore: 0,
    multiplier: 1,
    streak: 0,
    hits: { perfect: 0, good: 0, miss: 0 }
  });
  
  // -- Feedback State --
  const [feedback, setFeedback] = useState<{ text: string, color: string, scale: string } | null>(null);
  const [confetti, setConfetti] = useState<{id: number, color: string, left: string}[]>([]);
  const feedbackTimeoutRef = useRef<number | null>(null);

  // -- Refs --
  const songStartTimeRef = useRef<number>(0);
  const notesRef = useRef<Note[]>([]);
  const animationFrameRef = useRef<number>(0);
  const [currentSongTime, setCurrentSongTime] = useState(0);

  // -- Input State --
  const [activeLanes, setActiveLanes] = useState<boolean[]>([false, false, false, false]);
  
  // -- Meta State --
  const [highScore, setHighScore] = useState<HighScoreEntry | null>(null);
  const [wsUrl, setWsUrl] = useState('ws://localhost:8080');
  const [isGuitarConnected, setIsGuitarConnected] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('axeHeroHighScore');
    if (saved) {
      setHighScore(JSON.parse(saved));
    }
  }, []);

  // -- Visual Effects --

  const triggerConfetti = () => {
    const colors = ['bg-axe-yellow', 'bg-axe-green', 'bg-axe-pink', 'bg-axe-turquoise'];
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: Date.now() + i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${30 + Math.random() * 40}%`
    }));
    setConfetti(prev => [...prev, ...newParticles]);
    
    // Cleanup confetti
    setTimeout(() => {
      setConfetti(prev => prev.filter(p => p.id < Date.now()));
    }, 1000);
  };

  const showFeedback = (text: string, color: string, scale: string = 'scale-100') => {
    if (feedbackTimeoutRef.current) clearTimeout(feedbackTimeoutRef.current);
    
    setFeedback({ text, color, scale });
    
    feedbackTimeoutRef.current = window.setTimeout(() => {
        setFeedback(null);
    }, 800) as unknown as number;
  };

  // -- Game Logic --

  const startGame = () => {
    notesRef.current = GENERATE_SONG();
    setScoreState({
      currentScore: 0,
      multiplier: 1,
      streak: 0,
      hits: { perfect: 0, good: 0, miss: 0 }
    });
    setFeedback(null);
    setConfetti([]);
    audioService.resume();
    songStartTimeRef.current = Date.now();
    setGameStatus('playing');
    loop();
  };

  const endGame = () => {
    cancelAnimationFrame(animationFrameRef.current);
    setGameStatus('ended');
  };

  const quitGame = () => {
    cancelAnimationFrame(animationFrameRef.current);
    setGameStatus('menu');
    setFeedback(null);
    setConfetti([]);
  };

  const saveHighScore = (name: string) => {
    const newEntry = { name, score: scoreState.currentScore };
    setHighScore(newEntry);
    localStorage.setItem('axeHeroHighScore', JSON.stringify(newEntry));
    setGameStatus('menu');
  };

  const loop = () => {
    const now = Date.now();
    const time = now - songStartTimeRef.current;
    setCurrentSongTime(time);

    let missedCount = 0;
    notesRef.current.forEach(note => {
      if (!note.hit && !note.missed && (time - note.time > GAME_CONFIG.hitWindow)) {
        note.missed = true;
        missedCount++;
      }
    });

    if (missedCount > 0) handleMiss(missedCount);

    if (time > GAME_CONFIG.songDuration + 2000) {
      endGame();
    } else {
      animationFrameRef.current = requestAnimationFrame(loop);
    }
  };

  const handleInput = useCallback((laneIndex: number, isPressed: boolean) => {
    setActiveLanes(prev => {
      const next = [...prev];
      next[laneIndex] = isPressed;
      return next;
    });

    if (gameStatus !== 'playing' || !isPressed) return;

    const time = Date.now() - songStartTimeRef.current;
    const hittableNote = notesRef.current.find(n => 
      n.lane === laneIndex && !n.hit && !n.missed &&
      Math.abs(time - n.time) <= GAME_CONFIG.hitWindow
    );

    if (hittableNote) {
      hittableNote.hit = true;
      const accuracy = Math.abs(time - hittableNote.time);
      let points = 100;
      let type: 'perfect' | 'good' = 'good';

      if (accuracy < 60) {
        points = 300;
        type = 'perfect';
        showFeedback("BROCOU!", "text-axe-yellow drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]", "scale-125");
        triggerConfetti();
      } else {
        showFeedback("MASSA!", "text-axe-turquoise", "scale-100");
      }

      setScoreState(prev => {
        const newStreak = prev.streak + 1;
        const newMult = Math.min(4, 1 + Math.floor(newStreak / 10));
        return {
          ...prev,
          currentScore: prev.currentScore + (points * prev.multiplier),
          streak: newStreak,
          multiplier: newMult,
          hits: { ...prev.hits, [type]: prev.hits[type] + 1 }
        };
      });
      
      audioService.playHitSound(laneIndex);
    } else {
      handleMiss(1);
      audioService.playMissSound();
    }
  }, [gameStatus]);

  const handleMiss = (count: number = 1) => {
    showFeedback("VACILOU, PAE", "text-axe-pink", "scale-110");
    setScoreState(prev => ({
      ...prev,
      multiplier: 1,
      streak: 0,
      hits: { ...prev.hits, miss: prev.hits.miss + count }
    }));
  };

  useEffect(() => {
    wsService.setOnStatusChange((status) => setIsGuitarConnected(status));
    wsService.connect(wsUrl);
    
    wsService.setOnMessage((msg: WebSocketMessage) => {
      if (msg.estado) {
        const laneMap: Record<string, number> = {
          [LaneColor.GREEN]: 0, [LaneColor.RED]: 1, [LaneColor.BLUE]: 2, [LaneColor.YELLOW]: 3
        };
        const lane = laneMap[msg.botao];
        if (lane !== undefined) handleInput(lane, msg.estado === 'pressionado');
      }
    });
    return () => wsService.disconnect();
  }, [wsUrl, handleInput]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      
      // Escape functionality to quit game
      if (e.key === 'Escape') {
        if (gameStatus === 'playing') {
            quitGame();
        }
        return;
      }

      const laneIndex = LANE_KEYS.indexOf(e.key.toLowerCase());
      if (laneIndex !== -1) handleInput(laneIndex, true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const laneIndex = LANE_KEYS.indexOf(e.key.toLowerCase());
      if (laneIndex !== -1) handleInput(laneIndex, false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleInput, gameStatus]);

  // -- Dynamic Styles --
  // Neon borders on combo only
  const boardBorderClass = scoreState.multiplier > 1 
    ? 'border-x-2 border-axe-pink shadow-[0_0_25px_#FF007F] animate-pulse' 
    : 'border-x border-white/5';

  return (
    <div className="relative w-full h-screen bg-axe-dark overflow-hidden font-display select-none">
      
      {/* --- BAHIAN ATMOSPHERE BACKGROUND --- */}
      
      {/* 1. Deep Night Sky Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#100020] via-[#1a0b2e] to-[#201040] z-0" />
      
      {/* 2. Trio Elétrico Lights (Blurred blobs moving) */}
      <div className="absolute inset-0 overflow-hidden opacity-30 z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-axe-purple rounded-full blur-[120px] animate-beam" />
          <div className="absolute top-10 right-1/4 w-[400px] h-[400px] bg-axe-pink rounded-full blur-[100px] animate-beam" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/2 w-[600px] h-[300px] bg-axe-blue rounded-full blur-[120px] animate-beam" style={{ animationDelay: '2s' }} />
      </div>

      {/* 3. Salvador Skyline (CSS Silhouettes) */}
      <div className="absolute bottom-0 left-0 right-0 h-48 z-0 pointer-events-none opacity-80">
        
        {/* Crowd Noise Texture */}
        <div className="absolute bottom-0 w-full h-24 bg-[url('https://www.transparenttextures.com/patterns/noise-lines.png')] opacity-20 animate-pulse-fast" />

        {/* Elevador Lacerda */}
        <div className="absolute bottom-0 left-[10%] w-16 h-40 bg-[#080410] flex flex-col items-center">
            <div className="w-20 h-3 bg-[#080410] absolute top-3 -left-2" /> {/* Bridge */}
            <div className="w-12 h-full bg-[#05020a]" /> {/* Main Tower */}
            <div className="w-2 h-2 bg-axe-yellow absolute top-1 rounded-full animate-pulse" /> {/* Light */}
        </div>
        
        {/* Farol da Barra */}
        <div className="absolute bottom-0 right-[15%] flex flex-col items-center">
            <div className="w-8 h-8 bg-[#080410] rounded-t-lg mb-[-1px]" />
            <div className="w-10 h-24 bg-[#080410]" />
            {/* Beacon Light */}
            <div className="absolute top-2 w-20 h-20 bg-axe-yellow rounded-full blur-2xl opacity-20 animate-pulse" />
        </div>

        {/* Generic Houses */}
        <div className="absolute bottom-0 left-0 w-full h-8 bg-[#05020a]" />
      </div>
      
      {/* --- GAME TRACK --- */}
      {/* Added items-end to ensure track stays at the bottom on all screens */}
      <div className="absolute inset-0 flex justify-center items-end perspective-container overflow-hidden z-10">
        
        {/* Fretboard Container */}
        {/* Changed height logic and origin to fix desktop visibility */}
        <div className={`
          fretboard relative w-full max-w-lg 
          h-[120vh] origin-bottom
          bg-gradient-to-b from-transparent to-black/20
          ${boardBorderClass}
          transition-all duration-500
        `}>
          
          {/* Lanes - The Ribbons */}
          <div className="absolute inset-0 flex justify-between px-6 lg:px-10 pt-24">
             <Lane color={LaneColor.GREEN} active={activeLanes[0]} hotkey={LANE_KEYS[0]} />
             <Lane color={LaneColor.RED} active={activeLanes[1]} hotkey={LANE_KEYS[1]} />
             <Lane color={LaneColor.BLUE} active={activeLanes[2]} hotkey={LANE_KEYS[2]} />
             <Lane color={LaneColor.YELLOW} active={activeLanes[3]} hotkey={LANE_KEYS[3]} />
          </div>

          {/* Notes */}
          {gameStatus === 'playing' && (
             <NoteRenderer notes={notesRef.current} songTime={currentSongTime} />
          )}
        </div>
      </div>

      {/* --- UI & OVERLAYS --- */}
      
      {/* Feedback Overlay */}
      {gameStatus === 'playing' && feedback && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none top-[-150px]">
             <div className={`
                text-5xl md:text-8xl font-black italic tracking-tighter 
                drop-shadow-[0_5px_0_rgba(0,0,0,1)]
                stroke-black stroke-2
                transition-transform duration-75 
                ${feedback.color} ${feedback.scale}
             `} style={{ textShadow: '0 0 20px currentColor' }}>
                {feedback.text}
             </div>
        </div>
      )}

      {/* Confetti Layer */}
      {confetti.map(p => (
        <ConfettiParticle 
          key={p.id} 
          color={p.color} 
          style={{ left: p.left, top: '40%' }} 
        />
      ))}

      {gameStatus === 'playing' && <ScoreBoard scoreState={scoreState} />}
      
      {gameStatus === 'menu' && (
        <Menu 
          onStart={startGame} 
          highScore={highScore} 
          wsUrl={wsUrl}
          onWsUrlChange={setWsUrl}
          isGuitarConnected={isGuitarConnected}
        />
      )}

      {gameStatus === 'ended' && (
        <Results 
            scoreState={scoreState} 
            onRestart={startGame} 
            isHighScore={highScore ? scoreState.currentScore > highScore.score : true}
            onSaveScore={saveHighScore}
            onMenu={quitGame}
        />
      )}
    </div>
  );
};

export default App;