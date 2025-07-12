import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const PlayerCreation = () => {
  const { createPlayer, state } = useGame();
  const [playerName, setPlayerName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePlayer = async () => {
    if (!playerName.trim()) return;
    
    setIsCreating(true);
    try {
      await createPlayer(playerName.trim());
    } catch (error) {
      console.error('Error creating player:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreatePlayer();
    }
  };

  return (
    <div className="fixed inset-0 bg-game-bg flex items-center justify-center">
      <div className="bg-game-ui p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-eco-green mb-2">
            GTA Bicycle Game
          </h1>
          <p className="text-gray-300">
            Save the city with eco-friendly transportation!
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-white text-sm font-bold mb-2">
              Enter Your Eco-Warrior Name:
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Your name here..."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg 
                         border border-gray-600 focus:border-eco-green focus:outline-none
                         font-mono"
              maxLength={20}
              disabled={isCreating}
            />
          </div>

          <button
            onClick={handleCreatePlayer}
            disabled={!playerName.trim() || isCreating}
            className={`w-full py-3 px-6 rounded-lg font-bold text-lg transition-all
              ${!playerName.trim() || isCreating
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-eco-green text-white hover:bg-green-600 hover:scale-105'
              }`}
          >
            {isCreating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Character...
              </div>
            ) : (
              'Start Your Eco Adventure!'
            )}
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="text-gray-400 text-sm mb-4">Game Features:</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="flex items-center">
              <span className="text-eco-green mr-2">🚴</span>
              <span>Bicycle Riding</span>
            </div>
            <div className="flex items-center">
              <span className="text-eco-green mr-2">🏪</span>
              <span>Eco-Friendly Shops</span>
            </div>
            <div className="flex items-center">
              <span className="text-eco-green mr-2">♻️</span>
              <span>Recycling Missions</span>
            </div>
            <div className="flex items-center">
              <span className="text-eco-green mr-2">🌱</span>
              <span>Pollution Control</span>
            </div>
          </div>
        </div>

        {state.error && (
          <div className="mt-4 p-3 bg-red-600 text-white rounded-lg text-sm">
            Error: {state.error}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerCreation;