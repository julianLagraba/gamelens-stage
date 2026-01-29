'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { VerticalMenu } from '@/components/VerticalMenu'; 
import { TrendingUp, Activity, Star, Clock, Users } from 'lucide-react';
// 1. IMPORTAR CONTEXTO
import { useLanguage } from '@/app/context/LanguageContext';

// Forzamos a Next.js a tratar la página como dinámica
export const dynamic = 'force-dynamic';

// --- PALETA GAMELENS ---
const PALETTE = {
  CEL_AZUL: '#50a2ff',
  VERDE: '#00FF62',
  AMARILLO: '#efb537',
  LILA: '#b340bf',
  VIOLETA: '#a855f7',
  CYAN: '#2DD4E0',
  ROSA: '#f6339a',
  MORADO: '#4530BE',
  ROJO: '#FF4444',
  BLANCO: '#FFFFFF',
  GRIS: '#9CA3AF'
};

// --- TIPOS LOCALES ---
interface UserData {
  id?: number;
  name: string;
  avatarUrl: string;
  favoritePlatform: string;
}

interface MostPlayedGame {
  rank: number;
  id: number;
  slug: string;
  name: string;
  publisher: string;
  coverUrl: string;
  activePlayers: number;    // Jugadores en este momento
  peakToday: number;        // Pico de hoy
  hoursPlayed: number;      // Horas jugadas (Total acumulado 24h aprox)
  score: number;
}

// --- HELPER: Formatear números grandes ---
const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(0) + 'k';
  return num.toString();
};

// --- HELPER: Formatear horas ---
const formatHours = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M h';
    return (num / 1000).toFixed(0) + 'k h';
};

// --- COMPONENTE RANK MEDAL (Estilo Unificado Transparente/Neón) ---
const RankMedal = ({ rank }: { rank: number }) => {
    if (rank > 3) return <span className="font-bold text-gray-500 w-6 text-center text-sm font-mono">{rank}</span>;

    let styles = "";
    if (rank === 1) styles = "bg-yellow-500/20 text-yellow-500 border border-yellow-500/50 shadow-lg shadow-yellow-500/10"; 
    if (rank === 2) styles = "bg-gray-400/20 text-gray-300 border border-gray-400/50"; 
    if (rank === 3) styles = "bg-orange-700/20 text-orange-400 border border-orange-700/50"; 
      
    return (
        <div className={`flex items-center justify-center w-6 h-6 rounded-md font-bold text-sm ${styles}`}>
            {rank}
        </div>
    );
};

// --- DATOS MOCK: MOST PLAYED (Enfocados en métricas de actividad) ---
const mostPlayedData: MostPlayedGame[] = [
  {
    rank: 1,
    id: 4, 
    slug: "fortnite",
    name: "Fortnite",
    publisher: "Epic Games",
    coverUrl: "https://static-cdn.jtvnw.net/ttv-boxart/33214-600x900.jpg",
    activePlayers: 3100000,
    peakToday: 4500000,
    hoursPlayed: 85000000,
    score: 81
  },
  {
    rank: 2,
    id: 5,
    slug: "league-of-legends",
    name: "League of Legends",
    publisher: "Riot Games",
    coverUrl: "https://static-cdn.jtvnw.net/ttv-boxart/21779-600x900.jpg",
    activePlayers: 1800000,
    peakToday: 2100000,
    hoursPlayed: 42000000,
    score: 89
  },
  {
    rank: 3,
    id: 26,
    slug: "cs2",
    name: "Counter-Strike 2",
    publisher: "Valve",
    coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/730/library_600x900.jpg",
    activePlayers: 1450000,
    peakToday: 1600000,
    hoursPlayed: 38000000,
    score: 83
  },
  {
    rank: 4,
    id: 27,
    slug: "palworld",
    name: "Palworld",
    publisher: "Pocketpair",
    coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1623730/library_600x900.jpg",
    activePlayers: 900000,
    peakToday: 1100000,
    hoursPlayed: 12000000,
    score: 80
  },
  {
    rank: 5,
    id: 8,
    slug: "valorant",
    name: "Valorant",
    publisher: "Riot Games",
    coverUrl: "https://static-cdn.jtvnw.net/ttv-boxart/516575-600x900.jpg",
    activePlayers: 850000,
    peakToday: 980000,
    hoursPlayed: 10500000,
    score: 85
  },
  {
    rank: 6,
    id: 12,
    slug: "apex-legends",
    name: "Apex Legends",
    publisher: "Electronic Arts",
    coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1172470/library_600x900.jpg",
    activePlayers: 600000,
    peakToday: 720000,
    hoursPlayed: 8200000,
    score: 84
  },
  {
    rank: 7,
    id: 18,
    slug: "cod-warzone",
    name: "Call of Duty: Warzone",
    publisher: "Activision",
    coverUrl: "https://static-cdn.jtvnw.net/ttv-boxart/512710-600x900.jpg",
    activePlayers: 450000,
    peakToday: 550000,
    hoursPlayed: 6100000,
    score: 80
  },
  {
    rank: 8,
    id: 25,
    slug: "gta-v",
    name: "Grand Theft Auto V",
    publisher: "Rockstar Games",
    coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg",
    activePlayers: 360000,
    peakToday: 420000,
    hoursPlayed: 5400000,
    score: 96
  },
  {
    rank: 9,
    id: 3,
    slug: "destiny-2",
    name: "Destiny 2",
    publisher: "Bungie",
    coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1085660/library_600x900.jpg",
    activePlayers: 280000,
    peakToday: 310000,
    hoursPlayed: 3900000,
    score: 83
  },
  {
    rank: 10,
    id: 1,
    slug: "elden-ring",
    name: "Elden Ring",
    publisher: "FromSoftware",
    coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg",
    activePlayers: 240000,
    peakToday: 290000,
    hoursPlayed: 4500000,
    score: 96
  }
];

export default function MostPlayedPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // 2. OBTENER IDIOMA
  const { language } = useLanguage();

  // 3. DICCIONARIO
  const translations = {
    en: {
        loading: 'Loading...',
        title: 'Most Played',
        colRank: 'Rank',
        colGame: 'Game',
        colActive: 'Active Players',
        colRating: 'Rating',
        colPeak: 'Peak Today',
        colHours: 'Total Hours'
    },
    es: {
        loading: 'Cargando...',
        title: 'Más Jugados',
        colRank: 'Rank',
        colGame: 'Juego',
        colActive: 'Jugadores Activos',
        colRating: 'Calif.',
        colPeak: 'Pico Hoy',
        colHours: 'Horas Totales'
    }
  };

  const t = translations[language.toLowerCase() as 'en' | 'es'];

  useEffect(() => {
    // Simulamos carga de usuario
    const mockUser = { name: 'Valentín', favoritePlatform: 'PC', avatarUrl: '' };
    const timer = setTimeout(() => {
          setUser(mockUser);
          setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <div className="h-screen bg-[#131119] flex items-center justify-center text-white">{t.loading}</div>;
  }

  // Objeto de usuario seguro para pasar al Header
  const safeUser = user || { name: 'Guest', favoritePlatform: 'PC', avatarUrl: '' };

  return (
    <div 
      className="min-h-screen flex flex-col bg-[#131119]"
      style={{ colorScheme: 'dark' }}
    >
      {/* 1. ESTILO DE SCROLLBAR Y ANIMACIONES */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* --- ANIMACIONES DE CARGA (Fade In Up) --- */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0; /* Comienza oculto para evitar flash */
        }
        
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }

        /* ANIMACIÓN DE TARJETAS (Zoom central limpio) */
        .game-card-hover, 
        [class*="GameCard"],
        section div[role="listitem"] {
          transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1) !important;
          transform-origin: center center !important;
          will-change: transform;
        }
        
        .game-card-hover:hover, 
        [class*="GameCard"]:hover,
        section div[role="listitem"]:hover {
          transform: scale(1.04) !important; 
          translate: 0px 0px !important;
          z-index: 50 !important;
          filter: brightness(1.1);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5);
        }
      `}</style>
      
      {/* 2. HEADER INTEGRADO (Reutilizable) */}
      <Header user={safeUser} />
      
      {/* 3. MAIN WRAPPER (Estructura de ProfilePage / MostPlayedPage) */}
      <main className="flex-1 px-6 md:px-10 max-w-[1920px] mx-auto w-full relative flex flex-col">
        
        <div className="flex flex-col md:flex-row gap-8 flex-1 items-stretch">
          
          {/* Menú Lateral (Sticky) */}
          <aside className="hidden md:block w-[260px] shrink-0 relative">
             <div className="sticky top-[74px] pt-10 pb-10 h-[calc(100vh-74px)] overflow-y-auto no-scrollbar">
                {/* Active Item: 'most-played' */}
                <VerticalMenu activeItem="most-played" /> 
             </div>
          </aside>

          {/* Área Derecha: Contenido Específico de Most Played */}
          {/* Se añade animate-fade-up para la animación de entrada */}
          <div className="flex-1 w-full min-w-0 space-y-8 flex flex-col pt-6 md:pt-10 pb-10 animate-fade-up">
            
            {/* Page Header (Sin subtítulo y con icono Amarillo) */}
            <div className="mb-2">
              <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 font-display tracking-tight">
                <Activity size={24} style={{ color: PALETTE.AMARILLO }} /> {t.title}
              </h2>
            </div>

            {/* --- TABLA / LISTA DE RANKING --- */}
            <div className="w-full bg-[#1A1A20] rounded-xl border border-white/5 overflow-hidden shadow-2xl">
                
                {/* Encabezado de la tabla */}
                <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <div className="col-span-2 md:col-span-1 text-left">{t.colRank}</div>
                    <div className="col-span-6 md:col-span-4">{t.colGame}</div>
                    <div className="col-span-2 text-left hidden md:block">{t.colActive}</div>
                    <div className="col-span-1 text-center hidden md:block">{t.colRating}</div>
                    <div className="col-span-2 text-right hidden md:block">{t.colPeak}</div>
                    <div className="col-span-3 md:col-span-2 text-right">{t.colHours}</div>
                </div>

                {/* Filas */}
                <div className="divide-y divide-white/5">
                    {mostPlayedData.map((game) => (
                        <Link 
                            key={game.id} 
                            href={`/game/${game.slug}`}
                            // Añadimos la clase 'game-card-hover' para la animación de hover
                            className="game-card-hover grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/5 transition-colors group"
                        >
                            {/* RANK */}
                            <div className="col-span-2 md:col-span-1 flex justify-start">
                                <RankMedal rank={game.rank} />
                            </div>

                            {/* JUEGO */}
                            <div className="col-span-6 md:col-span-4 flex items-center gap-4">
                                <div className="relative w-12 h-16 rounded-md overflow-hidden shrink-0 border border-white/10 group-hover:border-white/30 transition-colors">
                                    <Image 
                                        src={game.coverUrl} 
                                        alt={game.name} 
                                        fill 
                                        className="object-cover"
                                        sizes="48px"
                                        unoptimized
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-bold text-white text-base truncate group-hover:text-blue-400 transition-colors">{game.name}</h3>
                                    <p className="text-xs text-gray-500 truncate">{game.publisher}</p>
                                    {/* Mobile: Mostrar Active Players brevemente */}
                                    <div className="flex items-center gap-1 text-[10px] text-green-400 mt-1 md:hidden">
                                        <Users size={10} /> {formatNumber(game.activePlayers)}
                                    </div>
                                </div>
                            </div>

                            {/* ACTIVE PLAYERS */}
                            <div className="col-span-2 hidden md:flex items-center justify-start">
                                <div className="flex items-center gap-1.5 text-white font-medium tabular-nums">
                                     <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                     {formatNumber(game.activePlayers)}
                                </div>
                            </div>

                            {/* RATING */}
                            <div className="col-span-1 hidden md:flex items-center justify-center">
                                <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20 text-yellow-500 font-bold text-sm tabular-nums">
                                    <Star size={12} fill="currentColor" />
                                    {game.score}
                                </div>
                            </div>

                            {/* PEAK TODAY */}
                            <div className="col-span-2 hidden md:flex items-center justify-end">
                                <div className="flex items-center gap-1.5 text-gray-300 font-medium tabular-nums">
                                     <TrendingUp size={14} className="text-blue-400" />
                                     {formatNumber(game.peakToday)}
                                </div>
                            </div>

                            {/* TOTAL HOURS */}
                            <div className="col-span-3 md:col-span-2 flex flex-col items-end justify-center">
                                <div className="flex items-center gap-1.5 text-gray-300 text-sm font-medium tabular-nums">
                                    <Clock size={14} className="text-purple-400" />
                                    <span>{formatHours(game.hoursPlayed)}</span>
                                </div>
                            </div>

                        </Link>
                    ))}
                </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}