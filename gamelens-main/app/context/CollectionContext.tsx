'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Definimos los tipos
type CollectionItem = {
  id: number; 
  game_id: number;
  game_name: string; 
  game_slug: string;
  cover_url: string; 
  status: string;
  user_id: number; // Agregamos user_id para seguridad interna
};

type CollectionContextType = {
  collection: CollectionItem[];
  addToCollection: (game: any, status?: string) => Promise<void>;
  removeFromCollection: (gameId: number) => Promise<void>;
  updateStatus: (gameId: number, status: string) => Promise<void>; // Agregamos esta función explícita
  isInCollection: (gameId: number) => boolean;
};

const CollectionContext = createContext<CollectionContextType | undefined>(undefined);

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [collection, setCollection] = useState<CollectionItem[]>([]);
  // Estado para saber quién es el usuario actual y disparar recargas si cambia
  const [userId, setUserId] = useState<number | null>(null);

  // 1. DETECTOR DE USUARIO (Esto arregla el problema de Juli/Orne)
  useEffect(() => {
    const checkUser = () => {
      const storedSession = localStorage.getItem('user_session');
      if (storedSession) {
        try {
          const user = JSON.parse(storedSession);
          setUserId(user.id);
        } catch {
          setUserId(null);
        }
      } else {
        setUserId(null);
        setCollection([]); // Si no hay sesión, limpiamos la colección visual
      }
    };

    // Revisar al montar
    checkUser();
    
    // Revisar si cambia el storage (por si logueas en otra pestaña o sales)
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  // 2. CARGA DE DATOS (Depende estrictamente de userId)
  useEffect(() => {
    // Si no hay usuario identificado, no cargamos nada (o borramos lo anterior)
    if (!userId) {
      setCollection([]);
      return;
    }

    const fetchCollection = async () => {
      try {
        // Usamos puerto 8000 como acordamos
        const res = await fetch(`http://localhost:8001/api/users/${userId}/activity`);
        if (res.ok) {
          const data = await res.json();
          setCollection(data);
        } else {
          setCollection([]);
        }
      } catch (error) { 
        console.warn("Esperando conexión de colección..."); 
        setCollection([]);
      }
    };

    fetchCollection();
  }, [userId]); // <--- ESTO ES LA CLAVE: Se ejecuta cada vez que cambia el ID

  // --- FUNCIONES ---

  const isInCollection = (gameId: number) => collection.some(item => item.game_id === gameId);

  const addToCollection = async (game: any, status: string = 'owned') => {
    if (!userId) { alert("Please login"); return; }

    // 1. Preparamos datos SEGUROS
    const safeCover = game.coverUrl || game.background_image || game.cover_url || "https://placehold.co/600x900?text=No+Cover";
    const safeName = game.name || game.game_name || "Unknown Game";
    const safeSlug = game.slug || game.game_slug || "unknown-slug";
    const safeId = Number(game.id || game.game_id);

    const tempItem = {
        id: Date.now(), 
        game_id: safeId, 
        game_name: safeName,
        game_slug: safeSlug, 
        cover_url: safeCover, 
        status: status,
        user_id: userId
    };
    
    // Optimismo UI
    if (!isInCollection(safeId)) {
        setCollection(prev => [...prev, tempItem]);
    } else {
        setCollection(prev => prev.map(item => 
            item.game_id === safeId ? { ...item, status: status } : item
        ));
    }

    try {
      // 🔥 AQUÍ ESTABA EL ERROR: FALTABA "?user_id=${userId}" AL FINAL DE LA URL
      const res = await fetch(`http://localhost:8001/api/game-status?user_id=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: safeId, 
          game_name: safeName, 
          game_slug: safeSlug,
          cover_url: safeCover,
          status: status
        })
      });

      if (res.ok) {
         const newItem = await res.json();
         setCollection(prev => prev.map(item => item.game_id === safeId ? newItem : item));
      } else {
         console.error("Error backend:", await res.text());
         // Rollback si falla
         setCollection(prev => prev.filter(g => g.id !== tempItem.id));
      }
    } catch (error) { console.error(error); }
  };

  const removeFromCollection = async (gameId: number) => {
    if (!userId) return;

    setCollection(prev => prev.filter(item => item.game_id !== gameId));

    try {
      await fetch(`http://localhost:8001/api/game-status?user_id=${userId}&game_id=${gameId}`, {
        method: 'DELETE',
      });
    } catch (error) { console.error(error); }
  };

 const updateStatus = async (gameId: number, status: string) => {
    if (!userId) return;

    const game = collection.find(g => g.game_id === gameId);
    if (!game) return;

    // UI Optimista
    setCollection(prev => prev.map(item => 
        item.game_id === gameId ? { ...item, status: status } : item
    ));

    // Reutilizamos addToCollection que ya está blindada
    // IMPORTANTE: Pasamos los datos normalizados
    const gameDataForBackend = {
        id: game.game_id,
        name: game.game_name,
        slug: game.game_slug,
        coverUrl: game.cover_url // Usamos la key que addToCollection espera leer
    };

    // Llamamos a la función segura
    addToCollection(gameDataForBackend, status);
  };

  return (
    <CollectionContext.Provider value={{ collection, addToCollection, removeFromCollection, updateStatus, isInCollection }}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const context = useContext(CollectionContext);
  if (context === undefined) throw new Error('useCollection must be used within Provider');
  return context;
}