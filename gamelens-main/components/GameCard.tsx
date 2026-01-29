'use client';

import React from 'react';
import Link from 'next/link';
import { Star, Heart, Plus, Check } from 'lucide-react';
import { useFavorites } from '@/app/context/FavoritesContext';
import { useCollection } from '@/app/context/CollectionContext';

interface GameCardProps {
  game: any;
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const safeId = Number(game.id || game.game_id); 
  const safeName = game.name || game.game_name || "Juego sin nombre";
  const safeSlug = game.slug || game.game_slug || "no-slug";
  const safeCover = game.coverUrl || game.cover_url || game.background_image || "/placeholder.jpg";
  const safeScore = typeof game.score === 'number' ? Math.round(game.score) : 0;

  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  // Traemos removeFromCollection también
  const { addToCollection, removeFromCollection, isInCollection } = useCollection();

  const isFav = isFavorite(safeId);
  const isInCol = isInCollection(safeId);

  const scoreColor = safeScore >= 90 ? 'text-green-400' : 
                     safeScore >= 80 ? 'text-yellow-400' : 
                                      'text-orange-400';

  if (!safeId) return null;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (isFav) removeFavorite(safeId);
    else addFavorite({ id: safeId, name: safeName, slug: safeSlug, coverUrl: safeCover });
  };

  const handleCollectionClick = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (isInCol) {
        // 🔥 AHORA SÍ DESTILDA (BORRA)
        removeFromCollection(safeId);
    } else {
        addToCollection({ id: safeId, name: safeName, slug: safeSlug, coverUrl: safeCover }, 'owned');
    }
  };

  return (
    <div className="relative group w-full">
      <Link href={`/game/${safeSlug}`} className="block w-full">
        <div className="bg-neutral-900 p-3 rounded-2xl flex items-center space-x-4 
                        hover:bg-neutral-800 transition duration-300 transform hover:translate-x-1
                        border border-neutral-800 hover:border-blue-500/80 shadow-2xl relative">
          
          <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden rounded-xl shadow-md bg-cover bg-center border border-neutral-700/50"
               style={{ backgroundImage: `url(${safeCover})` }} />
          
          <div className="flex-grow min-w-0 pr-24">
            <h3 className="text-lg font-semibold truncate text-white hover:text-blue-400 transition-colors">
              {safeName}
            </h3>
            <div className="flex items-center mt-1">
              <Star size={16} fill="currentColor" className={`mr-1 ${scoreColor}`} />
              <span className={`font-bold text-sm ${scoreColor}`}>{safeScore}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* 🔥 BOTONES SIN CÍRCULOS (Iconos limpios) */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 z-20 flex gap-3">
          
          {/* Botón Colección */}
          <button
            onClick={handleCollectionClick}
            className={`transition-all transform hover:scale-125 active:scale-95 ${
                isInCol 
                ? 'text-green-500' // Solo color verde si está
                : 'text-neutral-500 hover:text-white' // Gris a Blanco si no está
            }`}
            title={isInCol ? "Remove from Collection" : "Add to Collection"}
          >
            {isInCol ? <Check size={22} strokeWidth={3} /> : <Plus size={22} />}
          </button>

          {/* Botón Favorito */}
          <button
            onClick={handleFavoriteClick}
            className={`transition-all transform hover:scale-125 active:scale-95 ${
                isFav 
                ? "text-pink-500" // Solo color rosa si es fav
                : "text-neutral-500 hover:text-pink-500" // Gris a Rosa si no es
            }`}
          >
            <Heart 
              size={22} 
              className={isFav ? "fill-current" : ""} 
            />
          </button>
      </div>
    </div>
  );
};