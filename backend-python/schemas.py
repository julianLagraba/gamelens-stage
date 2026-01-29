from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# Lo que recibimos del Frontend al registrarse
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

# Lo que devolvemos al Frontend
class UserOut(BaseModel):
    id: int
    email: str
    username: str
    is_active: bool
    
    # Datos de Perfil
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None

    level: int = 1
    xp: int = 0

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None
    location: Optional[str] = None
    favorite_platform: Optional[str] = None

class FavoriteCreate(BaseModel):
    game_id: int
    game_name: str
    game_slug: str
    cover_url: str

class FavoriteOut(FavoriteCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    cover_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None


class GameStatusBase(BaseModel):
    game_id: int
    game_slug: str
    game_name: str
    cover_url: str
    status: str 

class GameStatusCreate(GameStatusBase):
    pass

class GameStatusOut(GameStatusBase):
    id: int
    user_id: int
    updated_at: Optional[str] = None

    class Config:
        from_attributes = True

class FriendRequestCreate(BaseModel):
    sender_id: int
    target_username: str

class RequestAction(BaseModel):
    action: str # "accept" o "reject"

class AchievementDetail(BaseModel):
    id: int
    title: str
    description: str
    game_name: str
    icon_name: str
    color: str
    rarity: str
    class Config:
        from_attributes = True

class UserAchievementOut(BaseModel):
    id: int
    user_id: int
    achievement_id: int
    unlocked_at: str
    
    achievement: AchievementDetail 

    class Config:
        from_attributes = True

# --- CHAT ---
class MessageCreate(BaseModel):
    receiver_id: int
    content: str

class MessageOut(BaseModel):
    id: int
    sender_id: int
    receiver_id: int
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True