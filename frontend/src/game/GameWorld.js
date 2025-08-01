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
    
    // Define road positions where NPCs can spawn
    const roadPositions = [];
    
    // Horizontal roads (y = 150, 400, 650 with height = 40)
    const horizontalRoads = [150, 400, 650];
    for (const roadY of horizontalRoads) {
      for (let x = 0; x < this.width; x += 50) {
        roadPositions.push({
          x: x,
          y: roadY + Math.random() * 40, // Random position within road height
          type: 'horizontal'
        });
      }
    }
    
    // Vertical roads (x = 200, 500, 800, 1100 with width = 40)
    const verticalRoads = [200, 500, 800, 1100];
    for (const roadX of verticalRoads) {
      for (let y = 0; y < this.height; y += 50) {
        roadPositions.push({
          x: roadX + Math.random() * 40, // Random position within road width
          y: y,
          type: 'vertical'
        });
      }
    }
    
    // Spawn NPCs only on roads
    for (let i = 0; i < npcCount; i++) {
      const npcType = Math.random() > 0.6 ? 'cyclist' : 'pedestrian';
      const roadPos = roadPositions[Math.floor(Math.random() * roadPositions.length)];
      
      // Set direction based on road type
      let direction = 0;
      if (roadPos.type === 'horizontal') {
        direction = Math.random() > 0.5 ? 1 : 3; // Right or left
      } else {
        direction = Math.random() > 0.5 ? 0 : 2; // Up or down
      }
      
      this.npcs.push({
        x: roadPos.x,
        y: roadPos.y,
        width: 12,
        height: 16,
        type: npcType,
        direction: direction,
        speed: Math.random() * 1 + 0.5,
        targetX: roadPos.x + (Math.random() - 0.5) * 200, // Stay near road
        targetY: roadPos.y + (Math.random() - 0.5) * 200,
        roadType: roadPos.type
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
      // Move NPCs based on their road type and direction
      if (npc.roadType === 'horizontal') {
        // Move along horizontal road
        if (npc.direction === 1) { // Right
          npc.x += npc.speed;
          if (npc.x > this.width) {
            npc.x = -npc.width;
          }
        } else if (npc.direction === 3) { // Left
          npc.x -= npc.speed;
          if (npc.x < -npc.width) {
            npc.x = this.width;
          }
        }
        
        // Keep NPCs on horizontal road
        const roadY = npc.y < 200 ? 150 : (npc.y < 450 ? 400 : 650);
        npc.y = roadY + Math.random() * 40;
        
      } else if (npc.roadType === 'vertical') {
        // Move along vertical road
        if (npc.direction === 0) { // Up
          npc.y -= npc.speed;
          if (npc.y < -npc.height) {
            npc.y = this.height;
          }
        } else if (npc.direction === 2) { // Down
          npc.y += npc.speed;
          if (npc.y > this.height) {
            npc.y = -npc.height;
          }
        }
        
        // Keep NPCs on vertical road
        const roadX = npc.x < 350 ? 200 : (npc.x < 650 ? 500 : (npc.x < 950 ? 800 : 1100));
        npc.x = roadX + Math.random() * 40;
      }
      
      // Randomly change direction at intersections (10% chance)
      if (Math.random() < 0.01) {
        // Check if NPC is near an intersection
        const nearIntersection = this.isNearIntersection(npc.x, npc.y);
        if (nearIntersection) {
          // Switch between horizontal and vertical movement
          if (npc.roadType === 'horizontal') {
            npc.roadType = 'vertical';
            npc.direction = Math.random() > 0.5 ? 0 : 2; // Up or down
          } else {
            npc.roadType = 'horizontal';
            npc.direction = Math.random() > 0.5 ? 1 : 3; // Right or left
          }
        }
      }
    });
  }
  
  isNearIntersection(x, y) {
    const intersections = [
      { x: 220, y: 170 },  // First intersection
      { x: 220, y: 420 },  // Second intersection
      { x: 220, y: 670 },  // Third intersection
      { x: 520, y: 170 },  // Fourth intersection
      { x: 520, y: 420 },  // Fifth intersection
      { x: 520, y: 670 },  // Sixth intersection
      { x: 820, y: 170 },  // Seventh intersection
      { x: 820, y: 420 },  // Eighth intersection
      { x: 820, y: 670 },  // Ninth intersection
      { x: 1120, y: 170 }, // Tenth intersection
      { x: 1120, y: 420 }, // Eleventh intersection
      { x: 1120, y: 670 }, // Twelfth intersection
    ];
    
    for (const intersection of intersections) {
      const distance = Math.sqrt(
        Math.pow(x - intersection.x, 2) + Math.pow(y - intersection.y, 2)
      );
      if (distance < 30) {
        return true;
      }
    }
    return false;
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

  isOnRoad(x, y) {
    // Check if position is on any road
    for (const road of this.roads) {
      if (x >= road.x && x <= road.x + road.width &&
          y >= road.y && y <= road.y + road.height) {
        return true;
      }
    }
    return false;
  }

  getNearestRoadPosition(x, y) {
    // Find nearest road position
    let nearestDistance = Infinity;
    let nearestPosition = { x: 220, y: 170 }; // Default to first intersection
    
    // Check all road intersections
    const intersections = [
      { x: 220, y: 170 },  // First intersection
      { x: 220, y: 420 },  // Second intersection
      { x: 220, y: 670 },  // Third intersection
      { x: 520, y: 170 },  // Fourth intersection
      { x: 520, y: 420 },  // Fifth intersection
      { x: 520, y: 670 },  // Sixth intersection
      { x: 820, y: 170 },  // Seventh intersection
      { x: 820, y: 420 },  // Eighth intersection
      { x: 820, y: 670 },  // Ninth intersection
    ];
    
    for (const intersection of intersections) {
      const distance = Math.sqrt(
        Math.pow(x - intersection.x, 2) + Math.pow(y - intersection.y, 2)
      );
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestPosition = intersection;
      }
    }
    
    return nearestPosition;
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