export class GameWorld {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.buildings = [];
    this.roads = [];
    this.shops = [];
    this.missions = [];
    this.traffic = [];
    this.npcs = [];
    this.recyclableItems = [];
    this.pollution = {
      level: 50,
      locations: []
    };
    this.time = 0;
    this.dayNightCycle = 0;
  }

  initializeWorld() {
    this.generateBuildings();
    this.generateRoads();
    this.generateShops();
    this.generateMissions();
    this.spawnTraffic();
    this.spawnNPCs();
    this.spawnRecyclables();
    this.generatePollution();
  }

  generateBuildings() {
    // Fixed building positions for consistent city layout
    const fixedBuildings = [
      // Row 1 buildings (top)
      { x: 50, y: 50, width: 80, height: 80, color: '#8b7355' },
      { x: 250, y: 30, width: 100, height: 100, color: '#a0522d' },
      { x: 450, y: 40, width: 90, height: 90, color: '#708090' },
      { x: 650, y: 20, width: 120, height: 110, color: '#2f4f4f' },
      { x: 850, y: 50, width: 80, height: 80, color: '#8b7355' },
      { x: 1050, y: 30, width: 100, height: 100, color: '#a0522d' },
      
      // Row 2 buildings (between roads)
      { x: 30, y: 200, width: 60, height: 120, color: '#708090' },
      { x: 280, y: 220, width: 80, height: 100, color: '#2f4f4f' },
      { x: 520, y: 210, width: 100, height: 110, color: '#8b7355' },
      { x: 680, y: 200, width: 90, height: 120, color: '#a0522d' },
      { x: 880, y: 220, width: 80, height: 100, color: '#708090' },
      { x: 1080, y: 210, width: 100, height: 110, color: '#2f4f4f' },
      
      // Row 3 buildings (middle)
      { x: 70, y: 350, width: 120, height: 80, color: '#a0522d' },
      { x: 300, y: 370, width: 80, height: 100, color: '#8b7355' },
      { x: 470, y: 360, width: 100, height: 90, color: '#708090' },
      { x: 650, y: 350, width: 90, height: 110, color: '#2f4f4f' },
      { x: 850, y: 370, width: 80, height: 100, color: '#a0522d' },
      { x: 1000, y: 360, width: 120, height: 90, color: '#8b7355' },
      
      // Row 4 buildings (between roads)
      { x: 40, y: 520, width: 80, height: 120, color: '#708090' },
      { x: 270, y: 540, width: 100, height: 80, color: '#2f4f4f' },
      { x: 450, y: 530, width: 90, height: 100, color: '#8b7355' },
      { x: 620, y: 520, width: 120, height: 90, color: '#a0522d' },
      { x: 820, y: 540, width: 80, height: 110, color: '#708090' },
      { x: 1020, y: 530, width: 100, height: 100, color: '#2f4f4f' },
      
      // Row 5 buildings (bottom)
      { x: 60, y: 670, width: 100, height: 80, color: '#a0522d' },
      { x: 290, y: 690, width: 80, height: 100, color: '#8b7355' },
      { x: 480, y: 680, width: 120, height: 90, color: '#708090' },
      { x: 680, y: 670, width: 90, height: 110, color: '#2f4f4f' },
      { x: 870, y: 690, width: 80, height: 80, color: '#a0522d' },
      { x: 1070, y: 680, width: 100, height: 100, color: '#8b7355' }
    ];

    // Add all fixed buildings to the game world
    this.buildings = fixedBuildings.map(building => ({
      ...building,
      type: 'building'
    }));
  }

  generateRoads() {
    // Horizontal roads
    for (let i = 0; i < 3; i++) {
      this.roads.push({
        x: 0,
        y: 150 + i * 250,
        width: this.width,
        height: 40,
        type: 'horizontal'
      });
    }

    // Vertical roads
    for (let i = 0; i < 4; i++) {
      this.roads.push({
        x: 200 + i * 300,
        y: 0,
        width: 40,
        height: this.height,
        type: 'vertical'
      });
    }
  }

  generateShops() {
    // Fixed shop positions for consistent gameplay
    const shopData = [
      { name: 'Green Wheels', type: 'bike_repair', x: 150, y: 120, width: 80, height: 60 },
      { name: 'Earth Store', type: 'eco_store', x: 380, y: 270, width: 100, height: 80 },
      { name: 'Recycle Hub', type: 'recycling_center', x: 580, y: 70, width: 90, height: 70 }
    ];

    this.shops = shopData.map(shop => ({
      ...shop,
      id: shop.name.toLowerCase().replace(/\s+/g, '_')
    }));
  }

  generateMissions() {
    // Fixed mission locations for consistent gameplay
    const missionData = [
      { name: 'Clean Park', type: 'cleanup', x: 300, y: 180, completed: false },
      { name: 'Solar Install', type: 'solar', x: 750, y: 400, completed: false },
      { name: 'Recycle Drive', type: 'recycle', x: 900, y: 150, completed: false }
    ];

    this.missions = missionData.map(mission => ({
      ...mission,
      id: mission.name.toLowerCase().replace(/\s+/g, '_')
    }));
  }

  spawnTraffic() {
    const trafficCount = 12;
    
    for (let i = 0; i < trafficCount; i++) {
      const vehicleType = Math.random() > 0.7 ? 'bus' : 'car';
      const road = this.roads[Math.floor(Math.random() * this.roads.length)];
      
      let x, y, direction, speed;
      
      if (road.type === 'horizontal') {
        x = Math.random() * this.width;
        y = road.y + road.height / 2 - 8;
        direction = Math.random() > 0.5 ? 1 : 3; // Right or left
        speed = Math.random() * 2 + 1;
      } else {
        x = road.x + road.width / 2 - 8;
        y = Math.random() * this.height;
        direction = Math.random() > 0.5 ? 0 : 2; // Up or down
        speed = Math.random() * 2 + 1;
      }
      
      this.traffic.push({
        x,
        y,
        width: vehicleType === 'bus' ? 32 : 24,
        height: vehicleType === 'bus' ? 16 : 12,
        type: vehicleType,
        direction,
        speed,
        roadType: road.type
      });
    }
  }

  spawnNPCs() {
    const npcCount = 20;
    
    for (let i = 0; i < npcCount; i++) {
      const npcType = Math.random() > 0.6 ? 'cyclist' : 'pedestrian';
      
      this.npcs.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        width: 12,
        height: 16,
        type: npcType,
        direction: Math.floor(Math.random() * 4),
        speed: Math.random() * 1 + 0.5,
        targetX: Math.random() * this.width,
        targetY: Math.random() * this.height
      });
    }
  }

  spawnRecyclables() {
    const recyclableTypes = ['plastic_bottle', 'aluminum_can', 'paper_waste'];
    const recyclableCount = 15;
    
    for (let i = 0; i < recyclableCount; i++) {
      const type = recyclableTypes[Math.floor(Math.random() * recyclableTypes.length)];
      
      this.recyclableItems.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        width: 8,
        height: 8,
        type,
        collected: false
      });
    }
  }

  generatePollution() {
    // Generate pollution hotspots around traffic areas
    for (let i = 0; i < 8; i++) {
      this.pollution.locations.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        intensity: Math.random() * 0.8 + 0.2,
        radius: Math.random() * 50 + 30
      });
    }
  }

  isValidBuildingPosition(x, y, width, height) {
    // Check if position overlaps with roads
    for (const road of this.roads) {
      if (x < road.x + road.width &&
          x + width > road.x &&
          y < road.y + road.height &&
          y + height > road.y) {
        return false;
      }
    }
    
    // Check if position overlaps with other buildings
    for (const building of this.buildings) {
      if (x < building.x + building.width &&
          x + width > building.x &&
          y < building.y + building.height &&
          y + height > building.y) {
        return false;
      }
    }
    
    return true;
  }

  update() {
    this.time += 1;
    this.updateTraffic();
    this.updateNPCs();
    this.updatePollution();
    this.updateDayNightCycle();
  }

  updateTraffic() {
    this.traffic.forEach(vehicle => {
      switch (vehicle.direction) {
        case 0: // Up
          vehicle.y -= vehicle.speed;
          if (vehicle.y < -vehicle.height) {
            vehicle.y = this.height + vehicle.height;
          }
          break;
        case 1: // Right
          vehicle.x += vehicle.speed;
          if (vehicle.x > this.width + vehicle.width) {
            vehicle.x = -vehicle.width;
          }
          break;
        case 2: // Down
          vehicle.y += vehicle.speed;
          if (vehicle.y > this.height + vehicle.height) {
            vehicle.y = -vehicle.height;
          }
          break;
        case 3: // Left
          vehicle.x -= vehicle.speed;
          if (vehicle.x < -vehicle.width) {
            vehicle.x = this.width + vehicle.width;
          }
          break;
      }
    });
  }

  updateNPCs() {
    this.npcs.forEach(npc => {
      // Simple AI: move towards target
      const dx = npc.targetX - npc.x;
      const dy = npc.targetY - npc.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 5) {
        npc.x += (dx / distance) * npc.speed;
        npc.y += (dy / distance) * npc.speed;
      } else {
        // Reached target, pick new target
        npc.targetX = Math.random() * this.width;
        npc.targetY = Math.random() * this.height;
      }
      
      // Keep NPCs within bounds
      npc.x = Math.max(0, Math.min(this.width - npc.width, npc.x));
      npc.y = Math.max(0, Math.min(this.height - npc.height, npc.y));
    });
  }

  updatePollution() {
    // Pollution increases near traffic and decreases over time
    this.pollution.locations.forEach(location => {
      // Natural decay
      location.intensity *= 0.9995;
      
      // Increase near traffic
      this.traffic.forEach(vehicle => {
        if (vehicle.type === 'car') {
          const distance = Math.sqrt(
            Math.pow(location.x - vehicle.x, 2) + 
            Math.pow(location.y - vehicle.y, 2)
          );
          if (distance < 50) {
            location.intensity = Math.min(1.0, location.intensity + 0.001);
          }
        }
      });
    });
  }

  updateDayNightCycle() {
    // Simple day/night cycle
    this.dayNightCycle = (this.time / 1000) % 1;
  }

  checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  getNearbyShop(x, y, radius = 50) {
    return this.shops.find(shop => {
      const distance = Math.sqrt(
        Math.pow(x - (shop.x + shop.width/2), 2) + 
        Math.pow(y - (shop.y + shop.height/2), 2)
      );
      return distance < radius;
    });
  }

  getNearbyMission(x, y, radius = 50) {
    return this.missions.find(mission => {
      const distance = Math.sqrt(
        Math.pow(x - mission.x, 2) + 
        Math.pow(y - mission.y, 2)
      );
      return distance < radius && !mission.completed;
    });
  }

  collectRecyclable(x, y, radius = 20) {
    const item = this.recyclableItems.find(item => {
      if (item.collected) return false;
      const distance = Math.sqrt(
        Math.pow(x - item.x, 2) + 
        Math.pow(y - item.y, 2)
      );
      return distance < radius;
    });
    
    if (item) {
      item.collected = true;
      return item;
    }
    return null;
  }

  reducePollution(x, y, radius = 30) {
    this.pollution.locations.forEach(location => {
      const distance = Math.sqrt(
        Math.pow(x - location.x, 2) + 
        Math.pow(y - location.y, 2)
      );
      if (distance < radius) {
        location.intensity = Math.max(0, location.intensity - 0.1);
      }
    });
  }
}