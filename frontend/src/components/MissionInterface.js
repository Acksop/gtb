import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const MissionInterface = () => {
  const { state, dispatch, startMission, completeMission } = useGame();
  const [selectedMission, setSelectedMission] = useState(null);

  const handleClose = () => {
    dispatch({ type: 'HIDE_MISSION_PROMPT' });
    dispatch({ type: 'SET_SCREEN', payload: 'game' });
  };

  const handleStartMission = async (mission) => {
    await startMission(mission.id);
    handleClose();
  };

  const handleCompleteMission = async (mission) => {
    await completeMission(mission.id);
    handleClose();
  };

  const missions = state.gameWorld.missions || [];
  const currentMission = state.ui.currentMission;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-game-ui p-6 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-warning-yellow">Eco Missions</h2>
            <p className="text-gray-300">Help save the city's environment!</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Mission List */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Available Missions</h3>
            <div className="space-y-3">
              {missions.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  isSelected={selectedMission?.id === mission.id}
                  onClick={() => setSelectedMission(mission)}
                  onStart={() => handleStartMission(mission)}
                  onComplete={() => handleCompleteMission(mission)}
                  isCurrentMission={state.player?.current_mission === mission.id}
                />
              ))}
            </div>
          </div>

          {/* Mission Details */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Mission Details</h3>
            {selectedMission ? (
              <MissionDetails mission={selectedMission} />
            ) : (
              <div className="bg-gray-700 p-6 rounded-lg text-center">
                <p className="text-gray-400">Select a mission to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* Current Mission Progress */}
        {state.player?.current_mission && (
          <div className="mt-6 bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-warning-yellow mb-2">Current Mission Progress</h3>
            <CurrentMissionProgress 
              mission={missions.find(m => m.id === state.player.current_mission)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const MissionCard = ({ mission, isSelected, onClick, onStart, onComplete, isCurrentMission }) => {
  const getMissionIcon = (type) => {
    switch (type) {
      case 'pollution_cleanup': return '🧹';
      case 'recycling': return '♻️';
      case 'renewable_energy': return '☀️';
      default: return '🌱';
    }
  };

  const getMissionTypeColor = (type) => {
    switch (type) {
      case 'pollution_cleanup': return 'text-red-400';
      case 'recycling': return 'text-blue-400';
      case 'renewable_energy': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-eco-green bg-opacity-20 border border-eco-green'
          : 'bg-gray-700 hover:bg-gray-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{getMissionIcon(mission.type)}</span>
          <div>
            <h4 className="font-bold text-white">{mission.name}</h4>
            <p className={`text-sm capitalize ${getMissionTypeColor(mission.type)}`}>
              {mission.type.replace('_', ' ')}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          {mission.completed ? (
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">
              Completed
            </span>
          ) : isCurrentMission ? (
            <span className="bg-warning-yellow text-black px-2 py-1 rounded text-xs">
              Active
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              className="bg-eco-green text-white px-3 py-1 rounded text-sm hover:bg-green-600"
            >
              Start
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-300">
        <div className="flex justify-between">
          <span>Reward: {mission.rewards?.eco_points || 0} eco points</span>
          <span>${mission.rewards?.money || 0}</span>
        </div>
      </div>
    </div>
  );
};

const MissionDetails = ({ mission }) => {
  const getObjectivesList = (objectives) => {
    const items = [];
    
    if (objectives.trash_required) {
      items.push(`Collect ${objectives.trash_required} pieces of trash`);
    }
    
    if (objectives.panels_required) {
      items.push(`Install ${objectives.panels_required} solar panels`);
    }
    
    if (objectives.items_required) {
      items.push(`Collect ${objectives.items_required} recyclable items`);
    }
    
    return items;
  };

  return (
    <div className="bg-gray-700 p-6 rounded-lg">
      <h4 className="text-xl font-bold text-white mb-4">{mission.name}</h4>
      
      <div className="space-y-4">
        <div>
          <h5 className="font-semibold text-gray-300 mb-2">Description</h5>
          <p className="text-gray-400">{mission.description}</p>
        </div>

        <div>
          <h5 className="font-semibold text-gray-300 mb-2">Objectives</h5>
          <ul className="text-gray-400 space-y-1">
            {getObjectivesList(mission.objectives || {}).map((objective, index) => (
              <li key={index} className="flex items-center">
                <span className="text-eco-green mr-2">•</span>
                {objective}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h5 className="font-semibold text-gray-300 mb-2">Rewards</h5>
          <div className="flex space-x-4">
            <div className="bg-eco-green bg-opacity-20 p-2 rounded">
              <div className="text-eco-green font-bold">{mission.rewards?.eco_points || 0}</div>
              <div className="text-xs text-gray-400">Eco Points</div>
            </div>
            <div className="bg-warning-yellow bg-opacity-20 p-2 rounded">
              <div className="text-warning-yellow font-bold">${mission.rewards?.money || 0}</div>
              <div className="text-xs text-gray-400">Money</div>
            </div>
          </div>
        </div>

        <div>
          <h5 className="font-semibold text-gray-300 mb-2">Environmental Impact</h5>
          <div className="bg-eco-green bg-opacity-10 p-3 rounded">
            <p className="text-eco-green text-sm">
              {mission.type === 'pollution_cleanup' && 
                "Reduces city pollution and improves air quality for everyone!"}
              {mission.type === 'recycling' && 
                "Helps reduce waste and promotes circular economy principles!"}
              {mission.type === 'renewable_energy' && 
                "Increases clean energy production and reduces carbon footprint!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CurrentMissionProgress = ({ mission }) => {
  if (!mission) return null;

  const getProgressPercentage = () => {
    const objectives = mission.objectives || {};
    
    if (objectives.trash_required) {
      return Math.round((objectives.trash_collected / objectives.trash_required) * 100);
    }
    
    if (objectives.panels_required) {
      return Math.round((objectives.panels_installed / objectives.panels_required) * 100);
    }
    
    if (objectives.items_required) {
      return Math.round((objectives.items_collected / objectives.items_required) * 100);
    }
    
    return 0;
  };

  const progress = getProgressPercentage();

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-semibold text-white">{mission.name}</span>
        <span className="text-sm text-gray-400">{progress}% Complete</span>
      </div>
      
      <div className="w-full bg-gray-600 rounded-full h-2">
        <div 
          className="bg-eco-green h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="mt-2 text-sm text-gray-400">
        {mission.objectives?.trash_required && (
          <span>Trash collected: {mission.objectives.trash_collected}/{mission.objectives.trash_required}</span>
        )}
        {mission.objectives?.panels_required && (
          <span>Solar panels installed: {mission.objectives.panels_installed}/{mission.objectives.panels_required}</span>
        )}
        {mission.objectives?.items_required && (
          <span>Items collected: {mission.objectives.items_collected}/{mission.objectives.items_required}</span>
        )}
      </div>
    </div>
  );
};

export default MissionInterface;