from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models

# Asegurar tablas
models.Base.metadata.create_all(bind=engine)

def seed_data():
    db = SessionLocal()
    try:
        print("🌱 Creando Catálogo de Logros (Sin asignar a usuarios)...")
        
        achievements_data = [
            # Nivel 1: Fáciles
            { "game_slug": "gamelens", "game_name": "GameLens App", "title": "GameLens Initiate", "description": "Create your account.", "icon_name": "Shield", "color": "#CD7F32", "rarity": "Common" },
            { "game_slug": "gamelens", "game_name": "GameLens App", "title": "Library Builder", "description": "Have 5 games in your collection.", "icon_name": "Trophy", "color": "#50a2ff", "rarity": "Rare" },
            { "game_slug": "gamelens", "game_name": "GameLens App", "title": "Social Butterfly", "description": "Send a friend request.", "icon_name": "Target", "color": "#00FF62", "rarity": "Rare" },
            
            # Nivel 2: Difíciles
            { "game_slug": "gamelens", "game_name": "GameLens App", "title": "The Completionist", "description": "Mark a game as Completed.", "icon_name": "Medal", "color": "#a855f7", "rarity": "Epic" },
            { "game_slug": "gamelens", "game_name": "GameLens App", "title": "Power User", "description": "Log in.", "icon_name": "Zap", "color": "#efb537", "rarity": "Legendary" }
        ]

        for ach_data in achievements_data:
            existing = db.query(models.Achievement).filter(models.Achievement.title == ach_data["title"]).first()
            if not existing:
                new_ach = models.Achievement(**ach_data)
                db.add(new_ach)
                db.commit()
                print(f"✅ Definición creada: {new_ach.title}")
            else:
                print(f"ℹ️ Ya existe definición: {existing.title}")

        print("\n🚀 Catálogo listo. Ahora usa la app para desbloquearlos.")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()