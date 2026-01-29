/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { VerticalMenu } from '@/components/VerticalMenu'; 
// Agregamos Check y PlusCircle
import { Heart, Filter, Star, SortAsc, Gamepad2, Loader2, PlusCircle, Check } from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

import { useFavorites } from '@/app/context/FavoritesContext';
// 1. IMPORTAR CONTEXTO COLECCIÓN
import { useCollection } from '@/app/context/CollectionContext';

export const dynamic = 'force-dynamic';

interface GameItem {
  id: number;
  slug: string;
  name: string;
  coverUrl: string;
  score: number;
  genres: string[];
  simulatedPlayers?: number; 
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
  return num.toString();
};

const PALETTE = {
  CEL_AZUL: '#50a2ff',
  MORADO: '#bd6ce9',
  VERDE: '#00FF62', // Tu verde exacto
};

const FILTER_KEYS = ['All', 'RPG', 'Action', 'FPS', 'Strategy', 'Indie', 'Shooter', 'Open World'];
type SortOption = 'score_desc' | 'score_asc' | 'name';

export default function AllGamesPage() {
  const { isFavorite, addFavorite, removeFavorite } = useFavorites();
  // 2. HOOK DE COLECCIÓN
  const { addToCollection, removeFromCollection, isInCollection } = useCollection();

  const [games, setGames] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('score_desc');
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { language } = useLanguage();

  const translations = {
    en: {
        loading: 'Loading library...',
        title: 'All Games',
        subtitle: 'Explore the complete catalog powered by IGDB & Steam.',
        results: 'titles loaded',
        viewDetails: 'View Details',
        loadMore: 'Load More Games',
        noMore: 'End of catalog',
        filters: { 'All': 'All', 'RPG': 'RPG', 'Action': 'Action', 'FPS': 'FPS', 'Strategy': 'Strategy', 'Indie': 'Indie', 'Shooter': 'Shooter', 'Open World': 'Open World' }
    },
    es: {
        loading: 'Cargando biblioteca...',
        title: 'Todos los Juegos',
        subtitle: 'Explora el catálogo completo impulsado por IGDB y Steam.',
        results: 'títulos cargados',
        viewDetails: 'Ver Detalles',
        loadMore: 'Cargar Más Juegos',
        noMore: 'Fin del catálogo',
        filters: { 'All': 'Todos', 'RPG': 'RPG', 'Action': 'Acción', 'FPS': 'FPS', 'Strategy': 'Estrategia', 'Indie': 'Indie', 'Shooter': 'Shooter', 'Open World': 'Mundo Abierto' }
    }
  };

  const t = translations[language.toLowerCase() as 'en' | 'es'];

  // Lógica Favoritos
  const handleToggleFavorite = (e: React.MouseEvent, game: GameItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (isFavorite(game.id)) removeFavorite(game.id);
    else addFavorite({ id: game.id, slug: game.slug, name: game.name, coverUrl: game.coverUrl, score: game.score, genres: game.genres });
  };

  // 3. Lógica Colección
  const handleToggleCollection = (e: React.MouseEvent, game: GameItem) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCollection(game.id)) {
        removeFromCollection(game.id);
    } else {
        addToCollection({
            id: game.id,
            name: game.name,
            slug: game.slug,
            coverUrl: game.coverUrl
        }, 'owned'); // Por defecto 'owned' (Backlog)
    }
  };

  const fetchGames = async (pageToLoad: number) => {
    try {
        const res = await fetch(`/api/catalog?page=${pageToLoad}`);
        const newGames: GameItem[] = await res.json();

        if (newGames.length === 0) {
            setHasMore(false);
            return;
        }

        const gamesWithPlayers = newGames.map(g => ({
            ...g,
            simulatedPlayers: Math.floor(Math.random() * (g.score * 1000)) + 5000
        }));

        setGames(prev => {
            const combined = [...prev, ...gamesWithPlayers];
            return Array.from(new Map(combined.map(item => [item.id, item])).values());
        });

    } catch (error) {
        console.error("Error cargando juegos:", error);
    }
  };

  useEffect(() => {
    fetchGames(1).finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLoadMore = async () => {
      setLoadingMore(true);
      const nextPage = page + 1;
      await fetchGames(nextPage);
      setPage(nextPage);
      setLoadingMore(false);
  };

  const filteredGames = games.filter((game) => {
    if (activeFilter === 'All') return true;
    let searchGenre = activeFilter;
    if (activeFilter === 'Action') searchGenre = 'Adventure';
    if (activeFilter === 'Open World') searchGenre = 'Adventure';
    return game.genres?.some(g => g.includes(searchGenre) || g.includes(activeFilter));
  });

  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'score_desc') return (b.score || 0) - (a.score || 0);
    if (sortBy === 'score_asc') return (a.score || 0) - (b.score || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  if (loading) {
    return (
        <div className="h-screen bg-[#131119] flex flex-col gap-4 items-center justify-center text-white">
            <Loader2 className="animate-spin text-purple-500" size={48} />
            <p className="text-sm font-mono text-gray-400">{t.loading}</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#131119]" style={{ colorScheme: 'dark' }}>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
        
        .game-card-hover, [class*="GameCard"], section div[role="listitem"] {
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1) !important;
          transform-origin: center center !important;
          will-change: transform;
        }
        .game-card-hover:hover, [class*="GameCard"]:hover, section div[role="listitem"]:hover {
          transform: scale(1.04) !important; 
          translate: 0px 0px !important;
          z-index: 50 !important;
          filter: brightness(1.1);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5);
        }
      `}</style>
      
      <Header />
      
      <main className="flex-1 px-6 md:px-10 max-w-[1920px] mx-auto w-full relative flex flex-col">
        <div className="flex flex-col md:flex-row gap-8 flex-1 items-stretch">
          
          <aside className="hidden md:block w-[260px] shrink-0 relative">
             <div className="sticky top-[74px] pt-10 pb-10 h-[calc(100vh-74px)] overflow-y-auto no-scrollbar">
                <VerticalMenu activeItem="all-games" /> 
             </div>
          </aside>

          <div className="flex-1 w-full min-w-0 space-y-8 flex flex-col pt-6 md:pt-10 pb-10 animate-fade-up">
            
            <div className="sticky top-[73px] z-40 bg-[#131119]/95 backdrop-blur-sm pt-2 pb-6 -mt-2 border-b border-white/5 md:border-none">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 font-display tracking-tight">
                    <Gamepad2 size={24} style={{ color: PALETTE.MORADO }} /> {t.title}
                    <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded ml-2 font-sans">
                      {games.length} {t.results}
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
                        {t.filters[filterKey as keyof typeof t.filters] || filterKey}
                      </button>
                    ))}
                  </div>

                  <div className="relative shrink-0">
                    <button 
                      onClick={() => setShowSortMenu(!showSortMenu)}
                      className={`p-2 rounded-xl border border-white/5 transition-colors flex items-center gap-2 ${
                          showSortMenu ? 'bg-white text-black' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <Filter size={20} />
                    </button>
                    {showSortMenu && (
                      <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                        <div className="p-2 space-y-1">
                          <button onClick={() => { setSortBy('score_desc'); setShowSortMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5"><Star size={16} /> Highest Score</button>
                          <button onClick={() => { setSortBy('name'); setShowSortMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/5"><SortAsc size={16} /> Name (A-Z)</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* --- GRID DE JUEGOS --- */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {sortedGames.map((game) => {
                const isFav = isFavorite(game.id);
                // 4. VERIFICAR SI ESTÁ EN COLECCIÓN
                const inCollection = isInCollection(game.id);

                return (
                <Link 
                  href={`/game/${game.slug}`} 
                  key={game.id}
                  className="game-card-hover group relative bg-[#1A1A20] rounded-2xl p-3 border border-white/5 hover:border-purple-500/30 block"
                >
                  <div className="relative w-full aspect-[5/6] rounded-xl overflow-hidden mb-3 bg-gray-800">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
                    <div className="w-full h-full bg-gray-800 group-hover:scale-105 transition-transform duration-500 relative">
                        <Image
                            src={game.coverUrl}
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
                    
                    {/* Badge OWNED sutil si ya lo tienes */}
                    {inCollection && (
                       <div className="absolute top-2 left-2 z-20 bg-[#00FF62]/90 text-black text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg backdrop-blur-sm">OWNED</div>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 z-20">
                        <h3 className="font-bold text-white text-base leading-tight drop-shadow-md text-left line-clamp-2">{game.name}</h3>
                    </div>
                  </div>

                  <div className="px-1">
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2 py-1 rounded-md bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate max-w-[60%]">
                        {game.genres?.[0] || 'Game'}
                      </span>
                      <div className="flex items-center gap-2 text-gray-400">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-medium">{formatNumber(game.simulatedPlayers || 0)}</span>
                      </div>
                    </div>
                    
                    {/* --- BOTONERA INFERIOR --- */}
                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-xs font-medium text-purple-400 group-hover:text-purple-300 flex items-center gap-1">{t.viewDetails}</span>
                      
                      <div className="flex gap-2">
                          {/* BOTÓN COLECCIÓN (+) */}
                          <button 
                            className={`p-1.5 rounded-full transition-colors z-20 border border-transparent ${
                                inCollection 
                                ? 'text-[#00FF62] bg-[#00FF62]/10 border-[#00FF62]/20' // Activo (Verde)
                                : 'text-gray-500 hover:text-white hover:bg-white/10' // Inactivo
                            }`} 
                            onClick={(e) => handleToggleCollection(e, game)}
                            title={inCollection ? "In Collection" : "Add to Collection"}
                          >
                            {inCollection ? <Check size={16} /> : <PlusCircle size={16} />}
                          </button>

                          {/* BOTÓN FAVORITO (Corazón) */}
                          <button 
                            className={`p-1.5 rounded-full transition-colors z-20 border border-transparent ${
                                isFav 
                                ? 'text-pink-500 bg-pink-500/10 border-pink-500/20' 
                                : 'text-gray-500 hover:text-pink-500 hover:bg-pink-500/10'
                            }`} 
                            onClick={(e) => handleToggleFavorite(e, game)}
                          >
                            <Heart size={16} fill={isFav ? "currentColor" : "none"} />
                          </button>
                      </div>
                    </div>
                  </div>
                </Link>
              )})}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-8 pb-12">
                    <button 
                        onClick={handleLoadMore}
                        disabled={loadingMore}
                        className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                    >
                        {loadingMore ? (
                            <>
                                <Loader2 className="animate-spin" size={20} /> Cargando...
                            </>
                        ) : (
                            <>
                                <PlusCircle size={20} /> {t.loadMore}
                            </>
                        )}
                    </button>
                </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}