'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, Filter, SortAsc, 
  Gamepad2, Star, Trash2 
} from 'lucide-react';

import { Header } from '@/components/Header';
import { VerticalMenu } from '@/components/VerticalMenu';
import { useLanguage } from '@/app/context/LanguageContext';

// 1. IMPORTANTE: Importar el hook del contexto (Ruta relativa para evitar errores)
import { useFavorites } from '../context/FavoritesContext';

export const dynamic = 'force-dynamic';

const PALETTE = {
  CEL_AZUL: '#50a2ff',
  VERDE: '#00FF62',
  AMARILLO: '#efb537',
  LILA: '#b340bf',
  CYAN: '#2DD4E0',
  ROSA: '#f6339a',
  MORADO: '#4530BE',
};

// CLAVES DE FILTRO
const FILTER_KEYS = ['All', 'RPG', 'Indie', 'Action', 'Open World'];
type SortOption = 'score_desc' | 'score_asc' | 'name'; // Sacamos 'date' porque el contexto aun no guarda fecha

export default function FavoritesPage() {
  // 2. USAR EL HOOK REAL: Esto trae los datos guardados en memoria/localstorage
  const { favorites, removeFavorite } = useFavorites();
  
  // Estado local solo para filtros visuales
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('score_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { language } = useLanguage();

  const translations = {
    en: {
        title: 'Favorites',
        subtitle: 'Your personal collection of gems.',
        results: 'Results',
        viewDetails: 'View Details',
        removeTooltip: 'Remove from favorites',
        sortTooltip: 'Sort by...',
        sortOptions: {
            highScore: 'Highest Score',
            name: 'Name (A-Z)'
        },
        filters: { 'All': 'All', 'RPG': 'RPG', 'Indie': 'Indie', 'Action': 'Action', 'Open World': 'Open World' },
        empty: {
            title: 'No favorites yet',
            filterDesc: 'No games found with current filters.',
            generalDesc: 'Explore the library and bookmark the games you like best.',
            button: 'Explore Games'
        }
    },
    es: {
        title: 'Favoritos',
        subtitle: 'Tu colección personal de joyas.',
        results: 'Resultados',
        viewDetails: 'Ver Detalles',
        removeTooltip: 'Eliminar de favoritos',
        sortTooltip: 'Ordenar por...',
        sortOptions: {
            highScore: 'Mayor Puntaje',
            name: 'Nombre (A-Z)'
        },
        filters: { 'All': 'Todos', 'RPG': 'RPG', 'Indie': 'Indie', 'Action': 'Acción', 'Open World': 'Mundo Abierto' },
        empty: {
            title: 'No tienes favoritos aún',
            filterDesc: 'No se encontraron juegos con los filtros actuales.',
            generalDesc: 'Explora la biblioteca y marca los juegos que más te gusten.',
            button: 'Explorar Juegos'
        }
    }
  };

  const t = translations[language.toLowerCase() as 'en' | 'es'];

  // Lógica de Filtrado y Ordenamiento (Sobre datos reales 'favorites')
  const filteredFavorites = favorites.filter(game => {
    if (activeFilter === 'All') return true;
    
    let searchGenre = activeFilter;
    if (activeFilter === 'Action') searchGenre = 'Acción';
    if (activeFilter === 'Open World') searchGenre = 'Mundo Abierto';

    // Verificación segura de géneros
    return game.genres?.some(g => g.includes(searchGenre) || g.includes(activeFilter));
  }).sort((a, b) => {
    if (sortBy === 'score_desc') return (b.score || 0) - (a.score || 0);
    if (sortBy === 'score_asc') return (a.score || 0) - (b.score || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#131119]" style={{ colorScheme: 'dark' }}>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .game-card-hover { transition: all 0.3s ease !important; }
        .game-card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.5); z-index: 10; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
      `}</style>

      {/* Header ya no necesita props manuales, usa AuthContext internamente */}
      <Header />

      <main className="flex-1 px-6 md:px-10 max-w-[1920px] mx-auto w-full relative flex flex-col">
        <div className="flex flex-col md:flex-row gap-8 flex-1 items-stretch">
          
          <aside className="hidden md:block w-[260px] shrink-0 relative">
             <div className="sticky top-[74px] pt-10 pb-10 h-[calc(100vh-74px)] overflow-y-auto no-scrollbar">
                <VerticalMenu activeItem="favorites" />
             </div>
          </aside>

          <div className="flex-1 w-full min-w-0 space-y-8 flex flex-col pt-6 md:pt-10 pb-10 animate-fade-up">
            
            <div className="sticky top-[73px] z-40 bg-[#131119] pt-2 pb-6 -mt-2 border-b border-white/5 md:border-none">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative">
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 font-display tracking-tight">
                    <Heart size={24} style={{ color: PALETTE.ROSA, fill: PALETTE.ROSA }} /> {t.title}
                    <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded ml-2 font-sans">
                      {filteredFavorites.length} {t.results}
                    </span>
                  </h2>
                  <p className="text-gray-400 text-sm">{t.subtitle}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mr-4 max-w-[calc(100vw-4rem)] xl:max-w-none">
                    {FILTER_KEYS.map((filterKey) => (
                      <button 
                        key={filterKey}
                        onClick={() => setActiveFilter(filterKey)} 
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                          activeFilter === filterKey 
                            ? 'bg-white text-black' 
                            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5' 
                        }`}
                      >
                        {t.filters[filterKey as keyof typeof t.filters]}
                      </button>
                    ))}
                  </div>

                  <div className="relative shrink-0">
                    <button 
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className={`p-2 rounded-xl border border-white/5 transition-colors flex items-center gap-2 ${
                          showSortMenu ? 'bg-white text-black' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                      }`}
                      title={t.sortTooltip}
                    >
                      <Filter size={20} />
                    </button>

                    {showSortMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
                        <div className="p-2 space-y-1">
                          <button onClick={() => { setSortBy('score_desc'); setShowSortMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === 'score_desc' ? 'bg-pink-600/20 text-pink-400' : 'text-gray-400 hover:bg-white/5'}`}>
                            <Star size={16} /> <span>{t.sortOptions.highScore}</span>
                          </button>
                          <button onClick={() => { setSortBy('name'); setShowSortMenu(false); }} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${sortBy === 'name' ? 'bg-pink-600/20 text-pink-400' : 'text-gray-400 hover:bg-white/5'}`}>
                            <SortAsc size={16} /> <span>{t.sortOptions.name}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Grilla de Juegos REALES */}
            {filteredFavorites.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {filteredFavorites.map((game) => (
                        <div key={game.id} className="relative group">
                            <Link 
                                href={`/game/${game.slug}`} 
                                className="game-card-hover block relative bg-[#1A1A20] rounded-2xl p-3 border border-white/5 hover:border-pink-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-pink-500/10 no-underline"
                            >
                                <div className="relative w-full aspect-[5/6] rounded-xl overflow-hidden mb-3 bg-gray-800">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
                                    <div className="w-full h-full bg-gray-800 group-hover:scale-105 transition-transform duration-500 relative">
                                        <Image
                                            src={game.coverUrl} // 3. DATO REAL DEL CONTEXTO
                                            alt={game.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-bold text-white">{game.score}</span>
                                    </div>
                                    <div className="absolute bottom-3 left-3 right-3 z-20">
                                        <h3 className="font-bold text-white text-base leading-tight drop-shadow-md text-left line-clamp-2">{game.name}</h3>
                                    </div>
                                </div>

                                <div className="px-1">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate max-w-[60%]">
                                            {game.genres?.[0] || 'Game'}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-xs font-medium text-pink-400 group-hover:text-pink-300 flex items-center gap-1">{t.viewDetails}</span>
                                        {/* BOTÓN BORRAR REAL */}
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault(); 
                                                e.stopPropagation();
                                                removeFavorite(game.id); // Llama a la función borrar del contexto
                                            }}
                                            className="p-1.5 rounded-full text-gray-500 hover:text-white hover:bg-red-500/80 transition-colors z-20"
                                            title={t.removeTooltip}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                // Empty State
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-[#1A1A20]/30">
                    <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mb-6">
                        <Heart size={40} className="text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t.empty.title}</h3>
                    <p className="text-gray-400 max-w-md mb-8">
                        {activeFilter !== 'All' ? t.empty.filterDesc : t.empty.generalDesc}
                    </p>
                    <Link 
                        href="/all-games" 
                        className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-lg hover:shadow-white/10 no-underline"
                    >
                        <Gamepad2 size={20} />
                        {t.empty.button}
                    </Link>
                </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}