'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definimos la forma que tu página espera
interface Game {
  id: number;
  name: string;
  slug: string;
  coverUrl: string;
  score?: number;     
  genres?: string[];  
}

interface FavoritesContextType {
  favorites: Game[];
  addFavorite: (game: Game) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Game[]>([]);

  // 1. CARGAR FAVORITOS + ENRIQUECER DATOS
  const loadFavorites = async () => {
    const session = localStorage.getItem('user_session');
    if (!session) return;

    try {
      const user = JSON.parse(session);
      
      // A. Pedimos los Favoritos Simples (ID, Nombre, Foto)
      const resFavs = await fetch(`http://127.0.0.1:8001/api/users/${user.id}/favorites`);
      
      // B. Pedimos el Catálogo Completo (Para sacar Score y Géneros)
      // Nota: Si el catálogo es muy grande, esto debería optimizarse en backend, pero para <1000 juegos va perfecto.
      const resCatalog = await fetch(`http://127.0.0.1:8001/api/catalog?limit=1000&page=1`);

      if (resFavs.ok) {
        const favsData = await resFavs.json();
        let catalogData: any[] = [];
        
        if (resCatalog.ok) {
            catalogData = await resCatalog.json();
        }
        
        // C. CRUCE DE DATOS (JOIN)
        const enrichedFavorites: Game[] = favsData.map((favItem: any) => {
            // Buscamos el juego completo en el catálogo usando el ID
            const fullGameInfo = catalogData.find((g: any) => g.id === favItem.game_id);

            return {
                id: favItem.game_id,
                name: favItem.game_name,
                slug: favItem.game_slug,
                coverUrl: favItem.cover_url,
                // Si encontramos info extra en el catálogo, la usamos. Si no, default.
                score: fullGameInfo ? fullGameInfo.score : 0, 
                genres: fullGameInfo ? fullGameInfo.genres : ['All'] 
            };
        });
        
        setFavorites(enrichedFavorites);
        
        // Guardamos IDs en localStorage para acceso rápido visual
        const ids = enrichedFavorites.map(g => g.id);
        localStorage.setItem('user_favorites_ids', JSON.stringify(ids));
      }
    } catch (error) {
      console.error("Error cargando contexto de favoritos:", error);
    }
  };

  useEffect(() => {
    loadFavorites();
    window.addEventListener('favorites_updated', loadFavorites);
    return () => window.removeEventListener('favorites_updated', loadFavorites);
  }, []);

  // 2. AGREGAR FAVORITO
  const addFavorite = async (game: Game) => {
    const session = localStorage.getItem('user_session');
    if (!session) return alert("Inicia sesión primero");
    const user = JSON.parse(session);

    try {
      // Optimistic UI: Agregamos con todos los datos que nos pasen (incluido score/genres)
      setFavorites(prev => [...prev, game]); 

      await fetch(`http://127.0.0.1:8001/api/favorites?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: game.id,
          game_name: game.name,
          game_slug: game.slug,
          cover_url: game.coverUrl
        })
      });
      // Recargamos en segundo plano para asegurar consistencia
      loadFavorites(); 
    } catch (error) {
      console.error("Error al agregar:", error);
      loadFavorites(); 
    }
  };

  // 3. ELIMINAR FAVORITO
  const removeFavorite = async (id: number) => {
    const session = localStorage.getItem('user_session');
    if (!session) return;
    const user = JSON.parse(session);

    try {
      setFavorites(prev => prev.filter(g => g.id !== id));

      await fetch(`http://127.0.0.1:8001/api/favorites/${user.id}/${id}`, {
        method: 'DELETE'
      });
      
      const currentIds = JSON.parse(localStorage.getItem('user_favorites_ids') || '[]');
      const newIds = currentIds.filter((fid: number) => fid !== id);
      localStorage.setItem('user_favorites_ids', JSON.stringify(newIds));
      
      window.dispatchEvent(new Event("favorites_updated"));

    } catch (error) {
      console.error("Error al eliminar:", error);
      loadFavorites(); 
    }
  };

  const isFavorite = (id: number) => favorites.some(g => g.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de un FavoritesProvider');
  }
  return context;
};