import os
import time
import random
import re
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Depends, status
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime
from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import relationship, Session, joinedload

# Importamos DB
from database import engine, get_db
# Importamos modelos y esquemas (Asegúrate de que models.py y schemas.py tengan lo que te pasé antes)
import models
import schemas

# Configuración inicial
models.Base.metadata.create_all(bind=engine)
load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Lo que pasa al iniciar
    print("🚀 Server iniciando...")
    yield
    print("🛑 Server apagándose... Liberando recursos.")
    engine.dispose() 

app = FastAPI(lifespan=lifespan) 

# Configuración de seguridad
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CLIENT_ID = os.getenv("TWITCH_CLIENT_ID")
CLIENT_SECRET = os.getenv("TWITCH_CLIENT_SECRET")
IGDB_URL = "https://api.igdb.com/v4"

access_token = None
token_expiry = 0

# --- FUNCIONES DE SEGURIDAD ---
def get_password_hash(password):
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# --- SISTEMA DE LOGROS (NUEVO) ---
def unlock_achievement(user_id: int, achievement_title: str, db: Session):
    try:
        # 1. Buscar logro
        achievement = db.query(models.Achievement).filter(models.Achievement.title == achievement_title).first()
        if not achievement: return None

        # 2. Verificar si ya lo tiene
        exists = db.query(models.UserAchievement).filter(
            models.UserAchievement.user_id == user_id,
            models.UserAchievement.achievement_id == achievement.id
        ).first()
        if exists: return None

        # 3. Asignar
        new_unlock = models.UserAchievement(
            user_id=user_id,
            achievement_id=achievement.id,
            unlocked_at=datetime.now().strftime("%Y-%m-%d")
        )
        db.add(new_unlock)
        
        # 4. XP
        user = db.query(models.User).filter(models.User.id == user_id).first()
        if user:
            user.xp = (user.xp or 0) + 50
            user.level = (user.xp // 1000) + 1
        
        db.commit()
        print(f"🏆 LOGRO: {achievement_title} -> User {user_id}")
    except Exception as e:
        print(f"Error logro: {e}")

# --- FUNCIONES DE AYUDA (IGDB) ---
async def get_igdb_token():
    global access_token, token_expiry
    if access_token and time.time() < token_expiry:
        return access_token

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                "https://id.twitch.tv/oauth2/token",
                params={
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "grant_type": "client_credentials"
                }
            )
            data = response.json()
            access_token = data["access_token"]
            token_expiry = time.time() + data["expires_in"] - 60
            return access_token
        except:
            return None

async def igdb_request(endpoint: str, query: str):
    token = await get_igdb_token()
    if not token: return []
    
    headers = {"Client-ID": CLIENT_ID, "Authorization": f"Bearer {token}"}
    async with httpx.AsyncClient() as client:
        try:
            # Timeout agregado para evitar que se cuelgue el front si IGDB falla
            response = await client.post(f"{IGDB_URL}/{endpoint}", headers=headers, data=query, timeout=10.0)
            if response.status_code != 200:
                print(f"❌ Error IGDB {response.status_code}: {response.text}")
                return []
            return response.json()
        except Exception as e:
            print(f"⚠️ Error conexión IGDB: {e}")
            return []

def fix_image_url(url: str, size: str = "t_1080p") -> str:
    if not url: return "https://placehold.co/1920x1080/1a1a1a/ffffff?text=No+Image"
    if url.startswith("//"): url = "https:" + url
    return url.replace("t_thumb", size)

def get_smart_images(game_data):
    steam_id = None
    if "external_games" in game_data:
        for ext in game_data["external_games"]:
            try:
                cat = int(ext.get("category", 0))
                if cat == 1 or cat == 13: 
                    steam_id = ext.get("uid")
                    break
            except: continue

    igdb_cover = fix_image_url(game_data.get("cover", {}).get("url", ""), "t_1080p")
    hero_url = ""
    cover_url = igdb_cover 
    
    if steam_id:
        hero_url = f"https://cdn.akamai.steamstatic.com/steam/apps/{steam_id}/library_hero.jpg"
        cover_url = f"https://cdn.akamai.steamstatic.com/steam/apps/{steam_id}/library_600x900_2x.jpg"
    
    if not hero_url and "artworks" in game_data and game_data["artworks"]:
        hero_url = fix_image_url(game_data["artworks"][0]["url"], "t_1080p")
        
    if not hero_url: hero_url = cover_url

    screenshots = []
    if "screenshots" in game_data:
        raw_screens = [s["url"] for s in game_data["screenshots"]]
        screenshots = [fix_image_url(s, "t_1080p") for s in raw_screens[:4]]

    return hero_url, cover_url, screenshots, steam_id

# Tu función completa de KPIs (La mantengo intacta)
def generate_simulated_kpis(base_score, seed_id):
    try:
        random.seed(seed_id)
        ccu = random.randint(5000, 800000)
        peak = int(ccu * (1 + random.random()))
        timeline = [{"hour": f"{h:02d}:00", "players": int(ccu * (0.8 + (random.random() * 0.4)))} for h in range(0, 24, 2)]
        weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly = [{"weekday": day, "avgPlayers": int(ccu * (0.9 + random.random() * 0.3))} for day in weekdays]

        return {
            "kpiSeries": {
                "topCountries": [{"country": "US", "code": "US", "weight": 40}, {"country": "BR", "code": "BR", "weight": 20}],
                "peakPlayers": peak, "score": int(base_score), "currentPlayers": ccu, "players24hChangePercent": round(random.uniform(-10, 10), 2)
            },
            "rankingMovement": { "currentRank": random.randint(1, 100), "change": random.choice([-1, 0, 1]), "history": [] },
            "platformDistribution": [{ "platform": "PC", "percent": 60 }, { "platform": "Console", "percent": 40 }],
            "retention": { "d1": random.randint(50, 80), "d2": random.randint(30, 50), "d3": random.randint(10, 30) },
            "userReviews": { "positivePercent": int(base_score) + 5 if base_score < 90 else 95, "mixedPercent": 10, "negativePercent": 5, "starsDistribution": {"5": 70, "4": 20, "3": 5, "2": 2, "1": 3} },
            "peakHours": timeline,
            "players": { "activity24h": ccu, "peakAllTime": peak },
            "activityByWeekday": weekly,
            "activity24hTimeline": timeline,
            "rating": { "starsAverage": round(base_score / 20, 1), "numeric": round(base_score / 10, 1), "totalReviews": random.randint(1000, 50000), "starsDistribution": {"5": 70, "4": 20, "3": 5, "2": 2, "1": 3} }
        }
    except:
        return {}

# ==========================================
# ENDPOINTS
# ==========================================

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Backend running"}

# --- AUTH ---
@app.post("/api/auth/register", response_model=schemas.UserOut)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    db_username = db.query(models.User).filter(models.User.username == user.username).first()
    if db_username:
        raise HTTPException(status_code=400, detail="El ID de Gamer ya está en uso")

    hashed_pw = get_password_hash(user.password)
    auto_avatar = f"https://api.dicebear.com/7.x/avataaars/svg?seed={user.username}"
    
    new_user = models.User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_pw,
        avatar_url=auto_avatar,
        role="user"
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user) 
    
    unlock_achievement(new_user.id, "GameLens Initiate", db)
    
    return new_user

@app.post("/api/auth/login")
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    
    if not verify_password(user_credentials.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "avatar_url": user.avatar_url,
        "role": user.role,
        "xp": user.xp or 0,        # Devolvemos XP
        "level": user.level or 1   # Devolvemos Nivel
    }

# --- USERS ---
@app.get("/api/users/{user_id}", response_model=schemas.UserOut)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.put("/api/users/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, user_update: schemas.UserUpdate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if user_update.username: db_user.username = user_update.username
    if user_update.avatar_url: db_user.avatar_url = user_update.avatar_url
    if user_update.cover_url: db_user.cover_url = user_update.cover_url
    if user_update.location: db_user.location = user_update.location
    if user_update.bio: db_user.bio = user_update.bio
    
    db.commit()
    db.refresh(db_user)
    return db_user

# --- GAMES (IGDB) ---
@app.get("/api/home")
async def get_home_data():
    query = """
    fields name, slug, cover.url, total_rating, genres.name, first_release_date, 
    artworks.url, screenshots.url, external_games.category, external_games.uid;
    where cover != null & total_rating > 60; 
    sort popularity desc;
    limit 20;
    """
    
    data = await igdb_request("games", query)
    
    if not data: 
        print("❌ API IGDB devolvió vacío (Revisar credenciales o conexión)")
        # Devolver estructura vacía para no romper el front
        return {"games": [], "featuredGame": None}

    games_list = []
    featured_game = None

    for i, g in enumerate(data):
        hero_url, cover_url, _, _ = get_smart_images(g)
        game_obj = {
            "id": g["id"], 
            "slug": g["slug"], 
            "name": g["name"], 
            "coverUrl": cover_url,
            "score": int(g.get("total_rating", 0)), 
            "isFavorite": False,
            "genres": [gen["name"] for gen in g.get("genres", [])][:3]
        }
        games_list.append(game_obj)
        
        if i == 0:
            score_val = game_obj["score"] if game_obj["score"] > 0 else 85
            sim_data = generate_simulated_kpis(score_val, g["id"])
            featured_game = { 
                **game_obj, 
                "reviewCount": sim_data["rating"]["totalReviews"], 
                "coverUrl": hero_url, 
                **sim_data 
            }

    return { 
        "user": { "id": 99, "name": "Admin" }, 
        "games": games_list, 
        "featuredGame": featured_game 
    }

@app.get("/api/catalog")
async def get_game_catalog(page: int = 1, limit: int = 24):
    offset = (page - 1) * limit
    query = f"""
    fields name, slug, cover.url, total_rating, genres.name, first_release_date, external_games.category, external_games.uid;
    where total_rating > 70 & total_rating_count > 20 & cover != null & themes != (42);
    sort total_rating_count desc;
    limit {limit};
    offset {offset};
    """
    data = await igdb_request("games", query)
    results = []
    if not data: return []
    for g in data:
        hero_url, cover_url, _, _ = get_smart_images(g)
        results.append({
            "id": g["id"], "slug": g["slug"], "name": g["name"], "coverUrl": cover_url,
            "score": int(g.get("total_rating", 0)) if "total_rating" in g else 0,
            "genres": [gen["name"] for gen in g.get("genres", [])][:2]
        })
    return results

@app.get("/api/search")
async def search_games(q: str = Query(..., min_length=2)):
    query = f"""
    fields name, slug, cover.url, total_rating, first_release_date; 
    search "{q}"; 
    where cover != null; 
    limit 24;
    """
    data = await igdb_request("games", query)
    results = []
    if not data: return []
    for g in data:
        results.append({
            "id": g["id"], 
            "slug": g["slug"], 
            "name": g["name"],
            "coverUrl": fix_image_url(g.get("cover", {}).get("url", ""), "t_720p"),
            "score": int(g.get("total_rating", 0)) if "total_rating" in g else None,
            "year": time.strftime('%Y', time.gmtime(g.get("first_release_date", 0))) if "first_release_date" in g else ""
        })
    return results

@app.get("/api/games/{slug}")
async def get_game_detail(slug: str):
    print(f"🔍 Buscando juego: {slug}")
    fields = "fields name, slug, summary, total_rating, first_release_date, cover.url, screenshots.url, artworks.url, genres.name, involved_companies.company.name, involved_companies.publisher, external_games.category, external_games.uid;"
    query = f'{fields} where slug = "{slug}";'
    data = await igdb_request("games", query)
    
    if not data:
        search_term = slug.replace("-", " ")
        search_query = f'{fields} search "{search_term}"; limit 1;'
        data = await igdb_request("games", search_query)

    if not data: raise HTTPException(status_code=404, detail="Juego no encontrado")
        
    game = data[0]
    hero_url, cover_url, screenshots, steam_id = get_smart_images(game)

    real_requirements = {
        "min": {"os": "Win 10", "cpu": "N/A", "ram": "8 GB", "gpu": "N/A"},
        "rec": {"os": "Win 10", "cpu": "N/A", "ram": "16 GB", "gpu": "N/A"}
    }

    developer = "Unknown"
    publisher = "Unknown"
    if "involved_companies" in game:
        for item in game["involved_companies"]:
            comp_name = item.get("company", {}).get("name", "Unknown")
            if item.get("publisher", False): publisher = comp_name
            else: developer = comp_name

    score_real = int(game.get("total_rating", 75))
    sim_data = generate_simulated_kpis(score_real, game["id"])

    return {
        "id": game["id"], "slug": game["slug"], "name": game["name"], "storeUrl": f"https://store.steampowered.com/search/?term={game['slug']}", "isFavorite": False,
        "images": { "hero": hero_url, "cover": cover_url, "screenshots": screenshots },
        "meta": {
            "genres": [g["name"] for g in game.get("genres", [])],
            "platforms": ["PC", "PS5", "Xbox"], 
            "developer": developer,
            "publisher": publisher,
            "releaseDate": time.strftime('%Y-%m-%d', time.gmtime(game.get("first_release_date", 0))),
            "description": game.get("summary", "No description available.")
        },
        "requirements": real_requirements, 
        **sim_data
    }

# --- FAVORITOS ---
@app.post("/api/favorites", response_model=schemas.FavoriteOut)
def add_favorite(fav: schemas.FavoriteCreate, user_id: int, db: Session = Depends(get_db)):
    existing = db.query(models.Favorite).filter(models.Favorite.user_id == user_id, models.Favorite.game_id == fav.game_id).first()
    if existing: return existing 
    
    new_fav = models.Favorite(
        user_id=user_id, game_id=fav.game_id, game_name=fav.game_name, game_slug=fav.game_slug, cover_url=fav.cover_url
    )
    db.add(new_fav)
    
    # Sumar XP al agregar favorito
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if user:
        if user.xp is None: user.xp = 0
        user.xp += 10 
        user.level = (user.xp // 1000) + 1 
    db.commit()
    db.refresh(new_fav)
    return new_fav

@app.get("/api/users/{user_id}/favorites", response_model=List[schemas.FavoriteOut])
def get_favorites(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.Favorite).filter(models.Favorite.user_id == user_id).all()

@app.delete("/api/favorites/{user_id}/{game_id}")
def remove_favorite(user_id: int, game_id: int, db: Session = Depends(get_db)):
    fav = db.query(models.Favorite).filter(models.Favorite.user_id == user_id, models.Favorite.game_id == game_id).first()
    if fav:
        db.delete(fav)
        db.commit()
    return {"message": "Deleted"}

# --- GAME STATUS ---
@app.post("/api/game-status", response_model=schemas.GameStatusOut)
def set_game_status(status_data: schemas.GameStatusCreate, user_id: int, db: Session = Depends(get_db)):
    # 1. Buscamos si ya existe el juego en la lista
    existing_status = db.query(models.GameStatus).filter(
        models.GameStatus.user_id == user_id,
        models.GameStatus.game_id == status_data.game_id
    ).first()

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 2. Guardamos o Actualizamos
    if existing_status:
        existing_status.status = status_data.status
        existing_status.updated_at = now
        db.commit()
        db.refresh(existing_status)
        target = existing_status
    else:
        new_status = models.GameStatus(**status_data.dict(), user_id=user_id, updated_at=now)
        db.add(new_status)
        db.commit()
        db.refresh(new_status)
        target = new_status
    
    # --- ZONA DE LOGROS (Asegúrate que esto esté aquí) ---
    print(f"👀 Verificando logros para User {user_id}...")
    
    # Logro: The Completionist
    # Convertimos a minúsculas (.lower()) por si el front manda "Completed"
    if status_data.status.lower() == "completed":
        print("✅ Estado 'completed' detectado. Intentando desbloquear...")
        unlock_achievement(user_id, "The Completionist", db)
    
    # Logro: Library Builder (Contamos cuántos tiene)
    count = db.query(models.GameStatus).filter(models.GameStatus.user_id == user_id).count()
    print(f"📊 Juegos en colección: {count}")
    
    if count >= 5:
        print("✅ Más de 5 juegos. Desbloqueando Library Builder...")
        unlock_achievement(user_id, "Library Builder", db)
        
    return target

@app.get("/api/users/{user_id}/activity", response_model=List[schemas.GameStatusOut])
def get_user_activity(user_id: int, db: Session = Depends(get_db)):
    activity = db.query(models.GameStatus).filter(models.GameStatus.user_id == user_id).all()
    return activity[::-1]

@app.delete("/api/game-status")
def delete_game_status(user_id: int, game_id: int, db: Session = Depends(get_db)):
    status = db.query(models.GameStatus).filter(
        models.GameStatus.user_id == user_id, models.GameStatus.game_id == game_id
    ).first()
    if status:
        db.delete(status)
        db.commit()
        return {"message": "Deleted"}
    return {"message": "Not found"}

# --- ENDPOINTS AMIGOS (¡ARREGLADOS!) ---
# Usamos schemas.FriendRequestCreate en lugar de FriendRequestCreate
@app.post("/api/friends/request")
def send_friend_request(req: schemas.FriendRequestCreate, db: Session = Depends(get_db)):
    # Buscar al usuario destino
    target = db.query(models.User).filter(models.User.username == req.target_username).first()
    if not target:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if target.id == req.sender_id:
        raise HTTPException(status_code=400, detail="No puedes agregarte a ti mismo")

    # Verificar si ya existe solicitud
    existing = db.query(models.FriendRequest).filter(
        ((models.FriendRequest.sender_id == req.sender_id) & (models.FriendRequest.receiver_id == target.id)) |
        ((models.FriendRequest.sender_id == target.id) & (models.FriendRequest.receiver_id == req.sender_id))
    ).first()

    if existing:
        if existing.status == "accepted":
            raise HTTPException(status_code=400, detail="Ya son amigos")
        raise HTTPException(status_code=400, detail="Ya hay una solicitud pendiente")

    new_req = models.FriendRequest(sender_id=req.sender_id, receiver_id=target.id, status="pending")
    db.add(new_req)
    db.commit()
    unlock_achievement(req.sender_id, "Social Butterfly", db)
    return {"message": "Solicitud enviada"}

@app.get("/api/friends/requests/{user_id}")
def get_pending_requests(user_id: int, db: Session = Depends(get_db)):
    requests = db.query(models.FriendRequest).filter(models.FriendRequest.receiver_id == user_id, models.FriendRequest.status == "pending").all()
    
    result = []
    for r in requests:
        sender = db.query(models.User).filter(models.User.id == r.sender_id).first()
        result.append({
            "id": r.id, 
            "name": sender.username,
            "level": sender.level,
            "avatarUrl": sender.avatar_url
        })
    return result

@app.put("/api/friends/request/{request_id}")
def respond_friend_request(request_id: int, action: schemas.RequestAction, db: Session = Depends(get_db)):
    req = db.query(models.FriendRequest).filter(models.FriendRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")

    if action.action == "accept":
        req.status = "accepted"
    elif action.action == "reject":
        db.delete(req) 
    
    db.commit()
    return {"message": f"Solicitud {action.action}ed"}

@app.get("/api/friends/{user_id}")
def get_friends(user_id: int, db: Session = Depends(get_db)):
    friends_relations = db.query(models.FriendRequest).filter(
        ((models.FriendRequest.sender_id == user_id) | (models.FriendRequest.receiver_id == user_id)) & 
        (models.FriendRequest.status == "accepted")
    ).all()

    friends_list = []
    for rel in friends_relations:
        friend_id = rel.receiver_id if rel.sender_id == user_id else rel.sender_id
        friend = db.query(models.User).filter(models.User.id == friend_id).first()
        
        friends_list.append({
            "id": friend.id,
            "name": friend.username,
            "isOnline": False, 
            "level": friend.level,
            "status_en": "Offline", 
            "status_es": "Desconectado",
            "avatarUrl": friend.avatar_url
        })
    
    return friends_list

# --- LOGROS ---
@app.get("/api/users/{user_id}/achievements", response_model=List[schemas.UserAchievementOut])
def get_user_achievements(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.UserAchievement).filter(models.UserAchievement.user_id == user_id).all()

# --- SISTEMA DE CHAT ---

@app.post("/api/chat/send", response_model=schemas.MessageOut)
def send_message(msg: schemas.MessageCreate, sender_id: int = Query(...), db: Session = Depends(get_db)):
    # Verificar que el amigo exista
    receiver = db.query(models.User).filter(models.User.id == msg.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    new_msg = models.Message(
        sender_id=sender_id,
        receiver_id=msg.receiver_id,
        content=msg.content
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg

@app.get("/api/chat/{friend_id}", response_model=List[schemas.MessageOut])
def get_chat_history(friend_id: int, current_user_id: int = Query(...), db: Session = Depends(get_db)):
    # Buscamos mensajes donde:
    # (Yo soy el remitente Y amigo es receptor) O (Amigo es remitente Y yo soy receptor)
    messages = db.query(models.Message).filter(
        ((models.Message.sender_id == current_user_id) & (models.Message.receiver_id == friend_id)) |
        ((models.Message.sender_id == friend_id) & (models.Message.receiver_id == current_user_id))
    ).order_by(models.Message.timestamp.asc()).all()
    
    return messages