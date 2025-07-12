export class PixelRenderer {
  constructor(ctx, width, height) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.tileSize = 32;
    
    // Disable image smoothing for pixel art
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.webkitImageSmoothingEnabled = false;
    this.ctx.mozImageSmoothingEnabled = false;
    this.ctx.msImageSmoothingEnabled = false;
  }

  // Render the game world
  renderWorld(gameWorld, camera) {
    this.ctx.save();
    
    // Apply camera transform
    this.ctx.translate(-camera.x, -camera.y);
    
    // Render ground/roads
    this.renderGround(gameWorld);
    
    // Render buildings
    this.renderBuildings(gameWorld.buildings);
    
    // Render shops
    this.renderShops(gameWorld.shops);
    
    // Render roads
    this.renderRoads(gameWorld.roads);
    
    // Render traffic
    this.renderTraffic(gameWorld.traffic);
    
    // Render NPCs
    this.renderNPCs(gameWorld.npcs);
    
    // Render recyclable items
    this.renderRecyclables(gameWorld.recyclableItems);
    
    // Render mission markers
    this.renderMissionMarkers(gameWorld.missions);
    
    // Render pollution effects
    this.renderPollution(gameWorld.pollution);
    
    this.ctx.restore();
  }

  renderGround(gameWorld) {
    // Create grass pattern
    this.ctx.fillStyle = '#4a7c59';
    this.ctx.fillRect(0, 0, gameWorld.width, gameWorld.height);
    
    // Add grass texture
    this.ctx.fillStyle = '#5a8c69';
    for (let x = 0; x < gameWorld.width; x += 16) {
      for (let y = 0; y < gameWorld.height; y += 16) {
        if (Math.random() > 0.7) {
          this.ctx.fillRect(x, y, 2, 2);
        }
      }
    }
  }

  renderBuildings(buildings) {
    buildings.forEach(building => {
      // Building shadow
      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.fillRect(building.x + 2, building.y + 2, building.width, building.height);
      
      // Building base
      this.ctx.fillStyle = building.color || '#8b7355';
      this.ctx.fillRect(building.x, building.y, building.width, building.height);
      
      // Building outline
      this.ctx.strokeStyle = '#5a4a3a';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(building.x, building.y, building.width, building.height);
      
      // Windows
      this.ctx.fillStyle = '#87ceeb';
      const windowSize = 8;
      const windowSpacing = 20;
      for (let wx = building.x + 10; wx < building.x + building.width - 10; wx += windowSpacing) {
        for (let wy = building.y + 10; wy < building.y + building.height - 10; wy += windowSpacing) {
          this.ctx.fillRect(wx, wy, windowSize, windowSize);
          this.ctx.strokeStyle = '#4682b4';
          this.ctx.strokeRect(wx, wy, windowSize, windowSize);
        }
      }
    });
  }

  renderShops(shops) {
    shops.forEach(shop => {
      // Shop base
      this.ctx.fillStyle = shop.type === 'bike_repair' ? '#8b4513' : 
                          shop.type === 'eco_store' ? '#228b22' : '#4169e1';
      this.ctx.fillRect(shop.x, shop.y, shop.width, shop.height);
      
      // Shop outline
      this.ctx.strokeStyle = '#2f2f2f';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(shop.x, shop.y, shop.width, shop.height);
      
      // Shop door
      this.ctx.fillStyle = '#654321';
      this.ctx.fillRect(shop.x + shop.width/2 - 8, shop.y + shop.height - 16, 16, 16);
      
      // Shop sign
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '12px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(shop.name, shop.x + shop.width/2, shop.y - 5);
      
      // Shop icon
      this.ctx.fillStyle = '#ffd700';
      const iconX = shop.x + shop.width/2;
      const iconY = shop.y + 20;
      
      if (shop.type === 'bike_repair') {
        // Wrench icon
        this.ctx.fillRect(iconX - 2, iconY - 8, 4, 16);
        this.ctx.fillRect(iconX - 6, iconY - 4, 12, 4);
      } else if (shop.type === 'eco_store') {
        // Leaf icon
        this.ctx.beginPath();
        this.ctx.arc(iconX, iconY, 8, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (shop.type === 'recycling_center') {
        // Recycle icon
        this.ctx.beginPath();
        this.ctx.arc(iconX, iconY, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#228b22';
        this.ctx.font = '10px monospace';
        this.ctx.fillText('♻', iconX, iconY + 3);
      }
    });
  }

  renderRoads(roads) {
    roads.forEach(road => {
      // Road base
      this.ctx.fillStyle = '#404040';
      this.ctx.fillRect(road.x, road.y, road.width, road.height);
      
      // Road lines
      this.ctx.strokeStyle = '#ffff00';
      this.ctx.lineWidth = 2;
      this.ctx.setLineDash([10, 10]);
      
      if (road.width > road.height) {
        // Horizontal road
        this.ctx.beginPath();
        this.ctx.moveTo(road.x, road.y + road.height/2);
        this.ctx.lineTo(road.x + road.width, road.y + road.height/2);
        this.ctx.stroke();
      } else {
        // Vertical road
        this.ctx.beginPath();
        this.ctx.moveTo(road.x + road.width/2, road.y);
        this.ctx.lineTo(road.x + road.width/2, road.y + road.height);
        this.ctx.stroke();
      }
      
      this.ctx.setLineDash([]);
    });
  }

  renderTraffic(traffic) {
    traffic.forEach(vehicle => {
      this.ctx.save();
      
      // Move to vehicle position
      this.ctx.translate(vehicle.x + vehicle.width/2, vehicle.y + vehicle.height/2);
      this.ctx.rotate(vehicle.direction * Math.PI / 2);
      
      // Vehicle body
      this.ctx.fillStyle = vehicle.type === 'car' ? '#ff0000' : '#0000ff';
      this.ctx.fillRect(-vehicle.width/2, -vehicle.height/2, vehicle.width, vehicle.height);
      
      // Vehicle outline
      this.ctx.strokeStyle = '#2f2f2f';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(-vehicle.width/2, -vehicle.height/2, vehicle.width, vehicle.height);
      
      // Vehicle wheels
      this.ctx.fillStyle = '#1a1a1a';
      this.ctx.fillRect(-vehicle.width/2 + 2, -vehicle.height/2 - 2, 4, 2);
      this.ctx.fillRect(-vehicle.width/2 + 2, vehicle.height/2, 4, 2);
      this.ctx.fillRect(vehicle.width/2 - 6, -vehicle.height/2 - 2, 4, 2);
      this.ctx.fillRect(vehicle.width/2 - 6, vehicle.height/2, 4, 2);
      
      // Pollution effect for cars
      if (vehicle.type === 'car') {
        this.ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
        this.ctx.fillRect(-vehicle.width/2 - 10, -2, 8, 4);
      }
      
      this.ctx.restore();
    });
  }

  renderNPCs(npcs) {
    npcs.forEach(npc => {
      this.ctx.save();
      
      // NPC body
      this.ctx.fillStyle = npc.type === 'pedestrian' ? '#8b4513' : '#4169e1';
      this.ctx.fillRect(npc.x, npc.y, npc.width, npc.height);
      
      // NPC head
      this.ctx.fillStyle = '#ffdbac';
      this.ctx.fillRect(npc.x + 2, npc.y - 4, npc.width - 4, 8);
      
      // If cycling, draw bicycle
      if (npc.type === 'cyclist') {
        this.ctx.strokeStyle = '#2f2f2f';
        this.ctx.lineWidth = 2;
        
        // Bicycle wheels
        this.ctx.beginPath();
        this.ctx.arc(npc.x + 4, npc.y + npc.height + 4, 4, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.arc(npc.x + npc.width - 4, npc.y + npc.height + 4, 4, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // Bicycle frame
        this.ctx.beginPath();
        this.ctx.moveTo(npc.x + 4, npc.y + npc.height + 4);
        this.ctx.lineTo(npc.x + npc.width - 4, npc.y + npc.height + 4);
        this.ctx.stroke();
      }
      
      this.ctx.restore();
    });
  }

  renderRecyclables(recyclables) {
    recyclables.forEach(item => {
      this.ctx.fillStyle = item.type === 'plastic_bottle' ? '#87ceeb' :
                          item.type === 'aluminum_can' ? '#c0c0c0' : '#daa520';
      this.ctx.fillRect(item.x, item.y, item.width, item.height);
      
      // Item outline
      this.ctx.strokeStyle = '#2f2f2f';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(item.x, item.y, item.width, item.height);
      
      // Glowing effect
      this.ctx.shadowColor = '#00ff00';
      this.ctx.shadowBlur = 5;
      this.ctx.strokeRect(item.x, item.y, item.width, item.height);
      this.ctx.shadowBlur = 0;
    });
  }

  renderMissionMarkers(missions) {
    missions.forEach(mission => {
      if (mission.completed) return;
      
      // Mission marker
      this.ctx.fillStyle = '#ffd700';
      this.ctx.beginPath();
      this.ctx.arc(mission.x, mission.y, 12, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Mission icon
      this.ctx.fillStyle = '#2f2f2f';
      this.ctx.font = '16px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('!', mission.x, mission.y + 5);
      
      // Pulsing effect
      const time = Date.now() / 1000;
      const pulse = Math.sin(time * 3) * 0.3 + 0.7;
      this.ctx.globalAlpha = pulse;
      this.ctx.strokeStyle = '#ffd700';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(mission.x, mission.y, 15, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.globalAlpha = 1;
    });
  }

  renderPollution(pollution) {
    pollution.locations.forEach(location => {
      this.ctx.fillStyle = `rgba(128, 128, 128, ${location.intensity * 0.3})`;
      this.ctx.fillRect(location.x - 20, location.y - 20, 40, 40);
    });
  }

  renderPlayer(player, camera) {
    const screenX = player.x - camera.x;
    const screenY = player.y - camera.y;
    
    this.ctx.save();
    
    // Move to player position
    this.ctx.translate(screenX + player.width/2, screenY + player.height/2);
    this.ctx.rotate(player.direction * Math.PI / 2);
    
    // Player body
    this.ctx.fillStyle = '#ff6b6b';
    this.ctx.fillRect(-player.width/2, -player.height/2, player.width, player.height);
    
    // Player head
    this.ctx.fillStyle = '#ffdbac';
    this.ctx.fillRect(-6, -player.height/2 - 4, 12, 8);
    
    // Bicycle
    this.ctx.strokeStyle = player.bicycle?.type === 'electric' ? '#00ff00' : '#2f2f2f';
    this.ctx.lineWidth = 2;
    
    // Bicycle wheels
    this.ctx.beginPath();
    this.ctx.arc(-8, player.height/2 + 4, 4, 0, Math.PI * 2);
    this.ctx.stroke();
    
    this.ctx.beginPath();
    this.ctx.arc(8, player.height/2 + 4, 4, 0, Math.PI * 2);
    this.ctx.stroke();
    
    // Bicycle frame
    this.ctx.beginPath();
    this.ctx.moveTo(-8, player.height/2 + 4);
    this.ctx.lineTo(8, player.height/2 + 4);
    this.ctx.stroke();
    
    // Movement animation
    if (player.isMoving) {
      const time = Date.now() / 100;
      const offset = Math.sin(time) * 2;
      this.ctx.translate(0, offset);
    }
    
    this.ctx.restore();
  }

  renderUI(player, ui) {
    // Reset transform for UI
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Player stats
    this.renderPlayerStats(player);
    
    // Notifications
    this.renderNotifications(ui.notifications);
    
    // Shop prompt
    if (ui.showShopPrompt) {
      this.renderShopPrompt(ui.selectedShop);
    }
    
    // Mission prompt
    if (ui.showMissionPrompt) {
      this.renderMissionPrompt(ui.currentMission);
    }
  }

  renderPlayerStats(player) {
    const x = 20;
    const y = 20;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(x - 5, y - 5, 200, 80);
    
    // Health bar
    this.ctx.fillStyle = '#ff0000';
    this.ctx.fillRect(x, y, 100, 8);
    this.ctx.fillStyle = '#00ff00';
    this.ctx.fillRect(x, y, (player.health / 100) * 100, 8);
    
    // Stamina bar
    this.ctx.fillStyle = '#0000ff';
    this.ctx.fillRect(x, y + 15, 100, 6);
    this.ctx.fillStyle = '#87ceeb';
    this.ctx.fillRect(x, y + 15, (player.stamina / 100) * 100, 6);
    
    // Text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '12px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('Health', x + 105, y + 8);
    this.ctx.fillText('Stamina', x + 105, y + 20);
    
    // Bicycle info
    if (player.bicycle) {
      this.ctx.fillText(`Bike: ${player.bicycle.name}`, x, y + 35);
      this.ctx.fillText(`Speed: ${player.bicycle.speed}`, x, y + 50);
      this.ctx.fillText(`Eco: ${Math.round(player.bicycle.eco_efficiency * 100)}%`, x, y + 65);
    }
  }

  renderNotifications(notifications) {
    notifications.forEach((notification, index) => {
      const x = this.width - 320;
      const y = 20 + index * 40;
      
      // Background
      this.ctx.fillStyle = notification.type === 'error' ? 'rgba(255, 0, 0, 0.8)' : 
                          notification.type === 'success' ? 'rgba(0, 255, 0, 0.8)' : 
                          'rgba(0, 0, 255, 0.8)';
      this.ctx.fillRect(x, y, 300, 30);
      
      // Text
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '14px monospace';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(notification.message, x + 10, y + 20);
    });
  }

  renderShopPrompt(shop) {
    const x = this.width / 2 - 200;
    const y = this.height / 2 - 100;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(x, y, 400, 200);
    
    // Border
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, 400, 200);
    
    // Text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${shop.name}`, x + 200, y + 40);
    this.ctx.fillText('Press E to enter', x + 200, y + 80);
    this.ctx.fillText('Press ESC to cancel', x + 200, y + 120);
  }

  renderMissionPrompt(mission) {
    const x = this.width / 2 - 200;
    const y = this.height / 2 - 100;
    
    // Background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(x, y, 400, 200);
    
    // Border
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, 400, 200);
    
    // Text
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '16px monospace';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${mission.name}`, x + 200, y + 40);
    this.ctx.font = '12px monospace';
    this.ctx.fillText(mission.description, x + 200, y + 70);
    this.ctx.fillText('Press F to start mission', x + 200, y + 110);
    this.ctx.fillText('Press ESC to cancel', x + 200, y + 140);
  }
}