from fastapi import FastAPI, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, date
import uuid
import os
from dotenv import load_dotenv

# Load env
load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# MongoDB
client = AsyncIOMotorClient(os.getenv("MONGO_URL"))
db = client[os.getenv("DB_NAME")]
collection = db.matches

PASSWORD = os.getenv("TOURNAMENT_PASSWORD")


# ---------------- PASSWORD CHECK ----------------
async def verify_password(x_password: str = Header(None)):
    if x_password != PASSWORD:
        raise HTTPException(status_code=401, detail="Unauthorized")


# ---------------- AUTH ----------------
@app.post("/api/auth/login")
async def login(data: dict):
    if data.get("password") == PASSWORD:
        return {"success": True, "message": "Login successful"}
    return {"success": False, "message": "Invalid password"}


# ---------------- HELPER ----------------
def calculate_points(winner):
    if winner == "Yash":
        return 21, 2
    elif winner == "Nishant":
        return 2, 21
    else:
        return 9, 9


# ---------------- CREATE MATCH (PROTECTED) ----------------
@app.post("/api/matches")
async def create_match(
    data: dict,
    x_password: str = Header(None)
):
    await verify_password(x_password)

    yash_points, nishant_points = calculate_points(data["winner"])

    match = {
        "id": str(uuid.uuid4()),
        "match_date": data["match_date"],
        "winner": data["winner"],
        "yash_points": yash_points,
        "nishant_points": nishant_points,
        "notes": data.get("notes", ""),
        "created_at": datetime.utcnow().isoformat()
    }

    await collection.insert_one(match)
    match.pop("_id", None)  # Remove MongoDB ObjectId before returning

    return match


# ---------------- GET MATCHES (PUBLIC) ----------------
@app.get("/api/matches")
async def get_matches():
    matches = []
    async for m in collection.find({}, {"_id": 0}).sort("match_date", -1):
        matches.append(m)
    return matches


# ---------------- UPDATE MATCH (PROTECTED) ----------------
@app.put("/api/matches/{match_id}")
async def update_match(
    match_id: str,
    data: dict,
    x_password: str = Header(None)
):
    await verify_password(x_password)

    match = await collection.find_one({"id": match_id})

    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    update_data = {}

    if "match_date" in data:
        update_data["match_date"] = data["match_date"]

    if "winner" in data:
        yash_points, nishant_points = calculate_points(data["winner"])
        update_data.update({
            "winner": data["winner"],
            "yash_points": yash_points,
            "nishant_points": nishant_points
        })

    if "notes" in data:
        update_data["notes"] = data["notes"]

    await collection.update_one({"id": match_id}, {"$set": update_data})

    updated = await collection.find_one({"id": match_id}, {"_id": 0})
    return updated


# ---------------- DELETE MATCH (PROTECTED) ----------------
@app.delete("/api/matches/{match_id}")
async def delete_match(
    match_id: str,
    x_password: str = Header(None)
):
    await verify_password(x_password)

    await collection.delete_one({"id": match_id})
    return {"message": "Match deleted successfully"}


# ---------------- STATS (PUBLIC) ----------------
@app.get("/api/stats")
async def get_stats():
    yash_total = 0
    nishant_total = 0
    yash_wins = 0
    nishant_wins = 0
    draws = 0
    total_matches = 0

    async for m in collection.find({}, {"_id": 0}):
        total_matches += 1
        yash_total += m["yash_points"]
        nishant_total += m["nishant_points"]

        if m["winner"] == "Yash":
            yash_wins += 1
        elif m["winner"] == "Nishant":
            nishant_wins += 1
        else:
            draws += 1

    tournament_start = date(2026, 4, 4)
    tournament_end = date(2026, 4, 24)
    today = date.today()

    if today < tournament_start:
        current_day = 0
        days_remaining = 21
    elif today > tournament_end:
        current_day = 21
        days_remaining = 0
    else:
        days_passed = (today - tournament_start).days
        current_day = days_passed + 1
        days_remaining = 21 - current_day

    return {
        "yash_total_points": yash_total,
        "nishant_total_points": nishant_total,
        "total_matches": total_matches,
        "yash_wins": yash_wins,
        "nishant_wins": nishant_wins,
        "draws": draws,
        "tournament_start_date": str(tournament_start),
        "tournament_end_date": str(tournament_end),
        "current_day": current_day,
        "days_remaining": days_remaining
    }