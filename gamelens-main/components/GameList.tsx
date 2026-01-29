'use client';

import { useState } from 'react';
import { GameBasic } from '@/types';
import { GameCard } from '@/components/GameCard';
import { Filter, Star, SortAsc, ArrowDown } from 'lucide-react'; 
// Importamos el hook de idioma
import { useLanguage } from '../app/context/LanguageContext';

interface GameListProps {
  games: GameBasic[];
  onGameHover: (game: GameBasic | null) => void;
}

// DEFINIMOS LAS CLAVES DE FILTRO (Internal IDs)
// Estas deben coincidir con lo que venga en game.genres (en inglés según tu page.tsx)
const FILTER_KEYS = ['All', 'RPG', 'Action', 'FPS', 'Strategy', 'Indie', 'Shooter', 'Open World'];

type SortOption = 'score_desc' | 'score_asc' | 'name';

export const GameList: React.FC<GameListProps> = ({ games, onGameHover }) => {
  // Estado inicial 'All' para coincidir con la data
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('score_desc'); 
  const [showSortMenu, setShowSortMenu] = useState(false);   

  // 1. OBTENER IDIOMA
  const { language } = useLanguage();

  // 2. DICCIONARIO DE TRADUCCIONES
  const translations = {
    en: {
      sortTooltip: 'Sort by...',
      sortOptions: {
        highScore: 'Highest Score',
        lowScore: 'Lowest Score',
        name: 'Name (A-Z)'
      },
      // Mapeo de los filtros visuales
      filters: {
        'All': 'All',
        'RPG': 'RPG',
        'Action': 'Action',
        'FPS': 'FPS',
        'Strategy': 'Strategy',
        'Indie': 'Indie',
        'Shooter': 'Shooter',
        'Open World': 'Open World'
      }
    },
    es: {
      sortTooltip: 'Ordenar por...',
      sortOptions: {
        highScore: 'Mayor Puntaje',
        lowScore: 'Menor Puntaje',
        name: 'Nombre (A-Z)'
      },
      filters: {
        'All': 'Todos',
        'RPG': 'RPG',
        'Action': 'Acción',
        'FPS': 'FPS',
        'Strategy': 'Estrategia',
        'Indie': 'Indie',
        'Shooter': 'Shooter',
        'Open World': 'Mundo Abierto'
      }
    }
  };

  const t = translations[language.toLowerCase() as 'en' | 'es'];

  // 3. LOGICA DE FILTRADO
  const filteredGames = games.filter((game) => {
    // Usamos 'All' como comodín universal
    if (activeFilter === 'All') return true;
    // Comparamos contra el género en inglés que viene de la data
    return game.genres && game.genres.includes(activeFilter);
  });

  // 4. LOGICA DE ORDENAMIENTO
  const sortedGames = [...filteredGames].sort((a, b) => {
    if (sortBy === 'score_desc') {
      return b.score - a.score; 
    }
    if (sortBy === 'score_asc') {
      return a.score - b.score; 
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name); 
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      
      {/* Barra de Herramientas */}
      <div className="flex items-center justify-between relative z-20"> 
        
        {/* Chips de Filtros */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide mr-4">
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
              {/* Aquí mostramos la etiqueta traducida basada en la key */}
              {t.filters[filterKey as keyof typeof t.filters]}
            </button>
          ))}
        </div>

        {/* Botón de Ordenar con Menú Desplegable */}
        <div className="relative">
          <button 
            onClick={() => setShowSortMenu(!showSortMenu)}
            className={`p-2 rounded-xl border border-white/5 transition-colors flex items-center gap-2 ${
                showSortMenu ? 'bg-white text-black' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
            title={t.sortTooltip}
          >
            <Filter size={20} />
          </button>

          {/* Menú Dropdown */}
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right z-50">
              <div className="p-2 space-y-1">
                {/* Opción: Mayor Puntaje */}
                <button
                  onClick={() => { setSortBy('score_desc'); setShowSortMenu(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    sortBy === 'score_desc' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Star size={16} />
                  <span>{t.sortOptions.highScore}</span>
                </button>

                {/* Opción: Menor Puntaje */}
                <button
                  onClick={() => { setSortBy('score_asc'); setShowSortMenu(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    sortBy === 'score_asc' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <ArrowDown size={16} />
                  <span>{t.sortOptions.lowScore}</span>
                </button>

                {/* Opción: Nombre */}
                <button
                  onClick={() => { setSortBy('name'); setShowSortMenu(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    sortBy === 'name' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <SortAsc size={16} />
                  <span>{t.sortOptions.name}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid de Juegos Ordenados */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedGames.map((game) => (
          <div 
            key={game.id}
            onMouseEnter={() => onGameHover(game)}
            onMouseLeave={() => onGameHover(null)} 
            className="transform transition-all duration-300 hover:-translate-y-1"
          >
            <GameCard game={game} />
          </div>
        ))}
      </div>
    </div>
  );
};