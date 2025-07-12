export class CollisionSystem {
  constructor() {
    this.collisionMargin = 2; // Small margin to prevent getting stuck
  }

  // Check collision between two rectangles
  checkRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
  }

  // Check collision between rectangle and circle
  checkRectCircleCollision(rect, circle) {
    const distX = Math.abs(circle.x - rect.x - rect.width / 2);
    const distY = Math.abs(circle.y - rect.y - rect.height / 2);

    if (distX > (rect.width / 2 + circle.radius)) return false;
    if (distY > (rect.height / 2 + circle.radius)) return false;

    if (distX <= (rect.width / 2)) return true;
    if (distY <= (rect.height / 2)) return true;

    const dx = distX - rect.width / 2;
    const dy = distY - rect.height / 2;
    return (dx * dx + dy * dy <= (circle.radius * circle.radius));
  }

  // Check if entity is within world bounds
  checkWorldBounds(entity, gameWorld) {
    return entity.x >= 0 && 
           entity.y >= 0 && 
           entity.x + entity.width <= gameWorld.width && 
           entity.y + entity.height <= gameWorld.height;
  }

  // Check collision with buildings
  checkBuildingCollisions(entity, buildings) {
    for (const building of buildings) {
      if (this.checkRectCollision(entity, building)) {
        return false; // Collision detected
      }
    }
    return true; // No collision
  }

  // Check collision with roads (for pedestrians)
  checkRoadCollisions(entity, roads) {
    for (const road of roads) {
      if (this.checkRectCollision(entity, road)) {
        return true; // On road
      }
    }
    return false; // Not on road
  }

  // Check collision with traffic
  checkTrafficCollisions(entity, traffic) {
    for (const vehicle of traffic) {
      if (this.checkRectCollision(entity, vehicle)) {
        return vehicle; // Return the vehicle that was hit
      }
    }
    return null; // No collision
  }

  // Check collision with NPCs
  checkNPCCollisions(entity, npcs) {
    for (const npc of npcs) {
      if (this.checkRectCollision(entity, npc)) {
        return npc; // Return the NPC that was hit
      }
    }
    return null; // No collision
  }

  // Check collision with shops
  checkShopCollisions(entity, shops) {
    for (const shop of shops) {
      if (this.checkRectCollision(entity, shop)) {
        return shop; // Return the shop that was entered
      }
    }
    return null; // No collision
  }

  // Check collision with recyclable items
  checkRecyclableCollisions(entity, recyclables) {
    const collectedItems = [];
    for (const item of recyclables) {
      if (!item.collected && this.checkRectCollision(entity, item)) {
        collectedItems.push(item);
      }
    }
    return collectedItems; // Return all collected items
  }

  // Check collision with mission markers
  checkMissionCollisions(entity, missions) {
    for (const mission of missions) {
      if (!mission.completed) {
        const distance = Math.sqrt(
          Math.pow(entity.x + entity.width/2 - mission.x, 2) + 
          Math.pow(entity.y + entity.height/2 - mission.y, 2)
        );
        if (distance < 30) {
          return mission; // Return the mission that's nearby
        }
      }
    }
    return null; // No nearby mission
  }

  // Resolve collision by moving entity to safe position
  resolveCollision(entity, obstacle, direction) {
    const margin = this.collisionMargin;
    
    switch (direction) {
      case 'up':
        entity.y = obstacle.y + obstacle.height + margin;
        break;
      case 'down':
        entity.y = obstacle.y - entity.height - margin;
        break;
      case 'left':
        entity.x = obstacle.x + obstacle.width + margin;
        break;
      case 'right':
        entity.x = obstacle.x - entity.width - margin;
        break;
    }
  }

  // Get safe movement position
  getSafeMovementPosition(entity, newX, newY, obstacles) {
    const testEntity = {
      x: newX,
      y: newY,
      width: entity.width,
      height: entity.height
    };

    // Check each obstacle
    for (const obstacle of obstacles) {
      if (this.checkRectCollision(testEntity, obstacle)) {
        // Calculate which side of the obstacle we're hitting
        const overlapX = Math.min(testEntity.x + testEntity.width - obstacle.x, 
                                 obstacle.x + obstacle.width - testEntity.x);
        const overlapY = Math.min(testEntity.y + testEntity.height - obstacle.y, 
                                 obstacle.y + obstacle.height - testEntity.y);

        // Resolve collision on the axis with less overlap
        if (overlapX < overlapY) {
          // Horizontal collision
          if (testEntity.x < obstacle.x) {
            newX = obstacle.x - testEntity.width - this.collisionMargin;
          } else {
            newX = obstacle.x + obstacle.width + this.collisionMargin;
          }
        } else {
          // Vertical collision
          if (testEntity.y < obstacle.y) {
            newY = obstacle.y - testEntity.height - this.collisionMargin;
          } else {
            newY = obstacle.y + obstacle.height + this.collisionMargin;
          }
        }

        // Update test entity position
        testEntity.x = newX;
        testEntity.y = newY;
      }
    }

    return { x: newX, y: newY };
  }

  // Check if position is safe (no collisions)
  isPositionSafe(entity, gameWorld) {
    // Check world bounds
    if (!this.checkWorldBounds(entity, gameWorld)) {
      return false;
    }

    // Check building collisions
    if (!this.checkBuildingCollisions(entity, gameWorld.buildings)) {
      return false;
    }

    // Check traffic collisions
    if (this.checkTrafficCollisions(entity, gameWorld.traffic)) {
      return false;
    }

    return true;
  }

  // Find nearest safe position
  findNearestSafePosition(entity, gameWorld, maxDistance = 50) {
    const originalX = entity.x;
    const originalY = entity.y;
    
    // Try positions in expanding squares
    for (let distance = 1; distance <= maxDistance; distance += 5) {
      const positions = this.getPositionsAtDistance(originalX, originalY, distance);
      
      for (const pos of positions) {
        const testEntity = {
          x: pos.x,
          y: pos.y,
          width: entity.width,
          height: entity.height
        };
        
        if (this.isPositionSafe(testEntity, gameWorld)) {
          return pos;
        }
      }
    }
    
    // If no safe position found, return original position
    return { x: originalX, y: originalY };
  }

  // Get positions at a specific distance from center
  getPositionsAtDistance(centerX, centerY, distance) {
    const positions = [];
    const steps = Math.max(8, Math.floor(distance / 5));
    
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      positions.push({ x, y });
    }
    
    return positions;
  }

  // Calculate damage from collision
  calculateCollisionDamage(entity, obstacle) {
    if (obstacle.type === 'traffic') {
      return obstacle.vehicleType === 'bus' ? 30 : 20;
    } else if (obstacle.type === 'building') {
      return 10;
    }
    return 5;
  }

  // Check if entity can interact with object
  canInteract(entity, object, maxDistance = 30) {
    const distance = Math.sqrt(
      Math.pow(entity.x + entity.width/2 - (object.x + object.width/2), 2) + 
      Math.pow(entity.y + entity.height/2 - (object.y + object.height/2), 2)
    );
    return distance <= maxDistance;
  }
}