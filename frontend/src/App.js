import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import UI from './components/UI';
import { GameProvider } from './context/GameContext';
import './App.css';

function App() {
  const [gameInitialized, setGameInitialized] = useState(false);

  useEffect(() => {
    // Initialize game
    setGameInitialized(true);
  }, []);

  return (
    <GameProvider>
      <div className="App">
        {gameInitialized ? (
          <>
            <GameCanvas />
            <UI />
          </>
        ) : (
          <div className="flex items-center justify-center h-screen bg-game-bg">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 text-eco-green">GTA Bicycle Game</h1>
              <p className="text-lg">Loading eco-friendly adventure...</p>
            </div>
          </div>
        )}
      </div>
    </GameProvider>
  );
}

export default App;