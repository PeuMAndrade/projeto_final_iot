import React, { useState } from 'react';
import { ScoreState, HighScoreEntry } from '../types';

interface ResultsProps {
  scoreState: ScoreState;
  onRestart: () => void;
  isHighScore: boolean;
  onSaveScore: (name: string) => void;
  onMenu: () => void;
}

const Results: React.FC<ResultsProps> = ({ scoreState, onRestart, isHighScore, onSaveScore, onMenu }) => {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (name.trim()) {
      onSaveScore(name);
      setSaved(true);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="bg-gradient-to-b from-gray-800 to-black p-6 md:p-8 rounded-2xl border-2 border-axe-pink shadow-2xl text-center max-w-lg w-[90%] md:w-full">
        <h2 className="text-3xl md:text-5xl font-black text-white mb-2 uppercase italic">
            {isHighScore ? "Brocou Tudo!" : "O Trio Parou!"}
        </h2>
        
        <div className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-axe-yellow to-axe-orange mb-6 md:mb-8">
          {scoreState.currentScore.toLocaleString()}
        </div>

        <div className="grid grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-8 text-white/80">
          <div className="bg-white/5 p-2 rounded">
            <div className="text-axe-green font-bold text-lg md:text-xl">{scoreState.hits.perfect}</div>
            <div className="text-[10px] md:text-xs uppercase font-bold text-axe-green">Brocou!</div>
          </div>
          <div className="bg-white/5 p-2 rounded">
            <div className="text-axe-blue font-bold text-lg md:text-xl">{scoreState.hits.good}</div>
            <div className="text-[10px] md:text-xs uppercase font-bold text-axe-blue">Massa</div>
          </div>
          <div className="bg-white/5 p-2 rounded">
            <div className="text-red-500 font-bold text-lg md:text-xl">{scoreState.hits.miss}</div>
            <div className="text-[10px] md:text-xs uppercase font-bold text-red-500">Vacilou, pae</div>
          </div>
        </div>

        {isHighScore && !saved ? (
          <div className="mb-6 animate-pulse-fast bg-axe-pink/20 p-4 rounded-lg border border-axe-pink">
            <p className="text-white mb-2 font-bold text-sm md:text-base">Diz aí seu nome, pae:</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value.toUpperCase())}
                maxLength={10}
                className="flex-1 bg-black border border-white/50 text-white px-2 py-2 rounded text-center font-mono uppercase text-lg md:text-xl"
                placeholder="SEU NOME"
              />
              <button 
                onClick={handleSave}
                disabled={!name}
                className="bg-axe-green text-black font-bold px-2 py-2 rounded hover:bg-white disabled:opacity-50 text-sm md:text-base"
              >
                GRAVAR
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={onRestart}
              className="w-full py-3 bg-white text-black font-black text-lg md:text-xl uppercase rounded hover:bg-axe-yellow transition-colors shadow-lg"
            >
              Puxar o Trio de Novo
            </button>
            <button 
              onClick={onMenu}
              className="w-full py-3 bg-transparent border-2 border-white/30 text-white font-bold text-lg md:text-xl uppercase rounded hover:bg-white/10 hover:border-white transition-colors"
            >
              Voltar pro Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Results;