from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
import os
from typing import Optional, Dict, Any
from pydantic import BaseModel
import uuid
from datetime import datetime

app = FastAPI(title="GTA Bicycle Game API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017/gta_bicycle_game')
client = MongoClient(MONGO_URL)
db = client.gta_bicycle_game

# Data Models
class Player(BaseModel):
    id: str
    name: str
    position: Dict[str, float]  # {x, y}
    health: int
    stamina: int
    eco_points: int
    money: int
    bicycle_id: str
    inventory: Dict[str, int]
    completed_missions: list
    current_mission: Optional[str] = None

class Bicycle(BaseModel):
    id: str
    name: str
    type: str  # "city", "mountain", "electric", "cargo"
    speed: float
    durability: int
    eco_efficiency: float
    upgrade_level: int
    price: int

class Mission(BaseModel):
    id: str
    name: str
    description: str
    type: str  # "pollution_cleanup", "recycling", "renewable_energy"
    objectives: Dict[str, Any]
    rewards: Dict[str, int]
    completed: bool = False

class Shop(BaseModel):
    id: str
    name: str
    type: str  # "bike_repair", "eco_store", "recycling_center"
    position: Dict[str, float]
    inventory: Dict[str, Dict[str, Any]]
    npc_dialogue: list

# Initialize default data
@app.on_event("startup")
async def startup_event():
    # Create default bicycles
    default_bicycles = [
        {
            "id": "city_bike_basic",
            "name": "City Cruiser",
            "type": "city",
            "speed": 20.0,
            "durability": 100,
            "eco_efficiency": 0.8,
            "upgrade_level": 1,
            "price": 200
        },
        {
            "id": "mountain_bike_basic",
            "name": "Trail Blazer",
            "type": "mountain",
            "speed": 18.0,
            "durability": 120,
            "eco_efficiency": 0.7,
            "upgrade_level": 1,
            "price": 350
        },
        {
            "id": "electric_bike_basic",
            "name": "Eco Thunder",
            "type": "electric",
            "speed": 35.0,
            "durability": 80,
            "eco_efficiency": 1.0,
            "upgrade_level": 1,
            "price": 800
        },
        {
            "id": "cargo_bike_basic",
            "name": "Green Hauler",
            "type": "cargo",
            "speed": 15.0,
            "durability": 150,
            "eco_efficiency": 0.9,
            "upgrade_level": 1,
            "price": 600
        }
    ]
    
    # Insert bicycles if they don't exist
    for bike in default_bicycles:
        if not db.bicycles.find_one({"id": bike["id"]}):
            db.bicycles.insert_one(bike)
    
    # Create default shops
    default_shops = [
        {
            "id": "bike_repair_shop",
            "name": "Green Wheels Repair",
            "type": "bike_repair",
            "position": {"x": 200, "y": 150},
            "inventory": {
                "eco_tire": {"name": "Eco-Friendly Tire", "price": 50, "eco_impact": 10},
                "bamboo_frame": {"name": "Bamboo Frame", "price": 200, "eco_impact": 50},
                "solar_light": {"name": "Solar Light", "price": 30, "eco_impact": 15}
            },
            "npc_dialogue": [
                "Welcome to Green Wheels! We only use eco-friendly parts.",
                "Your bike needs some TLC? We've got sustainable solutions!",
                "Every repair here helps the environment!"
            ]
        },
        {
            "id": "eco_store",
            "name": "Earth First Store",
            "type": "eco_store",
            "position": {"x": 400, "y": 300},
            "inventory": {
                "recycling_bag": {"name": "Recycling Bag", "price": 20, "capacity": 10},
                "solar_panel_kit": {"name": "Solar Panel Kit", "price": 500, "energy": 100},
                "compost_bin": {"name": "Compost Bin", "price": 80, "eco_impact": 25}
            },
            "npc_dialogue": [
                "Everything here is 100% eco-friendly!",
                "Help save the planet, one purchase at a time!",
                "Our products are made from recycled materials!"
            ]
        },
        {
            "id": "recycling_center",
            "name": "City Recycling Hub",
            "type": "recycling_center",
            "position": {"x": 600, "y": 100},
            "inventory": {
                "plastic_bottle": {"name": "Plastic Bottle", "buy_price": 2, "eco_impact": 5},
                "aluminum_can": {"name": "Aluminum Can", "buy_price": 3, "eco_impact": 8},
                "paper_waste": {"name": "Paper Waste", "buy_price": 1, "eco_impact": 3}
            },
            "npc_dialogue": [
                "Bring me your recyclables and earn money!",
                "Every item recycled makes the city cleaner!",
                "We accept all kinds of recyclable materials!"
            ]
        }
    ]
    
    # Insert shops if they don't exist
    for shop in default_shops:
        if not db.shops.find_one({"id": shop["id"]}):
            db.shops.insert_one(shop)
    
    # Create default missions
    default_missions = [
        {
            "id": "cleanup_park",
            "name": "Clean Up Central Park",
            "description": "The park is littered with trash. Help clean it up!",
            "type": "pollution_cleanup",
            "objectives": {
                "trash_collected": 0,
                "trash_required": 10,
                "location": {"x": 300, "y": 200}
            },
            "rewards": {"eco_points": 50, "money": 100},
            "completed": False
        },
        {
            "id": "install_solar_panels",
            "name": "Solar Panel Installation",
            "description": "Install solar panels on rooftops to promote renewable energy.",
            "type": "renewable_energy",
            "objectives": {
                "panels_installed": 0,
                "panels_required": 3,
                "locations": [
                    {"x": 150, "y": 100},
                    {"x": 450, "y": 250},
                    {"x": 550, "y": 350}
                ]
            },
            "rewards": {"eco_points": 100, "money": 200},
            "completed": False
        },
        {
            "id": "recycling_drive",
            "name": "Community Recycling Drive",
            "description": "Collect recyclables from around the city and bring them to the recycling center.",
            "type": "recycling",
            "objectives": {
                "items_collected": 0,
                "items_required": 20,
                "types": ["plastic_bottle", "aluminum_can", "paper_waste"]
            },
            "rewards": {"eco_points": 75, "money": 150},
            "completed": False
        }
    ]
    
    # Insert missions if they don't exist
    for mission in default_missions:
        if not db.missions.find_one({"id": mission["id"]}):
            db.missions.insert_one(mission)

# API Endpoints
@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "GTA Bicycle Game API is running"}

@app.post("/api/player/create")
async def create_player(name: str):
    player_id = str(uuid.uuid4())
    player = {
        "id": player_id,
        "name": name,
        "position": {"x": 220, "y": 170},  # Start on first horizontal road (y=150) and first vertical road (x=200)
        "health": 100,
        "stamina": 100,
        "eco_points": 0,
        "money": 500,
        "bicycle_id": "city_bike_basic",
        "inventory": {},
        "completed_missions": [],
        "current_mission": None,
        "created_at": datetime.utcnow()
    }
    db.players.insert_one(player)
    return {"player_id": player_id, "message": "Player created successfully"}

@app.get("/api/player/{player_id}")
async def get_player(player_id: str):
    player = db.players.find_one({"id": player_id})
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    player.pop("_id", None)
    return player

@app.put("/api/player/{player_id}/position")
async def update_player_position(player_id: str, x: float, y: float):
    result = db.players.update_one(
        {"id": player_id},
        {"$set": {"position": {"x": x, "y": y}}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Player not found")
    return {"message": "Position updated successfully"}

@app.get("/api/bicycles")
async def get_bicycles():
    bicycles = list(db.bicycles.find({}, {"_id": 0}))
    return bicycles

@app.get("/api/shops")
async def get_shops():
    shops = list(db.shops.find({}, {"_id": 0}))
    return shops

@app.get("/api/missions")
async def get_missions():
    missions = list(db.missions.find({}, {"_id": 0}))
    return missions

@app.post("/api/player/{player_id}/purchase_bicycle")
async def purchase_bicycle(player_id: str, bicycle_id: str):
    player = db.players.find_one({"id": player_id})
    bicycle = db.bicycles.find_one({"id": bicycle_id})
    
    if not player or not bicycle:
        raise HTTPException(status_code=404, detail="Player or bicycle not found")
    
    if player["money"] < bicycle["price"]:
        raise HTTPException(status_code=400, detail="Insufficient funds")
    
    # Update player
    db.players.update_one(
        {"id": player_id},
        {
            "$set": {"bicycle_id": bicycle_id},
            "$inc": {"money": -bicycle["price"]}
        }
    )
    
    return {"message": "Bicycle purchased successfully"}

@app.post("/api/player/{player_id}/mission/start")
async def start_mission(player_id: str, mission_id: str):
    player = db.players.find_one({"id": player_id})
    mission = db.missions.find_one({"id": mission_id})
    
    if not player or not mission:
        raise HTTPException(status_code=404, detail="Player or mission not found")
    
    if mission["completed"]:
        raise HTTPException(status_code=400, detail="Mission already completed")
    
    if player["current_mission"]:
        raise HTTPException(status_code=400, detail="Player already has an active mission")
    
    db.players.update_one(
        {"id": player_id},
        {"$set": {"current_mission": mission_id}}
    )
    
    return {"message": "Mission started successfully"}

@app.post("/api/player/{player_id}/mission/complete")
async def complete_mission(player_id: str, mission_id: str):
    player = db.players.find_one({"id": player_id})
    mission = db.missions.find_one({"id": mission_id})
    
    if not player or not mission:
        raise HTTPException(status_code=404, detail="Player or mission not found")
    
    if player["current_mission"] != mission_id:
        raise HTTPException(status_code=400, detail="Mission not currently active")
    
    # Award rewards
    rewards = mission["rewards"]
    db.players.update_one(
        {"id": player_id},
        {
            "$inc": {
                "eco_points": rewards.get("eco_points", 0),
                "money": rewards.get("money", 0)
            },
            "$push": {"completed_missions": mission_id},
            "$set": {"current_mission": None}
        }
    )
    
    # Mark mission as completed
    db.missions.update_one(
        {"id": mission_id},
        {"$set": {"completed": True}}
    )
    
    return {"message": "Mission completed successfully", "rewards": rewards}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)