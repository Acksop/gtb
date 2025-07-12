import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const GameContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const initialState = {
  player: null,
  playerId: null,
  gameStarted: false,
  currentScreen: 'menu', // 'menu', 'game', 'shop', 'mission'
  gameWorld: {
    camera: { x: 0, y: 0 },
    worldSize: { width: 1200, height: 800 },
    pollution: { level: 50, locations: [] },
    traffic: [],
    npcs: [],
    shops: [],
    missions: [],
    recyclableItems: []
  },
  ui: {
    showShopPrompt: false,
    showMissionPrompt: false,
    selectedShop: null,
    currentMission: null,
    notifications: []
  },
  bicycles: [],
  gameTime: 0,
  keys: {},
  loading: false,
  error: null
};

function gameReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_PLAYER':
      return { ...state, player: action.payload };
    
    case 'SET_PLAYER_ID':
      return { ...state, playerId: action.payload };
    
    case 'START_GAME':
      return { ...state, gameStarted: true, currentScreen: 'game' };
    
    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload };
    
    case 'UPDATE_PLAYER_POSITION':
      return {
        ...state,
        player: {
          ...state.player,
          position: action.payload
        }
      };
    
    case 'UPDATE_CAMERA':
      return {
        ...state,
        gameWorld: {
          ...state.gameWorld,
          camera: action.payload
        }
      };
    
    case 'SET_KEYS':
      return { ...state, keys: action.payload };
    
    case 'SET_BICYCLES':
      return { ...state, bicycles: action.payload };
    
    case 'SET_SHOPS':
      return {
        ...state,
        gameWorld: {
          ...state.gameWorld,
          shops: action.payload
        }
      };
    
    case 'SET_MISSIONS':
      return {
        ...state,
        gameWorld: {
          ...state.gameWorld,
          missions: action.payload
        }
      };
    
    case 'SHOW_SHOP_PROMPT':
      return {
        ...state,
        ui: {
          ...state.ui,
          showShopPrompt: true,
          selectedShop: action.payload
        }
      };
    
    case 'HIDE_SHOP_PROMPT':
      return {
        ...state,
        ui: {
          ...state.ui,
          showShopPrompt: false,
          selectedShop: null
        }
      };
    
    case 'SHOW_MISSION_PROMPT':
      return {
        ...state,
        ui: {
          ...state.ui,
          showMissionPrompt: true,
          currentMission: action.payload
        }
      };
    
    case 'HIDE_MISSION_PROMPT':
      return {
        ...state,
        ui: {
          ...state.ui,
          showMissionPrompt: false,
          currentMission: null
        }
      };
    
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: [...state.ui.notifications, action.payload]
        }
      };
    
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        ui: {
          ...state.ui,
          notifications: state.ui.notifications.filter(n => n.id !== action.payload)
        }
      };
    
    case 'UPDATE_GAME_TIME':
      return { ...state, gameTime: action.payload };
    
    case 'SPAWN_TRAFFIC':
      return {
        ...state,
        gameWorld: {
          ...state.gameWorld,
          traffic: action.payload
        }
      };
    
    case 'SPAWN_NPCS':
      return {
        ...state,
        gameWorld: {
          ...state.gameWorld,
          npcs: action.payload
        }
      };
    
    case 'SPAWN_RECYCLABLES':
      return {
        ...state,
        gameWorld: {
          ...state.gameWorld,
          recyclableItems: action.payload
        }
      };
    
    case 'UPDATE_POLLUTION':
      return {
        ...state,
        gameWorld: {
          ...state.gameWorld,
          pollution: action.payload
        }
      };
    
    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // API Functions
  const createPlayer = async (name) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await axios.post(`${BACKEND_URL}/api/player/create`, null, {
        params: { name }
      });
      dispatch({ type: 'SET_PLAYER_ID', payload: response.data.player_id });
      await loadPlayer(response.data.player_id);
      return response.data.player_id;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadPlayer = async (playerId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/player/${playerId}`);
      dispatch({ type: 'SET_PLAYER', payload: response.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updatePlayerPosition = async (x, y) => {
    if (!state.playerId) return;
    
    try {
      await axios.put(`${BACKEND_URL}/api/player/${state.playerId}/position`, null, {
        params: { x, y }
      });
      dispatch({ type: 'UPDATE_PLAYER_POSITION', payload: { x, y } });
    } catch (error) {
      console.error('Error updating player position:', error);
    }
  };

  const loadGameData = async () => {
    try {
      const [bicyclesRes, shopsRes, missionsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/bicycles`),
        axios.get(`${BACKEND_URL}/api/shops`),
        axios.get(`${BACKEND_URL}/api/missions`)
      ]);
      
      dispatch({ type: 'SET_BICYCLES', payload: bicyclesRes.data });
      dispatch({ type: 'SET_SHOPS', payload: shopsRes.data });
      dispatch({ type: 'SET_MISSIONS', payload: missionsRes.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const purchaseBicycle = async (bicycleId) => {
    if (!state.playerId) return;
    
    try {
      await axios.post(`${BACKEND_URL}/api/player/${state.playerId}/purchase_bicycle`, null, {
        params: { bicycle_id: bicycleId }
      });
      await loadPlayer(state.playerId);
      addNotification('Bicycle purchased successfully!', 'success');
    } catch (error) {
      addNotification(error.response?.data?.detail || 'Purchase failed', 'error');
    }
  };

  const startMission = async (missionId) => {
    if (!state.playerId) return;
    
    try {
      await axios.post(`${BACKEND_URL}/api/player/${state.playerId}/mission/start`, null, {
        params: { mission_id: missionId }
      });
      await loadPlayer(state.playerId);
      addNotification('Mission started!', 'success');
    } catch (error) {
      addNotification(error.response?.data?.detail || 'Mission start failed', 'error');
    }
  };

  const completeMission = async (missionId) => {
    if (!state.playerId) return;
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/player/${state.playerId}/mission/complete`, null, {
        params: { mission_id: missionId }
      });
      await loadPlayer(state.playerId);
      await loadGameData();
      addNotification(`Mission completed! +${response.data.rewards.eco_points} eco points`, 'success');
    } catch (error) {
      addNotification(error.response?.data?.detail || 'Mission completion failed', 'error');
    }
  };

  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now()
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    
    // Auto-remove notification after 3 seconds
    setTimeout(() => {
      dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
    }, 3000);
  };

  // Initialize game data
  useEffect(() => {
    loadGameData();
  }, []);

  const value = {
    state,
    dispatch,
    createPlayer,
    loadPlayer,
    updatePlayerPosition,
    loadGameData,
    purchaseBicycle,
    startMission,
    completeMission,
    addNotification
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};