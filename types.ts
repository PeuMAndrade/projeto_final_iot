export enum LaneColor {
  GREEN = 'verde',
  RED = 'vermelha',
  BLUE = 'azul',
  YELLOW = 'amarela'
}

export interface Note {
  id: number;
  lane: 0 | 1 | 2 | 3; // 0: Green, 1: Red, 2: Blue, 3: Yellow
  time: number; // Time in milliseconds when the note should be hit
  hit: boolean;
  missed: boolean;
}

export interface GameConfig {
  trackSpeed: number; // Speed multiplier
  hitWindow: number; // Ms window for a valid hit
  songDuration: number;
}

export interface ScoreState {
  currentScore: number;
  multiplier: number;
  streak: number;
  hits: {
    perfect: number;
    good: number;
    miss: number;
  };
}

export interface WebSocketMessage {
  botao: string; // "verde", "vermelha", "azul", "amarela"
  estado: string; // "pressionado", "solto"
  timestamp: number;
}

export interface HighScoreEntry {
  name: string;
  score: number;
}