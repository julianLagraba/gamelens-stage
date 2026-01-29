'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Definimos la forma que tu página espera (según tu código)
interface Game {
  id: number;
  name: string;
  slug: string;
  coverUrl: string;
  score?: number;     // Opcional, porque la DB simple a veces no lo tiene
  genres?: string[];  // Opcional, para los filtros
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

  // 1. CARGAR FAVORITOS AL INICIAR
  const loadFavorites = async () => {
    const session = localStorage.getItem('user_session');
    if (!session) return;

    try {
      const user = JSON.parse(session);
      // Pedimos los datos a Python
      const res = await fetch(`http://127.0.0.1:8001/api/users/${user.id}/favorites`);
      
      if (res.ok) {
        const data = await res.json();
        
        // ADAPTADOR: Convertimos los datos de Python (snake_case) a lo que tu página usa (camelCase)
        const adaptedGames: Game[] = data.map((item: any) => ({
          id: item.game_id,
          name: item.game_name,
          slug: item.game_slug,
          coverUrl: item.cover_url, // Aquí arreglamos el problema de la imagen
          // Como la tabla de favoritos simple no guarda score/género, ponemos defaults para que no rompa los filtros
          score: 0, 
          genres: ['All'] 
        }));
        
        setFavorites(adaptedGames);
        
        // Guardamos IDs en localStorage para acceso rápido en otros componentes
        const ids = adaptedGames.map(g => g.id);
        localStorage.setItem('user_favorites_ids', JSON.stringify(ids));
      }
    } catch (error) {
      console.error("Error cargando contexto de favoritos:", error);
    }
  };

  useEffect(() => {
    loadFavorites();
    // Escuchar evento por si otro componente actualiza algo
    window.addEventListener('favorites_updated', loadFavorites);
    return () => window.removeEventListener('favorites_updated', loadFavorites);
  }, []);

  // 2. FUNCIÓN AGREGAR (Para usar desde Detalle o Cards)
  const addFavorite = async (game: Game) => {
    const session = localStorage.getItem('user_session');
    if (!session) return alert("Inicia sesión primero");
    const user = JSON.parse(session);

    try {
      // Optimistic UI: Lo agregamos visualmente antes de que el server responda
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
      // Actualizamos la lista real para asegurar IDs
      loadFavorites();
    } catch (error) {
      console.error("Error al agregar:", error);
      loadFavorites(); // Revertimos si falló
    }
  };

  // 3. FUNCIÓN ELIMINAR (La que usa tu botón de basura)
  const removeFavorite = async (id: number) => {
    const session = localStorage.getItem('user_session');
    if (!session) return;
    const user = JSON.parse(session);

    try {
      // Optimistic UI: Lo sacamos visualmente ya
      setFavorites(prev => prev.filter(g => g.id !== id));

      await fetch(`http://127.0.0.1:8001/api/favorites/${user.id}/${id}`, {
        method: 'DELETE'
      });
      
      // Actualizamos localStorage de IDs
      const currentIds = JSON.parse(localStorage.getItem('user_favorites_ids') || '[]');
      const newIds = currentIds.filter((fid: number) => fid !== id);
      localStorage.setItem('user_favorites_ids', JSON.stringify(newIds));
      
      // Avisamos al resto de la app
      window.dispatchEvent(new Event("favorites_updated"));

    } catch (error) {
      console.error("Error al eliminar:", error);
      loadFavorites(); // Revertimos
    }
  };

  const isFavorite = (id: number) => favorites.some(g => g.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

// Hook personalizado para usarlo fácil
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites debe usarse dentro de un FavoritesProvider');
  }
  return context;
};