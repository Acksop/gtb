import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import PlayerCreation from './PlayerCreation';
import GameMenu from './GameMenu';
import ShopInterface from './ShopInterface';
import MissionInterface from './MissionInterface';

const UI = () => {
  const { state } = useGame();
  const [showMenu, setShowMenu] = useState(false);

  // Show player creation if no player exists
  if (!state.player) {
    return <PlayerCreation />;
  }

  // Show game menu if ESC is pressed
  if (showMenu || state.currentScreen === 'menu') {
    return <GameMenu onClose={() => setShowMenu(false)} />;
  }

  // Show shop interface if in shop
  if (state.currentScreen === 'shop' || state.ui.showShopPrompt) {
    return <ShopInterface />;
  }

  // Show mission interface if in mission
  if (state.currentScreen === 'mission' || state.ui.showMissionPrompt) {
    return <MissionInterface />;
  }

  return (
    <div className="game-ui">
      {/* Game HUD */}
      <GameHUD />
      
      {/* Notifications */}
      <NotificationSystem />
      
      {/* Interaction Prompts */}
      <InteractionPrompts />
      
      {/* Mini Map */}
      <MiniMap />
    </div>
  );
};

// Game HUD Component
const GameHUD = () => {
  const { state } = useGame();
  const { player } = state;

  if (!player) return null;

  const currentBicycle = state.bicycles.find(b => b.id === player.bicycle_id);

  return (
    <div className="absolute top-4 left-4 space-y-2">
      {/* Player Stats */}
      <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg">
        <div className="text-sm font-mono space-y-1">
          <div className="flex items-center justify-between">
            <span>Health:</span>
            <div className="w-24 h-2 bg-gray-600 rounded">
              <div 
                className="health-bar h-full rounded"
                style={{ width: `${player.health}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Stamina:</span>
            <div className="w-24 h-2 bg-gray-600 rounded">
              <div 
                className="stamina-bar h-full rounded"
                style={{ width: `${player.stamina}%` }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Eco Points:</span>
            <span className="text-eco-green">{player.eco_points}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Money:</span>
            <span className="text-warning-yellow">${player.money}</span>
          </div>
        </div>
      </div>

      {/* Bicycle Info */}
      {currentBicycle && (
        <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg">
          <div className="text-sm font-mono space-y-1">
            <div className="font-bold text-eco-green">{currentBicycle.name}</div>
            <div>Speed: {currentBicycle.speed}</div>
            <div>Durability: {currentBicycle.durability}</div>
            <div>Eco: {Math.round(currentBicycle.eco_efficiency * 100)}%</div>
          </div>
        </div>
      )}

      {/* Current Mission */}
      {player.current_mission && (
        <div className="bg-black bg-opacity-70 text-white p-3 rounded-lg">
          <div className="text-sm font-mono">
            <div className="font-bold text-warning-yellow">Active Mission</div>
            <div>{player.current_mission}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Notification System Component
const NotificationSystem = () => {
  const { state } = useGame();
  const { notifications } = state.ui;

  return (
    <div className="absolute top-4 right-4 space-y-2">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-3 rounded-lg text-white font-mono text-sm max-w-xs
            ${notification.type === 'error' ? 'bg-red-600' : 
              notification.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}
        >
          {notification.message}
        </div>
      ))}
    </div>
  );
};

// Interaction Prompts Component
const InteractionPrompts = () => {
  const { state } = useGame();

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
      {/* Shop Prompt */}
      {state.ui.showShopPrompt && (
        <div className="shop-prompt text-white text-center">
          <div className="font-bold text-lg">{state.ui.selectedShop?.name}</div>
          <div className="text-sm">Press E to enter shop</div>
          <div className="text-xs text-gray-400">Press ESC to cancel</div>
        </div>
      )}

      {/* Mission Prompt */}
      {state.ui.showMissionPrompt && (
        <div className="shop-prompt text-white text-center">
          <div className="font-bold text-lg">{state.ui.currentMission?.name}</div>
          <div className="text-sm">Press F to start mission</div>
          <div className="text-xs text-gray-400">Press ESC to cancel</div>
        </div>
      )}
    </div>
  );
};

// Mini Map Component
const MiniMap = () => {
  const { state } = useGame();
  const { player, gameWorld } = state;

  if (!player) return null;

  const mapScale = 0.1;
  const mapWidth = gameWorld.worldSize.width * mapScale;
  const mapHeight = gameWorld.worldSize.height * mapScale;
  const playerX = player.position.x * mapScale;
  const playerY = player.position.y * mapScale;

  return (
    <div className="absolute top-4 right-4 bg-black bg-opacity-70 p-2 rounded-lg">
      <div className="text-white text-xs font-mono mb-1">Mini Map</div>
      <div 
        className="relative bg-gray-800 border"
        style={{ width: `${mapWidth}px`, height: `${mapHeight}px` }}
      >
        {/* Player dot */}
        <div
          className="absolute w-2 h-2 bg-red-500 rounded-full"
          style={{
            left: `${playerX - 1}px`,
            top: `${playerY - 1}px`
          }}
        />
        
        {/* Shop markers */}
        {gameWorld.shops.map((shop) => (
          <div
            key={shop.id}
            className="absolute w-1 h-1 bg-green-500 rounded-full"
            style={{
              left: `${shop.position.x * mapScale}px`,
              top: `${shop.position.y * mapScale}px`
            }}
          />
        ))}
        
        {/* Mission markers */}
        {gameWorld.missions.map((mission) => (
          <div
            key={mission.id}
            className="absolute w-1 h-1 bg-yellow-500 rounded-full"
            style={{
              left: `${mission.objectives?.location?.x * mapScale || 0}px`,
              top: `${mission.objectives?.location?.y * mapScale || 0}px`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default UI;