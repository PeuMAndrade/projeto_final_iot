import React, { useState, useEffect } from 'react';
import { HighScoreEntry } from '../types';

interface MenuProps {
  onStart: () => void;
  highScore: HighScoreEntry | null;
  wsUrl: string;
  onWsUrlChange: (url: string) => void;
  isGuitarConnected: boolean;
}

const Menu: React.FC<MenuProps> = ({ onStart, highScore, wsUrl, onWsUrlChange, isGuitarConnected }) => {
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-axe-pink to-axe-orange">
      <div className="bg-black/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl border-4 border-axe-yellow shadow-[0_0_50px_rgba(255,215,0,0.5)] text-center max-w-md w-[90%] md:w-full">
        
        <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-axe-green via-axe-yellow to-axe-blue mb-2 animate-pulse font-display italic tracking-tighter">
          AXÉ HERO
        </h1>
        <p className="text-white text-base md:text-lg mb-6 md:mb-8 font-light tracking-widest uppercase">No Ritmo do Pelô</p>

        {highScore && (
          <div className="mb-6 md:mb-8 bg-white/10 p-3 md:p-4 rounded-xl border border-white/20">
            <h3 className="text-axe-yellow text-xs md:text-sm uppercase tracking-widest mb-1">Maior Axé da História</h3>
            <div className="text-xl md:text-3xl font-bold text-white">{highScore.name}</div>
            <div className="text-lg md:text-xl text-axe-green">{highScore.score.toLocaleString()} de Energia</div>
          </div>
        )}

        <button 
          onClick={onStart}
          className="w-full py-3 md:py-4 bg-gradient-to-r from-axe-green to-teal-600 hover:from-axe-yellow hover:to-orange-500 text-black font-black text-xl md:text-2xl uppercase tracking-wider rounded-xl transition-all transform hover:scale-105 shadow-lg mb-4"
        >
          Tocar o Trio
        </button>

        {/* Guitar Status Indicator */}
        <div className="flex items-center justify-center gap-2 mb-2">
            <div className={`w-3 h-3 rounded-full transition-all duration-300 ${isGuitarConnected ? 'bg-axe-green shadow-[0_0_8px_#00FF00]' : 'bg-red-500/50'}`} />
            <span className={`text-xs ${isGuitarConnected ? 'text-axe-green' : 'text-white/40'}`}>
                {isGuitarConnected ? 'Guitarra Conectada' : 'Guitarra Offline'}
            </span>
        </div>

        <button 
          onClick={() => setShowConfig(!showConfig)}
          className="text-white/60 text-xs md:text-sm hover:text-white underline mb-4"
        >
          {showConfig ? 'Fechar Configurações' : 'Configurar Guitarra (WiFi)'}
        </button>

        {showConfig && (
          <div className="bg-black/50 p-4 rounded-lg text-left">
            <label className="text-xs text-gray-400 block mb-1">Endereço WebSocket do Microcontrolador:</label>
            <input 
              type="text" 
              value={wsUrl}
              onChange={(e) => onWsUrlChange(e.target.value)}
              className="w-full bg-gray-900 text-white border border-gray-700 rounded px-2 py-1 text-sm mb-2"
              placeholder="ws://192.168.x.x:8080"
            />
            <p className="text-[10px] text-gray-400">
              Protocolo JSON esperado:<br/>
              <code>{`{ "botao": "verde", "estado": "pressionado" }`}</code>
            </p>
          </div>
        )}

        <div className="mt-6 text-[10px] md:text-xs text-white/40">
          <p>Controles: Teclado (A, S, D, F) | ESC para Sair | Guitarra WiFi</p>
        </div>
      </div>
    </div>
  );
};

export default Menu;