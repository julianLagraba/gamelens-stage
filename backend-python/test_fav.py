# test_fav.py
from database import SessionLocal, engine
from models import Base, User, Favorite

# 1. Crear tablas si no existen
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# 2. Buscar o Crear Usuario de prueba
user = db.query(User).filter(User.username == "TestUser").first()
if not user:
    print("Creando usuario de prueba...")
    user = User(username="TestUser", email="test@test.com", hashed_password="pw")
    db.add(user)
    db.commit()
    db.refresh(user)

print(f"Usuario activo: ID {user.id}")

# 3. Intentar agregar favorito
try:
    print("Intentando agregar favorito...")
    new_fav = Favorite(
        user_id=user.id,
        game_id=12345,
        game_name="Juego de Prueba",
        game_slug="test-game",
        cover_url="http://imagen.com/img.jpg"
    )
    db.add(new_fav)
    db.commit()
    print("✅ ¡ÉXITO! Favorito guardado en la base de datos.")
    
    # Verificar que se guardó
    favs = db.query(Favorite).filter(Favorite.user_id == user.id).all()
    print(f"Favoritos totales del usuario: {len(favs)}")
    
except Exception as e:
    print(f"❌ ERROR CRÍTICO: {e}")

db.close()