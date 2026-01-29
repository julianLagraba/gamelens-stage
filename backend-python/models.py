from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    
    # Perfil
    avatar_url = Column(String, nullable=True)
    cover_url = Column(String, nullable=True)
    location = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    
    # Gamification
    xp = Column(Integer, default=0)
    level = Column(Integer, default=1)

    role = Column(String, default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relación
    favorites = relationship("Favorite", back_populates="owner")
    game_statuses = relationship("GameStatus", back_populates="owner")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    game_id = Column(Integer)
    game_name = Column(String)
    game_slug = Column(String)
    cover_url = Column(String)
    
    added_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="favorites")

class FriendRequest(Base):
    __tablename__ = "friend_requests"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")


class GameStatus(Base):
    __tablename__ = "game_status"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    game_id = Column(Integer) # ID de RAWG
    game_slug = Column(String)
    game_name = Column(String)
    cover_url = Column(String)
    
    status = Column(String) 
    updated_at = Column(String) 

    owner = relationship("User", back_populates="game_statuses")

class Achievement(Base):
    __tablename__ = "achievements"
    id = Column(Integer, primary_key=True, index=True)
    game_slug = Column(String) 
    game_name = Column(String)
    title = Column(String)
    description = Column(String)
    icon_name = Column(String) 
    color = Column(String)
    rarity = Column(String) 

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    unlocked_at = Column(String)
    achievement = relationship("Achievement", lazy="joined")

# --- CHAT ---
class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())