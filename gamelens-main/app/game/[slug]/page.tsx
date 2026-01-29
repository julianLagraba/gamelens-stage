/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/Header';
import { VerticalMenu } from '@/components/VerticalMenu';
import { useLanguage } from '@/app/context/LanguageContext';
import { useGameFavorite } from '@/hooks/useGameFavorite';
// 1. IMPORTAR HOOK COLECCIÓN
import { useCollection } from '@/app/context/CollectionContext';

import { 
  Users, Trophy, Calendar, Star, TrendingUp, Users2, 
  LineChart as LineChartIcon, Globe, Monitor, 
  Clock, Heart, LucideIcon, Cpu, HardDrive, Zap, Image as ImageIcon,
  X, ChevronLeft, ChevronRight, Gamepad2, Shield, Languages, Box, 
  Info, FileText, Timer, Target, LocateFixed,
  // 2. NUEVOS ICONOS
  Library, Check, Plus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Pie, PieChart as RechartsPieChart, LabelList,
  RadialBarChart, RadialBar
} from 'recharts';

interface ChartPayloadItem {
  name: string;
  value: number | string;
  color?: string;
  fill?: string;
  dataKey?: string;
  payload?: unknown;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ChartPayloadItem[];
  label?: string;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  stroke?: string;
  payload?: unknown;
  value?: number;
}

interface SentimentEntry {
    name: string;
    value: number;
    fill: string;
    color: string;
    [key: string]: string | number;
}

interface RequirementSpec {
    os?: string;
    cpu?: string;
    ram?: string;
    gpu?: string;
}

export interface ExtendedGameDetail {
  id: number;
  slug: string;
  name: string;
  storeUrl?: string;
  isFavorite?: boolean;
  images: {
    hero: string;
    cover: string;
    screenshots: string[];
  };
  meta: {
    genres: string[];
    platforms: string[];
    developer: string;
    publisher: string;
    releaseDate: string;
    description?: string;
    description_en?: string;
    description_es?: string;
    ageRating?: string;
    gameModes?: string[];
    downloadSize?: string;
    controllerSupport?: boolean;
    engine?: string;
    languages?: string[];
  };
  requirements?: {
      min?: RequirementSpec;
      rec?: RequirementSpec;
  };
  playerGrowth14d?: { day: string; players: number }[];
  kpiSeries: {
    topCountries?: { country: string; code: string; weight: number }[];
    peakPlayers: number;
    score: number;
    currentPlayers: number;
    players24hChangePercent: number;
  };
  rankingMovement?: {
    currentRank: number;
    change: number;
    history: { day: string; rank: number }[];
  };
  platformDistribution?: { platform: string; percent: number }[];
  retention?: { d1: number; d2: number; d3: number; [key: string]: number }; 
  userReviews?: {
    total?: number;
    positivePercent: number;
    mixedPercent: number;
    negativePercent: number;
    starsDistribution: Record<string, number>;
  };
  peakHours?: { hour: string; players: number }[];
}

const PALETTE = {
    CEL_AZUL: '#50a2ff',
    VERDE: '#00FF62',
    AMARILLO: '#efb537',
    LILA: '#b340bf',
    CYAN: '#2DD4E0',
    ROSA: '#f6339a',
    MORADO: '#4530BE',
    DARK_BG: '#171717', 
    GRID_COLOR: '#333'
};

const TRAFFIC_DATA: { source: string; value: number }[] = [
  { source: 'steam', value: 45 },
  { source: 'direct', value: 20 },
  { source: 'search', value: 15 },
  { source: 'social', value: 20 },
];

const pseudoRandom = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
};


const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
        let displayLabel = label;
        if (typeof label === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(label)) {
            const parts = label.split('-');
            displayLabel = `${parts[2]}/${parts[1]}`;
        }
        return (
            <div className="bg-neutral-900 border border-neutral-700 p-2 rounded shadow-xl text-xs z-50">
                <p className="font-bold text-white mb-1 border-b border-white/10 pb-1">{displayLabel}</p>
                <div className="flex items-center gap-2">
                    <p className="text-white font-medium">
                        {payload[0].name}: <span className="text-gray-300">{payload[0].value?.toLocaleString()}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const CircularMetric = ({ value, displayValue, label, gradientId, colors, icon: Icon }: { value: number, displayValue: string, label: string, gradientId: string, colors: string[], icon: LucideIcon }) => {
    const data = [
        { value: value, fill: `url(#${gradientId})` },
        { value: 100 - value, fill: 'rgba(255,255,255,0.05)' }
    ];
    const hoverColor = colors[1];

    return (
        <div
            className="flex flex-col items-center justify-center p-3 bg-neutral-900/70 rounded-xl border border-neutral-800 shadow-lg transition-all duration-300 h-full"
            style={{ '--hover-color': hoverColor } as React.CSSProperties}
            onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.borderColor = hoverColor + '80';
                target.style.backgroundColor = hoverColor + '1A';
            }}
            onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.borderColor = 'rgba(38, 38, 38, 1)'; 
                target.style.backgroundColor = 'rgba(23, 23, 23, 0.7)'; 
            }}
        >
            <div className="relative w-16 h-16 mb-2"> 
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={colors[0]} />
                                <stop offset="100%" stopColor={colors[1]} />
                            </linearGradient>
                        </defs>
                        <Pie 
                            data={data} 
                            cx="50%" 
                            cy="50%" 
                            innerRadius={24} 
                            outerRadius={32} 
                            startAngle={90} 
                            endAngle={-270} 
                            dataKey="value" 
                            stroke="none" 
                            cornerRadius={10}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </RechartsPieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center drop-shadow-lg">
                    <Icon size={20} style={{ color: colors[1] }} />
                </div>
            </div>
            <div className="text-center">
                <p className="text-lg font-black text-white leading-none">{displayValue}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide mt-1 font-bold">{label}</p>
            </div>
        </div>
    );
};

const CustomActiveDot = (props: CustomDotProps) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) return null;
    return <circle cx={cx} cy={cy} r={6} fill={PALETTE.ROSA} stroke="#fff" strokeWidth={2} />;
};

const CustomActiveDotGrowth = (props: CustomDotProps) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) return null;
    return <circle cx={cx} cy={cy} r={6} fill={PALETTE.CYAN} stroke="#fff" strokeWidth={2} />;
};

const CustomActiveDotRetention = (props: CustomDotProps) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) return null;
    return <circle cx={cx} cy={cy} r={6} fill={PALETTE.LILA} stroke="#fff" strokeWidth={2} />;
};

const CustomActiveDotRanking = (props: CustomDotProps) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) return null;
    return <circle cx={cx} cy={cy} r={6} fill={PALETTE.AMARILLO} stroke="#fff" strokeWidth={2} />;
};

const RankMedal = ({ rank }: { rank: number }) => {
    if (rank > 3) return <span className="font-bold text-gray-500 w-6 text-center text-sm">{rank}</span>;
    let styles = "";
    if (rank === 1) styles = "bg-[#DEC464] text-neutral-900 shadow-[0_0_10px_rgba(222,196,100,0.3)]"; 
    if (rank === 2) styles = "bg-[#C0C0C0] text-neutral-900 shadow-[0_0_10px_rgba(192,192,192,0.3)]"; 
    if (rank === 3) styles = "bg-[#CD9866] text-neutral-900 shadow-[0_0_10px_rgba(205,152,102,0.3)]"; 
    return (
        <div className={`flex items-center justify-center w-6 h-6 rounded-md font-bold text-sm ${styles}`}>
            {rank}
        </div>
    );
};

// --- COMPONENTE INTERNO FAVORITOS (ORIGINAL) ---
const DetailFavoriteButton = ({ game }: { game: ExtendedGameDetail }) => {
  const { isFav, toggleFavorite, loading } = useGameFavorite({
    id: game.id,
    name: game.name,
    slug: game.slug,
    coverUrl: game.images.cover 
  });

  return (
    <button 
      onClick={(e) => {
        e.preventDefault();
        if (!loading) toggleFavorite();
      }}
      disabled={loading}
      className={`h-12 w-12 flex items-center justify-center rounded-xl border transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 group 
        ${isFav 
          ? 'bg-[#f6339a]/20 border-[#f6339a] text-[#f6339a]' 
          : 'bg-black/40 border-white/10 text-white hover:border-[#f6339a]/50 hover:text-[#f6339a]' 
        }`}
      title="Add to Favorites"
    >
      <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isFav ? 'fill-current' : ''}`} />
    </button>
  );
};

// --- COMPONENTE INTERNO COLECCIÓN (NUEVO) ---
const DetailCollectionButton = ({ game }: { game: ExtendedGameDetail }) => {
    const { isInCollection, addToCollection, removeFromCollection } = useCollection();
    const isOwned = isInCollection(game.id);

    const handleToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        if (isOwned) {
            removeFromCollection(game.id);
        } else {
            addToCollection({
                id: game.id,
                name: game.name,
                slug: game.slug,
                coverUrl: game.images.cover
            }, 'owned');
        }
    };

    return (
      <button 
        onClick={handleToggle}
        className={`h-12 w-12 flex items-center justify-center rounded-xl border transition-all duration-300 shadow-lg hover:scale-105 active:scale-95 group 
          ${isOwned 
            ? 'bg-[#00FF62]/20 border-[#00FF62] text-[#00FF62]' // Verde activo
            : 'bg-black/40 border-white/10 text-white hover:border-[#00FF62]/50 hover:text-[#00FF62]' // Hover Verde
          }`}
        title={isOwned ? "In Collection" : "Add to Collection"}
      >
        {isOwned ? <Check className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} /> : <Plus className="w-5 h-5 md:w-6 md:h-6" />}
      </button>
    );
};

export default function GameDetailPage() {
  const params = useParams();
  const [game, setGame] = useState<ExtendedGameDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [growthRange, setGrowthRange] = useState<'14d' | '30d' | '90d'>('14d');
  const [activityRange, setActivityRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [platformFilter, setPlatformFilter] = useState<'All' | 'PC' | 'PlayStation' | 'Xbox'>('All');
  const [retentionRange, setRetentionRange] = useState<'3d' | '7d' | '30d'>('3d');
  const [sessionRange, setSessionRange] = useState<'24h' | '7d' | '30d'>('30d');

  const [highlightedRank, setHighlightedRank] = useState<number | null>(null);
  const rankListRef = useRef<HTMLDivElement>(null);
  const rankItemRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  const { language } = useLanguage();

  const translations = {
    en: {
      loading: 'Loading game data...',
      active: 'active',
      viewStore: 'View Store',
      totalPlayers: 'Total Players',
      activeNow: 'Active Now',
      trending: 'Trending',
      peakCap: 'Peak Cap.',
      activity: 'Activity',
      growth: 'Growth',
      players: 'Players',
      topCountries: 'Top Countries',
      platforms: 'Platforms',
      all: 'All',
      marketShare: 'Market Share',
      playerReception: 'Player Reception',
      globalScore: 'Global Score',
      scoreDesc: 'Based on text analysis algorithms of recent reviews.',
      positive: 'Positive',
      mixed: 'Mixed',
      negative: 'Negative',
      breakdown: 'Breakdown',
      globalRanking: 'Global Top Ranking',
      currentRank: 'Current Rank',
      viewRank: 'View my rank',
      retentionCurve: 'Retention Curve',
      rankingHistory: 'Ranking History',
      rankingHistoryDesc: 'Evolution of position in the global ranking.',
      sessionDuration: 'Session Duration',
      acquisitionSources: 'Acquisition Sources',
      aboutGame: 'About the Game',
      noDesc: 'No description available.',
      techSpecs: 'Technical Specs',
      developer: 'Developer',
      publisher: 'Publisher',
      release: 'Release',
      rating: 'Rating',
      size: 'Size',
      control: 'Control',
      engine: 'Engine',
      languages: 'Languages',
      supported: 'supported',
      genres: 'Genres',
      modes: 'Modes',
      gallery: 'Gallery',
      viewFullGallery: 'VIEW FULL GALLERY',
      sysReq: 'System Requirements',
      min: 'Minimum',
      rec: 'Recommended',
      singlePlayer: 'Single Player',
      multiPlayer: 'Multiplayer',
      traffic: { steam: 'Steam', direct: 'Direct', search: 'Search', social: 'Social' },
      retentionDay: 'Day',
      retentionLabel: 'Retention Day'
    },
    es: {
      loading: 'Cargando datos del juego...',
      active: 'activos',
      viewStore: 'Ver en Tienda',
      totalPlayers: 'Total Jugadores',
      activeNow: 'Activos Ahora',
      trending: 'Tendencia',
      peakCap: 'Cap. Máx.',
      activity: 'Actividad',
      growth: 'Crecimiento',
      players: 'Jugadores',
      topCountries: 'Top Países',
      platforms: 'Plataformas',
      all: 'Todos',
      marketShare: 'Cuota de Mercado',
      playerReception: 'Recepción de Jugadores',
      globalScore: 'Score Global',
      scoreDesc: 'Basado en algoritmos de análisis de texto de reviews recientes.',
      positive: 'Positivo',
      mixed: 'Mixto',
      negative: 'Negativo',
      breakdown: 'Desglose',
      globalRanking: 'Top Ranking Global',
      currentRank: 'Posición Actual',
      viewRank: 'Ver mi posición',
      retentionCurve: 'Curva de Retención',
      rankingHistory: 'Historial de Ranking',
      rankingHistoryDesc: 'Evolución de la posición en el ranking global.',
      sessionDuration: 'Duración de Sesiones',
      acquisitionSources: 'Fuentes de Adquisición',
      aboutGame: 'Acerca del Juego',
      noDesc: 'Sin descripción disponible.',
      techSpecs: 'Ficha Técnica',
      developer: 'Desarrollador',
      publisher: 'Editor',
      release: 'Lanzamiento',
      rating: 'Clasificación',
      size: 'Tamaño',
      control: 'Control',
      engine: 'Motor',
      languages: 'Idiomas',
      supported: 'soportados',
      genres: 'Géneros',
      modes: 'Modos',
      gallery: 'Galería',
      viewFullGallery: 'VER GALERÍA COMPLETA',
      sysReq: 'Requisitos del Sistema',
      min: 'Mínimos',
      rec: 'Recomendados',
      singlePlayer: 'Un Jugador',
      multiPlayer: 'Multijugador',
      traffic: { steam: 'Steam', direct: 'Directo', search: 'Buscadores', social: 'Social' },
      retentionDay: 'Día',
      retentionLabel: 'Retención Día'
    }
  };

  const t = translations[language.toLowerCase() as 'en' | 'es'];

  useEffect(() => {
    setLoading(true);
    setError(null);
    const slug = Array.isArray(params?.slug) ? params.slug[0] : params?.slug;
     
    if (!slug) return;

    fetch(`/api/games/${slug}?t=${Date.now()}`, { 
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache' }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        return res.json();
      })
      .then((data: ExtendedGameDetail) => {
        setGame(data);
      })
      .catch((err) => {
        console.error("Fallo al cargar juego:", err);
        setError("No se pudo conectar con el servidor.");
      })
      .finally(() => setLoading(false));

  }, [params]);

  const openGallery = (index: number) => setSelectedImageIndex(index);
  const closeGallery = () => setSelectedImageIndex(null);

  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = 'hidden'; 
    } else {
      document.body.style.overflow = 'unset'; 
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImageIndex]);
   
  const handleScrollToRank = () => {
      const currentRank = game?.rankingMovement?.currentRank;
      if (currentRank && rankItemRefs.current[currentRank]) {
          setHighlightedRank(currentRank);
          rankItemRefs.current[currentRank]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => setHighlightedRank(null), 3000);
      }
  };
   
  const safeScreenshots = useMemo(() => game?.images?.screenshots || [], [game]);

  const nextImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => prev === null ? null : (prev + 1) % safeScreenshots.length);
  }, [selectedImageIndex, safeScreenshots]);

  const prevImage = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (selectedImageIndex === null) return;
    setSelectedImageIndex((prev) => prev === null ? null : (prev - 1 + safeScreenshots.length) % safeScreenshots.length);
  }, [selectedImageIndex, safeScreenshots]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;
      if (e.key === 'Escape') closeGallery();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, nextImage, prevImage]);
   
  const growthChartData = useMemo<{ day: string; players: number; }[]>(() => {
      if (!game) return [];
      const baseData = game.playerGrowth14d || [];
      if (growthRange === '14d') return baseData;
      
      const count = growthRange === '30d' ? 30 : 90;
      const result = [];
      const now = new Date();
      let lastPlayers = baseData[baseData.length - 1]?.players || 200000;
      
      for (let i = count; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          const randomVal = pseudoRandom(i + (game.id || 0) * 100); 
          const change = Math.floor(randomVal * 20000) - 8000;
          lastPlayers += change;
          if (lastPlayers < 5000) lastPlayers = 5000; 
          result.push({ day: d.toISOString().split('T')[0], players: Math.floor(lastPlayers) });
      }
      return result;
  }, [game, growthRange]);

  const activityChartData = useMemo<{ time: string; players: number; }[]>(() => {
    if (!game) return [];
    if (activityRange === '24h') {
        const baseActivity = game.peakHours || [];
        return baseActivity.map(item => ({ time: item.hour, players: item.players }));
    } else {
        const count = activityRange === '7d' ? 7 : 30;
        const result = [];
        const now = new Date();
        const baseValue = game.kpiSeries?.currentPlayers || 100000;
        
        for (let i = count - 1; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const randomVal = pseudoRandom(i + (game.id || 0) * 50);
            const randomVar = Math.floor(randomVal * (baseValue * 0.2)) - (baseValue * 0.1);
            const players = baseValue + randomVar;
            const day = d.getDate().toString().padStart(2, '0');
            const month = (d.getMonth() + 1).toString().padStart(2, '0');
            result.push({ time: `${day}/${month}`, players: players > 0 ? players : 0 });
        }
        return result;
    }
  }, [game, activityRange]);

  const rankingHistoryData = game?.rankingMovement?.history || [];

  const platformData = useMemo<{ name: string; value: number; color: string; fill: string; }[]>(() => {
    if (!game?.platformDistribution) return [];
    return game.platformDistribution.map(p => ({
        name: p.platform,
        value: p.percent,
        color: p.platform.includes('PC') ? PALETTE.VERDE : p.platform.includes('PlayStation') ? PALETTE.CEL_AZUL : PALETTE.LILA,
        fill: p.platform.includes('PC') ? 'url(#gradPlatPC)' : p.platform.includes('PlayStation') ? 'url(#gradPlatPS5)' : 'url(#gradPlatXbox)'
    }));
  }, [game]);

  const activePlatformData = useMemo(() => {
        if (platformFilter === 'All') return platformData;
        const selected = platformData.find(p => p.name.includes(platformFilter));
        if (!selected) return platformData;
        return [{ ...selected }, { name: 'Resto', value: 100 - selected.value, fill: 'rgba(255,255,255,0.05)', color: 'transparent' }];
  }, [platformFilter, platformData]);

  const retentionChartData = useMemo<{ day: string; rate: number; }[]>(() => {
      const baseD1 = game?.retention?.d1 || 68;
      if (retentionRange === '3d') {
           return [
               { day: `${t.retentionDay} 1`, rate: baseD1 },
               { day: `${t.retentionDay} 2`, rate: game?.retention?.d2 || Math.floor(baseD1 * 0.7) },
               { day: `${t.retentionDay} 3`, rate: game?.retention?.d3 || Math.floor(baseD1 * 0.5) },
           ];
      }
      const days = retentionRange === '7d' ? 7 : 30;
      return Array.from({ length: days }, (_, i) => ({
          day: `${t.retentionDay} ${i + 1}`,
          rate: Math.max(5, Math.floor(baseD1 * Math.pow(retentionRange === '7d' ? 0.8 : 0.92, i)))
      }));
  }, [game, retentionRange, t.retentionDay]);
   
  const sessionChartData = useMemo<{ range: string; value: number; }[]>(() => {
    let baseData = [{ range: '< 1h', value: 15 }, { range: '1-2h', value: 30 }, { range: '2-4h', value: 35 }, { range: '> 4h', value: 20 }];
    if (sessionRange === '24h') baseData = [{ range: '< 1h', value: 25 }, { range: '1-2h', value: 35 }, { range: '2-4h', value: 25 }, { range: '> 4h', value: 15 }];
    return baseData;
  }, [sessionRange]);

  const globalRankingList = useMemo(() => {
      if(!game) return [];
      const baseRanking = [
        { pos: 1, name: "League of Legends", change: 'same', slug: 'league-of-legends' },
        { pos: 2, name: "Valorant", change: 'up', slug: 'valorant' },
        { pos: 3, name: "Cyberpunk 2077", change: 'up', slug: 'cyberpunk-2077' },
        { pos: 4, name: "Elden Ring", change: 'down', slug: 'elden-ring' },
        { pos: 5, name: "Baldur's Gate 3", change: 'up', slug: 'baldurs-gate-3' },
        { pos: 6, name: "Grand Theft Auto V", change: 'same', slug: 'grand-theft-auto-v' },
        { pos: 7, name: "Minecraft", change: 'down', slug: 'minecraft' },
        { pos: 8, name: "Red Dead Redemption 2", change: 'up', slug: 'red-dead-redemption-2' },
      ];
      let finalList = baseRanking.filter(item => item.slug !== game.slug);
      const currentRank = game.rankingMovement?.currentRank || 10;
      finalList.push({ pos: currentRank, name: game.name, change: game.rankingMovement?.change && game.rankingMovement.change > 0 ? 'up' : 'down', slug: game.slug });
      return finalList.sort((a, b) => a.pos - b.pos).slice(0, 10); 
  }, [game]);

  if (loading) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">{t.loading}</div>;
  if (error || !game) return <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-red-500">{error || "Juego no encontrado"}</div>;

  const score = game.kpiSeries?.score || 0;
  const currentPlayers = game.kpiSeries?.currentPlayers || 0;
  const rank = game.rankingMovement?.currentRank || '-';
  const totalOwners = Math.floor(currentPlayers * 45); 
  const peakAllTime = game.kpiSeries?.peakPlayers || (currentPlayers * 3); 
  const trendingScore = Math.min(99, Math.floor(score + (game.kpiSeries?.players24hChangePercent || 0)));
  const peakCapacity = Math.min(95, Math.floor((currentPlayers / peakAllTime) * 100)) || 65;
  const currentRetentionRate = retentionChartData.length > 0 ? retentionChartData[retentionChartData.length - 1].rate : 0;
  const currentRetentionLabel = `${t.retentionLabel} ${retentionChartData.length}`;
  const topCountriesData = game.kpiSeries?.topCountries?.map(c => ({ name: c.country, players: Math.floor(currentPlayers * (c.weight / 100)), code: c.code.toLowerCase() })) || [];
  const sentimentData: SentimentEntry[] = game.userReviews ? [
      { name: t.positive, value: game.userReviews.positivePercent, fill: 'url(#gradSentimentPos)', color: PALETTE.VERDE },
      { name: t.mixed, value: game.userReviews.mixedPercent, fill: '#666', color: '#666' },
      { name: t.negative, value: game.userReviews.negativePercent, fill: 'url(#gradSentimentNeg)', color: PALETTE.ROSA },
  ] : [];
  const displayDescription = language === 'EN' && game.meta?.description_en ? game.meta.description_en : game.meta?.description_es || game.meta?.description;

  const requirements = game.requirements;
  const minReq = requirements?.min || { os: "N/A", cpu: "N/A", ram: "N/A", gpu: "N/A" };
  const recReq = requirements?.rec || { os: "N/A", cpu: "N/A", ram: "N/A", gpu: "N/A" };
   

  return (
    <div className="min-h-screen flex flex-col bg-[#131119]" style={{ colorScheme: 'dark' }}>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
        .delay-100 { animation-delay: 100ms; } .delay-200 { animation-delay: 200ms; } .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; } .delay-500 { animation-delay: 500ms; } .delay-600 { animation-delay: 600ms; }
      `}</style>
       
      <Header />
       
      <main className="flex-1 px-6 md:px-10 max-w-[1920px] mx-auto w-full relative flex flex-col">
        <div className="flex flex-col md:flex-row gap-8 flex-1 items-stretch">
          <aside className="hidden md:block w-[260px] shrink-0 relative">
             <div className="sticky top-[74px] pt-10 pb-10 h-[calc(100vh-74px)] overflow-y-auto no-scrollbar">
                <VerticalMenu activeItem="all-games" /> 
             </div>
          </aside>

          <div className="flex-1 w-full min-w-0 space-y-8 flex flex-col pt-6 md:pt-10 pb-10">
            {/* HERO SECTION */}
            <div className="relative min-h-[60vh] md:h-[50vh] h-auto w-full group rounded-2xl overflow-hidden border border-white/5 animate-fade-up">
                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${game.images?.hero})` }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-black/30" />
                </div>
                <div className="relative w-full h-full flex flex-col justify-end pb-6 px-4 md:pb-10 md:px-10 pt-20 md:pt-0">
                  <div className="flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-8">
                    <div className="w-32 h-48 md:w-52 md:h-72 rounded-xl shadow-2xl bg-cover bg-center border-4 border-neutral-800 flex-shrink-0 animate-fade-up delay-100" style={{ backgroundImage: `url(${game.images?.cover})` }} />
                    <div className="flex-grow space-y-4 mb-2 animate-fade-up delay-200 w-full text-center md:text-left">
                      <div className="flex gap-2 flex-wrap justify-center md:justify-start">
                        {game.meta?.platforms?.map((p: string) => (
                          <span key={p} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-bold border border-white/10 uppercase tracking-wider">{p}</span>
                        ))}
                      </div>
                      <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight drop-shadow-lg">{game.name}</h1>
                      <div className="flex flex-wrap gap-4 md:gap-6 text-sm md:text-base text-gray-300 font-medium justify-center md:justify-start">
                        <div className="flex items-center gap-2 bg-neutral-900/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 group cursor-default">
                          <Star size={18} className="text-green-400 fill-green-400" /><span className="text-white font-bold">{score}</span><span>Metascore</span>
                        </div>
                        <div className="flex items-center gap-2 bg-neutral-900/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 group cursor-default">
                          <Trophy size={18} style={{ color: PALETTE.AMARILLO }} /><span className="group-hover:text-white transition-colors duration-300">Rank #{rank}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-neutral-900/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 group cursor-default">
                          <Users size={18} style={{ color: PALETTE.CEL_AZUL }} /><span className="group-hover:text-white transition-colors duration-300">{currentPlayers.toLocaleString()} {t.active}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-neutral-900/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/5 group cursor-default">
                          <Calendar size={18} style={{ color: PALETTE.ROSA }} /><span className="group-hover:text-white transition-colors duration-300">{game.meta?.releaseDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mb-2 animate-fade-up delay-300 w-full md:w-auto justify-center">
                        <a href={game.storeUrl || '#'} target="_blank" rel="noopener noreferrer" className="h-12 flex items-center justify-center whitespace-nowrap px-6 md:px-8 text-sm md:text-base rounded-xl font-bold bg-[#50a2ff] text-white hover:bg-[#50a2ff]/90 transition-all shadow-[0_0_20px_rgba(80,162,255,0.3)] hover:scale-105 active:scale-95 font-sans tracking-wide">{t.viewStore}</a>
                         
                        {/* 2. BOTÓN COLECCIÓN (+) */}
                        <DetailCollectionButton game={game} />

                        {/* 3. BOTÓN FAVORITO */}
                        <DetailFavoriteButton game={game} />
                    </div>
                  </div>
                </div>
            </div>

            {/* DASHBOARD GRID (El resto sigue igual) */}
            <div className="py-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
                <div className="xl:col-span-9 space-y-6">
                  {/* KPIs */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-200">
                      <CircularMetric value={75} displayValue={(totalOwners / 1000000).toFixed(1) + "M+"} label={t.totalPlayers} gradientId="gradTotalOwners" colors={['#4530BE', PALETTE.LILA]} icon={Users} />
                      <CircularMetric value={45} displayValue={currentPlayers.toLocaleString()} label={t.activeNow} gradientId="gradActiveNow" colors={[PALETTE.CYAN, PALETTE.VERDE]} icon={Users2} />
                      <CircularMetric value={trendingScore} displayValue={trendingScore + "%"} label={t.trending} gradientId="gradTrending" colors={['#4530BE', '#2DD4E0']} icon={TrendingUp} />
                      <CircularMetric value={peakCapacity} displayValue={peakCapacity + "%"} label={t.peakCap} gradientId="gradPeak" colors={[PALETTE.LILA, PALETTE.ROSA]} icon={Trophy} />
                  </div>

                  {/* RESTO DEL DASHBOARD (Gráficos, etc...) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up delay-300">
                      <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl w-full h-80 flex flex-col transition-all duration-300 hover:border-[#f6339a] hover:shadow-2xl">
                          <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2"><Clock size={20} style={{ color: PALETTE.ROSA }} /> {t.activity}</h3>
                            <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">
                                {['24h', '7d', '30d'].map(range => (<button key={range} onClick={() => setActivityRange(range as '24h' | '7d' | '30d')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activityRange === range ? 'bg-neutral-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-neutral-800/50'}`}>{range.toUpperCase()}</button>))}
                            </div>
                          </div>
                          <div className="flex-1 w-full min-h-0">
                              <ResponsiveContainer width="100%" height="100%"><AreaChart data={activityChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}><defs><linearGradient id="activityChartGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={PALETTE.CYAN} /><stop offset="50%" stopColor={PALETTE.LILA} /><stop offset="100%" stopColor={PALETTE.MORADO} /></linearGradient><linearGradient id="activityFillGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={PALETTE.MORADO} stopOpacity={0.3}/><stop offset="95%" stopColor={PALETTE.MORADO} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="time" stroke="#666" fontSize={12} tickLine={false} axisLine={false} dy={10} minTickGap={30} /><YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} /><Tooltip content={<CustomTooltip />} cursor={{ stroke: PALETTE.ROSA, strokeWidth: 2 }} /><Area type="monotone" dataKey="players" name={t.players} stroke="url(#activityChartGradient)" fill="url(#activityFillGradient)" fillOpacity={1} strokeWidth={4} dot={{ r: 0 }} activeDot={CustomActiveDot} animationDuration={1000}/></AreaChart></ResponsiveContainer>
                          </div>
                      </div>
                      <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl w-full h-80 flex flex-col transition-all duration-300 hover:border-[#2DD4E0] hover:shadow-2xl">
                          <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2"><LineChartIcon size={20} style={{ color: PALETTE.CYAN }} /> {t.growth}</h3>
                            <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">
                                {['14d', '30d', '90d'].map(range => (<button key={range} onClick={() => setGrowthRange(range as '14d' | '30d' | '90d')} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${growthRange === range ? 'bg-neutral-700 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300 hover:bg-neutral-800/50'}`}>{range.toUpperCase()}</button>))}
                            </div>
                          </div>
                          <div className="flex-1 w-full min-h-0">
                            <ResponsiveContainer width="100%" height="100%"><AreaChart data={growthChartData}><defs><linearGradient id="growthStrokeGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={PALETTE.VERDE} /><stop offset="50%" stopColor={PALETTE.CYAN} /><stop offset="100%" stopColor={PALETTE.CEL_AZUL} /></linearGradient><linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={PALETTE.CEL_AZUL} stopOpacity={0.3}/><stop offset="95%" stopColor={PALETTE.CEL_AZUL} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="day" stroke="#666" fontSize={12} tickLine={false} axisLine={false} minTickGap={50} tickFormatter={(value) => { const parts = value.split('-'); if (parts.length === 3) return `${parts[2]}/${parts[1]}`; return value; }} /><YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} /><Tooltip content={<CustomTooltip />} cursor={{ stroke: PALETTE.CYAN }} /><Area type="monotone" dataKey="players" name={t.players} stroke="url(#growthStrokeGradient)" fillOpacity={1} fill="url(#colorGrowth)" strokeWidth={4} dot={{ r: 0 }} activeDot={CustomActiveDotGrowth} animationDuration={1000} /></AreaChart></ResponsiveContainer>
                          </div>
                      </div>
                  </div>
                  
                  {/* Top Countries / Platforms */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up delay-400">
                    <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl h-80 flex flex-col transition-all duration-300 hover:border-[#b340bf] hover:shadow-2xl">
                        <h3 className="font-bold text-lg mb-4 text-white border-b border-neutral-800 pb-2 flex items-center gap-2"><Globe size={20} style={{ color: PALETTE.LILA }} /> {t.topCountries}</h3>
                        <ul className="space-y-3 pt-2 flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {topCountriesData.map((country, index) => (
                                <li key={country.name} className="flex justify-between items-center text-sm p-2 hover:bg-white/5 rounded transition-colors">
                                    <span className="text-gray-400 flex items-center gap-3"><span className="font-mono text-xs opacity-50 w-3">{index + 1}.</span> <img src={`https://flagcdn.com/w40/${country.code || 'un'}.png`} alt={country.name} className="w-6 h-4 object-cover rounded-sm"/><span>{country.name}</span></span><span className="font-medium text-white">{country.players.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl h-80 flex flex-col transition-all duration-300 hover:border-[#50a2ff] hover:shadow-2xl">
                        <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2"><Monitor size={20} style={{ color: PALETTE.CEL_AZUL }} /> {t.platforms}</h3>
                            <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">{['All', 'PC', 'PlayStation', 'Xbox'].map(plat => (<button key={plat} onClick={() => setPlatformFilter(plat as 'All' | 'PC' | 'PlayStation' | 'Xbox')} className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${platformFilter === plat ? 'bg-neutral-700 text-white shadow-sm' : 'text-gray-500 hover:text-white hover:bg-neutral-800/50' }`}>{plat === 'All' ? t.all : plat === 'PlayStation' ? 'PS' : plat}</button>))}</div>
                        </div>
                        <div className="flex-1 grid grid-cols-2 items-center min-h-0">
                            <div className="w-full h-full relative flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%"><RechartsPieChart><defs><linearGradient id="gradPlatPC" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={PALETTE.CYAN} /><stop offset="100%" stopColor={PALETTE.VERDE} /></linearGradient><linearGradient id="gradPlatPS5" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={PALETTE.CEL_AZUL} /><stop offset="100%" stopColor="#2563eb" /></linearGradient><linearGradient id="gradPlatXbox" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={PALETTE.LILA} /><stop offset="100%" stopColor={PALETTE.ROSA} /></linearGradient></defs><Pie data={activePlatformData} innerRadius={55} outerRadius={75} paddingAngle={platformFilter === 'All' ? 5 : 0} dataKey="value" startAngle={90} endAngle={-270} cx="50%" cy="50%">{activePlatformData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} stroke="none" />))}</Pie><Tooltip content={<CustomTooltip />} /></RechartsPieChart></ResponsiveContainer>
                            </div>
                            <div className="flex flex-col justify-center gap-3 text-sm px-6">
                                {platformFilter === 'All' ? (platformData.map((p) => (<div key={p.name} className="flex justify-between items-center group"><span className="flex items-center gap-3"><span className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: p.color, color: p.color }}></span><span className="text-gray-400 group-hover:text-white transition-colors">{p.name}</span></span><span className="font-bold text-white">{p.value}%</span></div>))) : ((() => { const selected = platformData.find(p => p.name.includes(platformFilter)); if (!selected) return null; return (<div className="flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-300"><p className="text-gray-400 text-xs uppercase font-bold mb-1">{t.marketShare}</p><p className="text-5xl font-black mb-2 drop-shadow-lg" style={{ color: selected.color }}>{selected.value}%</p><span className="px-3 py-1 bg-neutral-800 rounded-full text-xs text-white border border-white/10 font-bold">{selected.name}</span></div>); })())}
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Player Reception / Stars / Rank List */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-up delay-500">
                    <div className="lg:col-span-4 bg-neutral-900/80 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800 shadow-xl flex flex-col justify-between h-80 transition-all duration-300 hover:border-[#00FF62] hover:shadow-2xl">
                        <h3 className="font-bold text-lg mb-2 text-white flex items-center gap-2"><Heart size={20} style={{ color: PALETTE.VERDE }} /> {t.playerReception}</h3>
                        <div className="flex items-center justify-between py-4">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                  <ResponsiveContainer width="100%" height="100%"><RechartsPieChart><defs><linearGradient id="gradSentimentPos" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={PALETTE.VERDE} /><stop offset="100%" stopColor={PALETTE.CYAN} /></linearGradient><linearGradient id="gradSentimentNeg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={PALETTE.ROSA} /><stop offset="100%" stopColor={PALETTE.LILA} /></linearGradient></defs><Pie data={sentimentData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value" stroke="none">{sentimentData.map((entry: SentimentEntry, index: number) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Pie></RechartsPieChart></ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none"><span className="text-xl font-bold text-white">{game.userReviews?.positivePercent || 0}%</span></div>
                            </div>
                            <div className="flex-1 pl-6 space-y-3">
                                  <div className="flex justify-between text-sm text-gray-400 mb-1"><span>{t.globalScore}</span><span className="text-white font-bold">{score} / 100</span></div>
                                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-green-500 to-emerald-400" style={{ width: `${score}%` }}></div></div>
                                  <p className="text-xs text-gray-500 italic mt-2">{t.scoreDesc}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {sentimentData.map((s: SentimentEntry) => (<div key={s.name} className="bg-neutral-800/50 rounded-lg p-2 text-center border border-white/5"><p className="text-xs text-gray-400">{s.name}</p><p className="font-bold text-white" style={{ color: s.color }}>{s.value}%</p></div>))}
                        </div>
                    </div>
                    <div className="lg:col-span-4 bg-neutral-900/80 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800 shadow-xl flex flex-col h-80 transition-all duration-300 hover:border-[#efb537] hover:shadow-2xl">
                        <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2"><Star size={20} style={{ color: PALETTE.AMARILLO }} /> {t.breakdown}</h3>
                        <div className="flex-1 flex flex-col justify-center space-y-3">
                            {['5', '4', '3', '2', '1'].map((stars) => {
                                const percent = game.userReviews?.starsDistribution?.[stars] || 0;
                                let backgroundStyle = '';
                                const starNum = parseInt(stars);
                                if (starNum === 5) { backgroundStyle = `linear-gradient(90deg, ${PALETTE.AMARILLO}, #ffd700)`; } else if (starNum >= 3) { backgroundStyle = `linear-gradient(90deg, ${PALETTE.VERDE}, ${PALETTE.CYAN})`; } else { backgroundStyle = `linear-gradient(90deg, ${PALETTE.ROSA}, ${PALETTE.LILA})`; }
                                return (<div key={stars} className="group flex items-center gap-3 text-xs sm:text-sm"><div className="flex items-center gap-1 w-8 justify-end text-gray-400"><span className="font-bold">{stars}</span><Star size={10} className="fill-gray-600 text-gray-600" /></div><div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-1000 group-hover:brightness-110" style={{ width: `${percent}%`, background: backgroundStyle }} /></div><span className="w-8 text-right font-mono text-gray-500">{percent}%</span></div>);
                            })}
                        </div>
                    </div>
                    <div className="lg:col-span-4 bg-neutral-900/80 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800 shadow-xl flex flex-col h-80 transition-all duration-300 hover:border-[#efb537] hover:shadow-2xl">
                        <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2"><Trophy size={20} style={{ color: PALETTE.AMARILLO }} /> {t.globalRanking}</h3>
                            <button onClick={handleScrollToRank} className="text-xs bg-neutral-800 hover:bg-[#efb537]/20 hover:text-[#efb537] text-gray-400 px-3 py-1.5 rounded-lg border border-neutral-700 transition-all flex items-center gap-2 font-bold"><LocateFixed size={14}/> {t.viewRank}</button>
                        </div>
                        <div ref={rankListRef} className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full scroll-smooth relative">
                            {globalRankingList.map((item) => {
                                const isCurrent = item.slug === game.slug;
                                const isHighlighted = highlightedRank === item.pos;
                                return (<div key={item.slug} ref={(el) => { if (el && isCurrent) rankItemRefs.current[item.pos] = el; }} className={`flex items-center justify-between p-3 rounded-lg text-sm transition-all duration-500 ${isHighlighted ? 'bg-[#efb537]/20 border border-[#efb537]/50 shadow-lg shadow-[#efb537]/10' : isCurrent ? 'bg-white/5 border border-white/10 hover:bg-white/10' : 'hover:bg-neutral-800 border border-transparent'}`}><div className="flex items-center gap-4"><div className="w-6 flex justify-center"><RankMedal rank={item.pos} /></div><span className={`font-medium ${isCurrent ? 'text-white' : 'text-gray-400'}`}>{item.name}</span></div>{item.change === 'up' && <TrendingUp size={14} className="text-green-500" />}{item.change === 'down' && <TrendingUp size={14} className="text-red-500 rotate-180" />}{item.change === 'same' && <div className="w-2 h-0.5 bg-gray-600"></div>}</div>);
                            })}
                        </div>
                    </div>
                  </div>
                  
                  {/* Retention */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-up delay-600">
                      <div className="bg-neutral-900/80 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800 shadow-xl h-80 flex flex-col relative overflow-hidden group transition-all duration-300 hover:border-[#f6339a] hover:shadow-2xl">
                        <div className="flex justify-between items-end mb-6 border-b border-neutral-800 pb-4 z-10">
                            <div>
                                <h3 className="font-bold text-lg text-white flex items-center gap-2"><Users2 size={20} style={{ color: PALETTE.ROSA }} /> {t.retentionCurve}</h3>
                                <div className="flex gap-1 mt-2">{['3d', '7d', '30d'].map(range => (<button key={range} onClick={() => setRetentionRange(range as '3d' | '7d' | '30d')} className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all border border-transparent ${retentionRange === range ? 'bg-neutral-700 text-white shadow-sm border-white/10' : 'text-gray-500 hover:text-gray-300 hover:bg-neutral-800/50'}`}>{range.toUpperCase()}</button>))}</div>
                            </div>
                            <div className="text-right"><p className="text-2xl font-black text-white">{currentRetentionRate}%</p><p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{currentRetentionLabel}</p></div>
                        </div>
                        <div className="flex-1 w-full min-h-0 z-10">
                            <ResponsiveContainer width="100%" height="100%"><AreaChart data={retentionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="gradRetentionStroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={PALETTE.ROSA} /><stop offset="100%" stopColor={PALETTE.LILA} /></linearGradient><linearGradient id="gradRetentionFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={PALETTE.ROSA} stopOpacity={0.4}/><stop offset="95%" stopColor={PALETTE.LILA} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="day" stroke="#666" fontSize={12} tickLine={false} axisLine={false} dy={10} minTickGap={30} /><YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} unit="%" /><Tooltip content={<CustomTooltip />} cursor={{ stroke: PALETTE.ROSA, strokeWidth: 1, strokeDasharray: '4 4' }} /><Area type="monotone" dataKey="rate" name={t.players} stroke="url(#gradRetentionStroke)" fill="url(#gradRetentionFill)" strokeWidth={4} animationDuration={2000} dot={{ r: 0 }} activeDot={CustomActiveDotRetention} /></AreaChart></ResponsiveContainer>
                        </div>
                      </div>
                      <div className="bg-neutral-900/80 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800 shadow-xl h-80 flex flex-col relative overflow-hidden group transition-all duration-300 hover:border-[#efb537] hover:shadow-2xl">
                         <div className="flex justify-between items-end mb-6 border-b border-neutral-800 pb-4 z-10">
                            <div>
                                <h3 className="font-bold text-lg text-white flex items-center gap-2"><Trophy size={20} style={{ color: PALETTE.AMARILLO }} /> {t.rankingHistory}</h3>
                                <p className="text-xs text-gray-500 mt-1">{t.rankingHistoryDesc}</p>
                            </div>
                            <div className="text-right"><p className="text-2xl font-black text-white">#{game.rankingMovement?.currentRank}</p><p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{t.currentRank}</p></div>
                        </div>
                        <div className="flex-1 w-full min-h-0 z-10">
                              <ResponsiveContainer width="100%" height="100%"><AreaChart data={rankingHistoryData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}><defs><linearGradient id="gradRankingStroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor={PALETTE.AMARILLO} /><stop offset="50%" stopColor="#ff8f6b" /><stop offset="100%" stopColor={PALETTE.ROSA} /></linearGradient><linearGradient id="gradRankingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={PALETTE.AMARILLO} stopOpacity={0.6}/><stop offset="50%" stopColor={PALETTE.AMARILLO} stopOpacity={0.2}/><stop offset="95%" stopColor={PALETTE.ROSA} stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="day" stroke="#666" fontSize={12} tickLine={false} axisLine={false} dy={10} tickFormatter={(val) => val.split('-').slice(1).reverse().join('/')} /><YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} reversed={true} domain={['dataMin - 1', 'dataMax + 1']} /><Tooltip content={<CustomTooltip />} cursor={{ stroke: PALETTE.AMARILLO, strokeWidth: 1, strokeDasharray: '4 4' }} /><Area type="monotone" dataKey="rank" name="Rank" stroke="url(#gradRankingStroke)" fill="url(#gradRankingFill)" strokeWidth={4} dot={{ r: 0 }} activeDot={CustomActiveDotRanking} baseValue="dataMax" /></AreaChart></ResponsiveContainer>
                        </div>
                      </div>
                  </div>
                  
                  {/* Session Duration / Traffic */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 animate-fade-up delay-600">
                      <div className="bg-neutral-900/80 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800 shadow-xl h-80 flex flex-col relative overflow-hidden group transition-all duration-300 hover:border-[#50a2ff] hover:shadow-2xl">
                          <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2"><Timer size={20} style={{ color: PALETTE.CEL_AZUL }} /> {t.sessionDuration}</h3>
                            <div className="flex gap-1 bg-neutral-800 rounded-lg p-1">{['24h', '7d', '30d'].map(range => (<button key={range} onClick={() => setSessionRange(range as '24h' | '7d' | '30d')} className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all border border-transparent ${sessionRange === range ? 'bg-neutral-700 text-white shadow-sm border-white/10' : 'text-gray-500 hover:text-gray-300 hover:bg-neutral-800/50'}`}>{range.toUpperCase()}</button>))}</div>
                          </div>
                          <div className="flex-1 w-full min-h-0">
                              <ResponsiveContainer width="100%" height="100%"><BarChart data={sessionChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="gradSession" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={PALETTE.CYAN} /><stop offset="100%" stopColor={PALETTE.CEL_AZUL} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} /><XAxis dataKey="range" stroke="#666" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} unit="%" /><Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} /><Bar dataKey="value" name="%" radius={[4, 4, 0, 0]} barSize={60} fill="url(#gradSession)">{ }<LabelList dataKey="value" position="top" fill="white" fontSize={12} formatter={(val: any) => typeof val === 'number' ? `${val}%` : String(val)} /></Bar></BarChart></ResponsiveContainer>
                          </div>
                      </div>
                      <div className="bg-neutral-900/80 backdrop-blur-sm p-6 rounded-2xl border border-neutral-800 shadow-xl h-80 flex flex-col relative overflow-hidden group transition-all duration-300 hover:border-[#00FF62] hover:shadow-2xl">
                            <h3 className="font-bold text-lg mb-2 text-white border-b border-neutral-800 pb-2 flex items-center gap-2"><Target size={20} style={{ color: PALETTE.VERDE }} /> {t.acquisitionSources}</h3>
                            <div className="flex-1 w-full min-h-0 flex items-center">
                                <div className="w-1/2 h-full relative">
                                    <ResponsiveContainer width="100%" height="100%"><RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="80%" barSize={15} data={TRAFFIC_DATA.map(d => ({ ...d, fill: d.source === 'steam' ? 'url(#gradRadialViolet)' : d.source === 'direct' ? 'url(#gradRadialGreen)' : d.source === 'search' ? 'url(#gradRadialCyan)' : 'url(#gradRadialPink)' })).reverse()} startAngle={90} endAngle={-270}><defs><linearGradient id="gradRadialViolet" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={PALETTE.MORADO} /><stop offset="100%" stopColor={PALETTE.LILA} /></linearGradient><linearGradient id="gradRadialGreen" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={PALETTE.VERDE} /><stop offset="100%" stopColor="#10b981" /></linearGradient><linearGradient id="gradRadialCyan" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={PALETTE.CYAN} /><stop offset="100%" stopColor={PALETTE.CEL_AZUL} /></linearGradient><linearGradient id="gradRadialPink" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor={PALETTE.ROSA} /><stop offset="100%" stopColor="#be185d" /></linearGradient></defs><RadialBar background={{ fill: '#333' }} dataKey="value" cornerRadius={10} /><Tooltip content={<CustomTooltip />} cursor={false} /></RadialBarChart></ResponsiveContainer>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50"><Globe size={24} className="text-gray-500 animate-pulse" /></div>
                                </div>
                                <div className="w-1/2 pl-4 flex flex-col justify-center gap-3">
                                    {TRAFFIC_DATA.map((item) => {
                                        let color = PALETTE.MORADO;
                                        if(item.source === 'steam') { color = PALETTE.LILA; } if(item.source === 'direct') { color = PALETTE.VERDE; } if(item.source === 'search') { color = PALETTE.CYAN; } if(item.source === 'social') { color = PALETTE.ROSA; } 
                                        return (<div key={item.source} className="flex items-center justify-between group/item"><div className="flex items-center gap-2 w-full"><div className="flex flex-col w-full"><div className="flex justify-between items-center mb-1"><span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t.traffic[item.source as keyof typeof t.traffic]}</span></div><div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden relative"><div className="h-full rounded-full absolute top-0 left-0 transition-all duration-1000 ease-out" style={{ width: `${item.value}%`, backgroundColor: color }} /></div></div></div></div>);
                                    })}
                                </div>
                            </div>
                        </div>
                  </div>
                </div>

                {/* SIDEBAR DERECHO */}
                <aside className="xl:col-span-3 flex flex-col gap-6 h-full animate-fade-up delay-600">
                  <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl flex flex-col transition-all duration-300 hover:border-neutral-600 hover:shadow-2xl flex-1 min-h-[200px]">
                      <h3 className="font-bold text-lg mb-4 text-white border-b border-neutral-800 pb-2 flex items-center gap-2"><Info size={18} className="text-gray-400"/> {t.aboutGame}</h3>
                      <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-line">{displayDescription || t.noDesc}</p>
                  </div>
                  
                  <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl h-auto flex flex-col transition-all duration-300 hover:border-neutral-600 hover:shadow-2xl">
                      <h3 className="font-bold text-lg mb-4 text-white border-b border-neutral-800 pb-2 flex items-center gap-2"><FileText size={18} className="text-gray-400"/> {t.techSpecs}</h3>
                      <ul className="space-y-4 text-sm text-gray-400">
                        <li className="flex justify-between"><span>{t.developer}</span><span className="text-white font-medium">{game.meta?.developer}</span></li>
                        <li className="flex justify-between"><span>{t.publisher}</span><span className="text-white font-medium">{game.meta?.publisher}</span></li>
                        <li className="flex justify-between"><span>{t.release}</span><span className="text-white font-medium">{game.meta?.releaseDate}</span></li>
                        <li className="flex justify-between"><span>{t.rating}</span><span className="text-white font-medium flex items-center gap-1"><Shield size={12}/> {game.meta?.ageRating || "M (17+)"}</span></li>
                        <li className="flex justify-between"><span>{t.size}</span><span className="text-white font-medium flex items-center gap-1"><HardDrive size={12}/> {game.meta?.downloadSize || "60 GB"}</span></li>
                        <li className="flex justify-between"><span>{t.control}</span><span className="text-white font-medium flex items-center gap-1"><Gamepad2 size={12}/> {game.meta?.controllerSupport ? "Total" : "Parcial"}</span></li>
                        <li className="flex justify-between"><span>{t.engine}</span><span className="text-white font-medium flex items-center gap-1"><Box size={12}/> {game.meta?.engine || "Proprietary"}</span></li>
                        <li className="flex justify-between"><span>{t.languages}</span><span className="text-white font-medium flex items-center gap-1"><Languages size={12}/> {game.meta?.languages?.length || "12"} {t.supported}</span></li>
                        <li className="pt-2"><span className="block mb-2">{t.genres}</span><div className="flex flex-wrap gap-2 justify-end">{game.meta?.genres?.map((g: string) => (<span key={g} className="px-2 py-1 bg-neutral-800 rounded text-xs text-gray-300 border border-[#b340bf]/50">{g}</span>))}</div></li>
                        <li className="pt-2"><span className="block mb-2">{t.modes}</span><div className="flex flex-wrap gap-2 justify-end">{game.meta?.gameModes?.map((m: string) => (<span key={m} className="px-2 py-1 bg-neutral-800 rounded text-xs text-gray-300 border border-[#50a2ff]/50">{m}</span>)) || [t.singlePlayer, t.multiPlayer].map(m => <span key={m} className="px-2 py-1 bg-neutral-800 rounded text-xs text-gray-300 border border-[#50a2ff]/50">{m}</span>)}</div></li>
                      </ul>
                  </div>

                  <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl h-96 flex flex-col group/card transition-all duration-300 hover:border-neutral-600 hover:shadow-2xl">
                    <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-lg text-white border-b border-neutral-800 pb-2 flex-grow flex items-center gap-2"><ImageIcon size={18} className="text-gray-400"/> {t.gallery}</h3></div>
                    <div className="grid grid-cols-2 gap-3 flex-1 min-h-0 mb-4">
                        {Array.from({ length: 4 }).map((_, i) => {
                            const src = safeScreenshots[i] || game.images?.screenshots?.[i];
                            return (<div key={i} className="relative rounded-xl overflow-hidden cursor-pointer group/img border border-white/5 hover:border-white/20 transition-colors bg-neutral-800 aspect-video w-full" onClick={() => openGallery(i)}>{src ? (<><img src={src} alt={`Gameplay screenshot ${i + 1}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" loading="lazy" /><div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/0 transition-colors duration-300" /></>) : (<div className="absolute inset-0 flex items-center justify-center bg-neutral-800/50"><ImageIcon size={24} className="text-neutral-700" /></div>)}</div>);
                        })}
                    </div>
                    <button onClick={() => openGallery(0)} className="w-full py-3 bg-neutral-800 border border-neutral-700 text-gray-300 rounded-xl transition-all duration-300 font-bold tracking-wide text-xs flex items-center justify-center gap-2 group/btn shadow-lg hover:bg-[#f6339a] hover:border-[#f6339a] hover:text-white hover:shadow-[0_0_30px_rgba(246,51,154,0.6)]"><ImageIcon size={16} className="group-hover/btn:scale-110 transition-transform" />{t.viewFullGallery}</button>
                  </div>

                  {/* NUEVA SECCIÓN DE REQUISITOS REALES */}
                  <div className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800 shadow-xl h-auto flex flex-col transition-all duration-300 hover:border-neutral-600 hover:shadow-2xl">
                      <h3 className="font-bold text-lg mb-4 text-white border-b border-neutral-800 pb-2 flex items-center gap-2"><Monitor size={18} className="text-gray-400"/> {t.sysReq}</h3>
                      <div className="flex flex-col justify-center gap-8 px-2 py-4 h-full"> 
                        <div className="flex flex-col gap-3">
                           <p className="font-bold text-gray-500 uppercase tracking-wide text-xs border-b border-neutral-800 pb-2 mb-1">{t.min}</p>
                           <div className="space-y-5">
                               <div><div className="flex items-center gap-2 text-gray-500 mb-1 text-sm uppercase"><Cpu size={16}/> CPU</div><div className="text-gray-300 font-medium text-base leading-tight">{minReq.cpu || "N/A"}</div></div>
                               <div><div className="flex items-center gap-2 text-gray-500 mb-1 text-sm uppercase"><Zap size={16}/> RAM</div><div className="text-gray-300 font-medium text-base leading-tight">{minReq.ram || "N/A"}</div></div>
                               <div><div className="flex items-center gap-2 text-gray-500 mb-1 text-sm uppercase"><HardDrive size={16}/> GPU</div><div className="text-gray-300 font-medium text-base leading-tight">{minReq.gpu || "N/A"}</div></div>
                           </div>
                        </div>
                        <div className="flex flex-col gap-3">
                           <p className="font-bold text-[#50a2ff] uppercase tracking-wide text-xs border-b border-neutral-800 pb-2 mb-1">{t.rec}</p>
                           <div className="space-y-5">
                               <div><div className="flex items-center gap-2 text-gray-500 mb-1 text-sm uppercase"><Cpu size={16} className="text-[#50a2ff]"/> CPU</div><div className="text-white font-medium text-base leading-tight">{recReq.cpu || "N/A"}</div></div>
                               <div><div className="flex items-center gap-2 text-gray-500 mb-1 text-sm uppercase"><Zap size={16} className="text-[#50a2ff]"/> RAM</div><div className="text-white font-medium text-base leading-tight">{recReq.ram || "N/A"}</div></div>
                               <div><div className="flex items-center gap-2 text-gray-500 mb-1 text-sm uppercase"><HardDrive size={16} className="text-[#50a2ff]"/> GPU</div><div className="text-white font-medium text-base leading-tight">{recReq.gpu || "N/A"}</div></div>
                           </div>
                        </div>
                     </div>
                  </div>
                </aside>

            </div>

            {/* LIGHTBOX */}
            {selectedImageIndex !== null && safeScreenshots && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md transition-all duration-300" onClick={closeGallery}>
                    <button onClick={closeGallery} className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[110]"><X size={24} /></button>
                    <button onClick={prevImage} className="absolute left-4 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[110] hidden md:block"><ChevronLeft size={36} /></button>
                    <div className="relative max-w-[90vw] max-h-[90vh] shadow-2xl rounded-lg overflow-hidden z-[105]" onClick={(e) => e.stopPropagation()}>
                        <img src={safeScreenshots[selectedImageIndex]} alt={`Screenshot ${selectedImageIndex + 1}`} className="max-w-full max-h-[90vh] object-contain" />
                        <div className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm bg-black/50 py-2 backdrop-blur-sm">{selectedImageIndex + 1} / {safeScreenshots.length}</div>
                    </div>
                    <button onClick={nextImage} className="absolute right-4 p-3 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all z-[110] hidden md:block"><ChevronRight size={36} /></button>
                </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}