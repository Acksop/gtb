import React from 'react';
import { useGame } from '../context/GameContext';

const GameMenu = ({ onClose }) => {
  const { state, dispatch } = useGame();

  const handleResumeGame = () => {
    dispatch({ type: 'SET_SCREEN', payload: 'game' });
    onClose();
  };

  const handleSettings = () => {
    // TODO: Implement settings menu
    console.log('Settings menu not implemented yet');
  };

  const handleQuitGame = () => {
    // TODO: Implement quit game functionality
    console.log('Quit game not implemented yet');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-game-ui p-8 rounded-lg shadow-2xl max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-eco-green mb-2">
            Game Menu
          </h2>
          <p className="text-gray-300">
            {state.player?.name}'s Eco Adventure
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleResumeGame}
            className="w-full py-3 px-6 bg-eco-green text-white rounded-lg font-bold
                       hover:bg-green-600 transition-colors"
          >
            Resume Game
          </button>

          <button
            onClick={handleSettings}
            className="w-full py-3 px-6 bg-gray-600 text-white rounded-lg font-bold
                       hover:bg-gray-700 transition-colors"
          >
            Settings
          </button>

          <button
            onClick={handleQuitGame}
            className="w-full py-3 px-6 bg-red-600 text-white rounded-lg font-bold
                       hover:bg-red-700 transition-colors"
          >
            Quit Game
          </button>
        </div>

        <div className="mt-8 text-center">
          <div className="text-gray-400 text-sm mb-4">Game Stats:</div>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="text-center">
              <div className="text-eco-green font-bold">{state.player?.eco_points || 0}</div>
              <div>Eco Points</div>
            </div>
            <div className="text-center">
              <div className="text-warning-yellow font-bold">${state.player?.money || 0}</div>
              <div>Money</div>
            </div>
            <div className="text-center">
              <div className="text-blue-400 font-bold">{state.player?.completed_missions?.length || 0}</div>
              <div>Missions</div>
            </div>
            <div className="text-center">
              <div className="text-purple-400 font-bold">{state.player?.health || 0}%</div>
              <div>Health</div>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-gray-500 text-xs">
            Press ESC to resume game
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;