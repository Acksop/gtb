import React, { useRef, useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { PixelRenderer } from '../game/PixelRenderer';
import { GameWorld } from '../game/GameWorld';
import { InputHandler } from '../game/InputHandler';
import { CollisionSystem } from '../game/CollisionSystem';

const GameCanvas = () => {
  const canvasRef = useRef(null);
  const { state, dispatch, updatePlayerPosition, addNotification } = useGame();
  const [gameEngine, setGameEngine] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || !state.player) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Initialize game engine components
    const renderer = new PixelRenderer(ctx, canvas.width, canvas.height);
    const gameWorld = new GameWorld(state.gameWorld.worldSize.width, state.gameWorld.worldSize.height);
    const inputHandler = new InputHandler();
    const collisionSystem = new CollisionSystem();
    
    // Initialize game entities
    gameWorld.initializeWorld();
    
    // Game state
    let player = {
      x: state.player.position.x,
      y: state.player.position.y,
      width: 16,
      height: 16,
      speed: 2,
      direction: 0, // 0: up, 1: right, 2: down, 3: left
      isMoving: false,
      health: state.player.health,
      stamina: state.player.stamina,
      bicycle: state.bicycles.find(b => b.id === state.player.bicycle_id) || state.bicycles[0]
    };
    
    let camera = {
      x: player.x - canvas.width / 2,
      y: player.y - canvas.height / 2
    };
    
    let lastPositionUpdate = Date.now();
    
    // Game loop
    const gameLoop = () => {
      // Handle input
      const keys = inputHandler.getKeys();
      dispatch({ type: 'SET_KEYS', payload: keys });
      
      // Update player movement
      let newX = player.x;
      let newY = player.y;
      let moving = false;
      
      const speed = player.bicycle ? player.bicycle.speed * 0.3 : player.speed;
      const sprintMultiplier = (keys['ShiftLeft'] || keys['ShiftRight']) ? 2.0 : 1.0;
      const finalSpeed = speed * sprintMultiplier;
      
      if (keys['ArrowUp'] || keys['KeyW']) {
        newY -= finalSpeed;
        player.direction = 0;
        moving = true;
      }
      if (keys['ArrowDown'] || keys['KeyS']) {
        newY += finalSpeed;
        player.direction = 2;
        moving = true;
      }
      if (keys['ArrowLeft'] || keys['KeyA']) {
        newX -= finalSpeed;
        player.direction = 3;
        moving = true;
      }
      if (keys['ArrowRight'] || keys['KeyD']) {
        newX += finalSpeed;
        player.direction = 1;
        moving = true;
      }
      
      player.isMoving = moving;
      
      // Collision detection
      const playerRect = { x: newX, y: newY, width: player.width, height: player.height };
      const canMove = collisionSystem.checkWorldBounds(playerRect, gameWorld) && 
                     collisionSystem.checkBuildingCollisions(playerRect, gameWorld.buildings);
      
      if (canMove) {
        player.x = newX;
        player.y = newY;
      }
      
      // Update camera to follow player
      camera.x = player.x - canvas.width / 2;
      camera.y = player.y - canvas.height / 2;
      
      // Clamp camera to world bounds
      camera.x = Math.max(0, Math.min(camera.x, gameWorld.width - canvas.width));
      camera.y = Math.max(0, Math.min(camera.y, gameWorld.height - canvas.height));
      
      dispatch({ type: 'UPDATE_CAMERA', payload: camera });
      
      // Update player position in backend (throttled)
      const now = Date.now();
      if (now - lastPositionUpdate > 1000) { // Update every second
        updatePlayerPosition(player.x, player.y);
        lastPositionUpdate = now;
      }
      
      // Check for shop interactions
      if (keys['KeyE']) {
        const nearbyShop = gameWorld.shops.find(shop => {
          const distance = Math.sqrt(
            Math.pow(player.x - shop.x, 2) + Math.pow(player.y - shop.y, 2)
          );
          return distance < 50;
        });
        
        if (nearbyShop) {
          dispatch({ type: 'SHOW_SHOP_PROMPT', payload: nearbyShop });
        }
      }
      
      // Check for mission interactions
      if (keys['KeyF']) {
        const nearbyMission = gameWorld.missions.find(mission => {
          const distance = Math.sqrt(
            Math.pow(player.x - mission.x, 2) + Math.pow(player.y - mission.y, 2)
          );
          return distance < 50;
        });
        
        if (nearbyMission) {
          dispatch({ type: 'SHOW_MISSION_PROMPT', payload: nearbyMission });
        }
      }
      
      // Update game world
      gameWorld.update();
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Render game
      renderer.renderWorld(gameWorld, camera);
      renderer.renderPlayer(player, camera);
      renderer.renderUI(player, state.ui);
      
      requestAnimationFrame(gameLoop);
    };
    
    // Start game loop
    gameLoop();
    
    // Setup input handlers
    inputHandler.setupEventListeners();
    
    // Store game engine reference
    setGameEngine({
      renderer,
      gameWorld,
      inputHandler,
      collisionSystem,
      player,
      camera
    });
    
    // Cleanup
    return () => {
      inputHandler.cleanup();
    };
  }, [state.player, state.bicycles, state.gameWorld.shops, state.gameWorld.missions]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!state.player) {
    return (
      <div className="flex items-center justify-center h-screen bg-game-bg">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-eco-green">Creating your eco-warrior...</h2>
          <div className="w-16 h-16 border-4 border-eco-green border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        className="block"
        style={{
          width: '100vw',
          height: '100vh',
          background: '#2d5a27' // Forest green background
        }}
      />
      
      {/* Game Controls Info */}
      <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
        <div className="text-sm font-mono">
          <div>WASD / Arrow Keys: Move</div>
          <div>Hold Shift: Sprint (2x speed)</div>
          <div>E: Enter Shop</div>
          <div>F: Start Mission</div>
          <div>ESC: Menu</div>
        </div>
      </div>
    </div>
  );
};

export default GameCanvas;