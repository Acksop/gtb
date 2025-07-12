import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

const ShopInterface = () => {
  const { state, dispatch, purchaseBicycle, addNotification } = useGame();
  const [selectedTab, setSelectedTab] = useState('bicycles');
  const shop = state.ui.selectedShop;

  const handleClose = () => {
    dispatch({ type: 'HIDE_SHOP_PROMPT' });
    dispatch({ type: 'SET_SCREEN', payload: 'game' });
  };

  const handlePurchase = async (item) => {
    if (item.type === 'bicycle') {
      await purchaseBicycle(item.id);
    } else {
      // Handle other item purchases
      addNotification(`Purchased ${item.name}!`, 'success');
    }
  };

  if (!shop) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-game-ui p-6 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-eco-green">{shop.name}</h2>
            <p className="text-gray-300 capitalize">{shop.type.replace('_', ' ')}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-700 p-1 rounded-lg">
            <button
              onClick={() => setSelectedTab('bicycles')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedTab === 'bicycles'
                  ? 'bg-eco-green text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Bicycles
            </button>
            <button
              onClick={() => setSelectedTab('parts')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedTab === 'parts'
                  ? 'bg-eco-green text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Parts & Repairs
            </button>
            <button
              onClick={() => setSelectedTab('eco-items')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedTab === 'eco-items'
                  ? 'bg-eco-green text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Eco Items
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedTab === 'bicycles' && (
            <BicycleGrid 
              bicycles={state.bicycles} 
              currentBicycle={state.player?.bicycle_id}
              onPurchase={handlePurchase}
              playerMoney={state.player?.money || 0}
            />
          )}
          
          {selectedTab === 'parts' && (
            <PartsGrid 
              shop={shop}
              onPurchase={handlePurchase}
              playerMoney={state.player?.money || 0}
            />
          )}
          
          {selectedTab === 'eco-items' && (
            <EcoItemsGrid 
              shop={shop}
              onPurchase={handlePurchase}
              playerMoney={state.player?.money || 0}
            />
          )}
        </div>

        <div className="mt-6 text-center">
          <div className="text-gray-400 text-sm">
            Your Money: <span className="text-warning-yellow font-bold">${state.player?.money || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const BicycleGrid = ({ bicycles, currentBicycle, onPurchase, playerMoney }) => {
  return (
    <>
      {bicycles.map((bicycle) => (
        <div key={bicycle.id} className="bg-gray-700 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-white">{bicycle.name}</h3>
            {currentBicycle === bicycle.id && (
              <span className="bg-eco-green text-white px-2 py-1 rounded text-xs">
                Current
              </span>
            )}
          </div>
          
          <div className="text-sm text-gray-300 space-y-1 mb-4">
            <div>Type: <span className="capitalize">{bicycle.type}</span></div>
            <div>Speed: {bicycle.speed}</div>
            <div>Durability: {bicycle.durability}</div>
            <div>Eco Efficiency: {Math.round(bicycle.eco_efficiency * 100)}%</div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-warning-yellow font-bold">${bicycle.price}</span>
            <button
              onClick={() => onPurchase({...bicycle, type: 'bicycle'})}
              disabled={playerMoney < bicycle.price || currentBicycle === bicycle.id}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                playerMoney < bicycle.price || currentBicycle === bicycle.id
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-eco-green text-white hover:bg-green-600'
              }`}
            >
              {currentBicycle === bicycle.id ? 'Owned' : 'Buy'}
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

const PartsGrid = ({ shop, onPurchase, playerMoney }) => {
  const parts = [
    { id: 'eco_tire', name: 'Eco-Friendly Tire', price: 50, eco_impact: 10 },
    { id: 'bamboo_frame', name: 'Bamboo Frame', price: 200, eco_impact: 50 },
    { id: 'solar_light', name: 'Solar LED Light', price: 30, eco_impact: 15 },
    { id: 'recycled_seat', name: 'Recycled Seat', price: 80, eco_impact: 25 },
    { id: 'bio_chain', name: 'Bio Chain Lubricant', price: 25, eco_impact: 12 }
  ];

  return (
    <>
      {parts.map((part) => (
        <div key={part.id} className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">{part.name}</h3>
          
          <div className="text-sm text-gray-300 space-y-1 mb-4">
            <div>Eco Impact: +{part.eco_impact}</div>
            <div className="text-eco-green">100% Eco-Friendly</div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-warning-yellow font-bold">${part.price}</span>
            <button
              onClick={() => onPurchase({...part, type: 'part'})}
              disabled={playerMoney < part.price}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                playerMoney < part.price
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-eco-green text-white hover:bg-green-600'
              }`}
            >
              Buy
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

const EcoItemsGrid = ({ shop, onPurchase, playerMoney }) => {
  const ecoItems = [
    { id: 'recycling_bag', name: 'Recycling Bag', price: 20, capacity: 10 },
    { id: 'solar_panel_kit', name: 'Solar Panel Kit', price: 500, energy: 100 },
    { id: 'compost_bin', name: 'Compost Bin', price: 80, eco_impact: 25 },
    { id: 'water_bottle', name: 'Eco Water Bottle', price: 15, eco_impact: 8 },
    { id: 'seed_packet', name: 'Tree Seed Packet', price: 10, eco_impact: 20 }
  ];

  return (
    <>
      {ecoItems.map((item) => (
        <div key={item.id} className="bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
          
          <div className="text-sm text-gray-300 space-y-1 mb-4">
            {item.capacity && <div>Capacity: {item.capacity} items</div>}
            {item.energy && <div>Energy: {item.energy} units</div>}
            {item.eco_impact && <div>Eco Impact: +{item.eco_impact}</div>}
            <div className="text-eco-green">Sustainable Material</div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-warning-yellow font-bold">${item.price}</span>
            <button
              onClick={() => onPurchase({...item, type: 'eco_item'})}
              disabled={playerMoney < item.price}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                playerMoney < item.price
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-eco-green text-white hover:bg-green-600'
              }`}
            >
              Buy
            </button>
          </div>
        </div>
      ))}
    </>
  );
};

export default ShopInterface;