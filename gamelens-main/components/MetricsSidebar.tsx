'use client';

import React, { useMemo } from 'react';
import { TrendingUp, Users, Star, Activity, Trophy, Clock } from 'lucide-react';
import { 
    PieChart, Pie, Cell, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';
// CONEXIÓN AL CONTEXTO
import { useLanguage } from '../app/context/LanguageContext';

// ============================================================================
// DICCIONARIOS DE TRADUCCIÓN (Helpers)
// ============================================================================
const CHART_TRANSLATIONS = {
    en: {
        title: '24h Activity',
        hour: 'Hour',
        players: 'players'
    },
    es: {
        title: 'Actividad 24h',
        hour: 'Hora',
        players: 'jugadores'
    }
};

const SIDEBAR_TRANSLATIONS = {
    en: {
        preview: 'Preview',
        score: 'Score',
        online: 'Online',
        trending: 'Trending',
        peakCap: 'Peak Cap.'
    },
    es: {
        preview: 'Vista Previa',
        score: 'Puntaje',
        online: 'En Línea',
        trending: 'Tendencia',
        peakCap: 'Cap. Máx.'
    }
};

// ============================================================================
// BLOQUE 1: ACTIVITY TIMELINE CHART (Totalmente Autónomo)
// ============================================================================

interface TimelineChartDataItem {
    hour: string;
    players: number;
    [key: string]: unknown;
}

interface CustomTimelineTooltipProps {
    active?: boolean;
    payload?: Array<{
        value: number;
        payload: TimelineChartDataItem;
    }>;
    label?: string | number;
}

interface ActiveDotProps {
    cx?: number;
    cy?: number;
    /* eslint-disable @typescript-eslint/no-explicit-any */
    [key: string]: any;
    /* eslint-enable @typescript-eslint/no-explicit-any */
}

interface ActivityTimelineChartProps {
    data: { hour: string; players: number }[];
}

const CustomTooltip = ({ active, payload, label }: CustomTimelineTooltipProps) => {
    // Hook de idioma dentro del Tooltip
    const { language } = useLanguage();
    const t = CHART_TRANSLATIONS[language.toLowerCase() as 'en' | 'es'];

    if (active && payload && payload.length) {
        return (
            <div className="p-3 bg-neutral-900/95 backdrop-blur-md border border-white/10 rounded-xl shadow-2xl text-white">
                <p className="font-bold text-sm mb-1">{t.hour}: {label}</p>
                <div className="flex items-center gap-2">
                    {/* Color Rosa (#f6339a) */}
                    <span className="w-2 h-2 rounded-full bg-[#f6339a]" />
                    <p className="text-sm text-gray-200">{`${payload[0].value.toLocaleString()} ${t.players}`}</p>
                </div>
            </div>
        );
    }
    return null;
};

const CustomActiveDot = (props: ActiveDotProps) => {
    const { cx, cy } = props;
    if (cx === undefined || cy === undefined) return null;
    return (
        // Color Rosa (#f6339a)
        <circle cx={cx} cy={cy} r={6} fill="#f6339a" stroke="#fff" strokeWidth={2} />
    );
};

const ActivityTimelineChart: React.FC<ActivityTimelineChartProps> = ({ data }) => {
    // Hook de idioma para el título del gráfico
    const { language } = useLanguage();
    const t = CHART_TRANSLATIONS[language.toLowerCase() as 'en' | 'es'];

    const formatYAxis = (tick: number) => `${(tick / 1000).toFixed(0)}k`;
    // El hover de este chart es ROSA (#f6339a)
    const HOVER_COLOR = '#f6339a';

    const handleHover = (e: React.MouseEvent<HTMLDivElement>, isEntering: boolean) => {
        const target = e.currentTarget;
        if (isEntering) {
            target.style.borderColor = HOVER_COLOR + '80';
            target.style.boxShadow = 'none';
        } else {
            target.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            target.style.boxShadow = 'none';
        }
    };

    return (
        <div 
            className="bg-neutral-900/80 p-5 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-md h-full flex flex-col w-full transition-colors duration-300"
            onMouseEnter={(e) => handleHover(e, true)}
            onMouseLeave={(e) => handleHover(e, false)}
        >
            <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
                {/* Icono Clock es ROSA (#f6339a) */}
                <Clock size={16} className="text-[#f6339a]" /> {t.title}
            </h3>

            <div className="flex-1 w-full min-h-[100px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                            {/* Degradado Linea: Cyan -> Lila -> Morado */}
                            <linearGradient id="activityChartGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#2DD4E0" />
                                <stop offset="50%" stopColor="#b340bf" />
                                <stop offset="100%" stopColor="#4530BE" />
                            </linearGradient>
                            {/* NUEVO: Degradado Relleno (Sombra Violeta) */}
                            <linearGradient id="activityFillGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4530BE" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#4530BE" stopOpacity={0}/>
                            </linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

                        <XAxis
                            dataKey="hour"
                            stroke="#555"
                            tick={{ fontSize: 12, fill: '#666' }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />

                        <YAxis
                            stroke="#555"
                            tickFormatter={formatYAxis}
                            tick={{ fontSize: 12, fill: '#666' }}
                            axisLine={false}
                            tickLine={false}
                        />

                        <Tooltip
                            content={<CustomTooltip />}
                            cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 2 }}
                        />

                        <Area
                            type="monotone"
                            dataKey="players"
                            stroke="url(#activityChartGradient)"
                            fill="url(#activityFillGradient)"
                            fillOpacity={1}
                            strokeWidth={4}
                            dot={{ r: 0 }}
                            activeDot={CustomActiveDot}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};


// ============================================================================
// BLOQUE 2: METRICS SIDEBAR (Componente Principal)
// ============================================================================

interface GameBasic {
    id: number;
    name: string;
    coverUrl: string;
    score: number;
    currentPlayers?: number;
}

interface GameRating {
    starsAverage: number;
    numeric: number;
    totalReviews: number;
    starsDistribution: Record<string, number>;
    [key: string]: unknown;
}

interface FeaturedGame extends GameBasic {
    rating: GameRating;
    players: {
        activity24h: number;
        peakAllTime: number;
    };
    activityByWeekday: { weekday: string; avgPlayers: number }[];
    activity24hTimeline: { hour: string; players: number }[];
}

interface MetricsSidebarProps {
    game: GameBasic | FeaturedGame;
    defaultGame: FeaturedGame;
}

const CircularMetric = ({ value, label, gradientId, colors, icon: Icon }: { value: number, label: string, gradientId: string, colors: string[], icon: React.ElementType }) => {
    const data = [
        { value: value, fill: `url(#${gradientId})` },
        { value: 100 - value, fill: 'rgba(255,255,255,0.05)' }
    ];
    const hoverColor = colors[1];

    return (
        <div
            className="flex flex-col items-center justify-center p-2 bg-black/40 rounded-xl border border-white/5 transition-all duration-300"
            style={{ '--hover-color': hoverColor } as React.CSSProperties}
            onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.borderColor = hoverColor + '80';
                target.style.backgroundColor = hoverColor + '1A';
            }}
            onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                target.style.backgroundColor = 'rgba(0, 0, 0, 0.4)';
            }}
        >
            <div className="relative w-14 h-14 mb-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
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
                            innerRadius={20} 
                            outerRadius={26} 
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
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center drop-shadow-lg">
                    <Icon size={16} style={{ color: colors[1] }} />
                </div>
            </div>
            <div className="text-center">
                <p className="text-base font-bold text-white leading-none tabular-nums">{value}%</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-wide font-bold mt-1">{label}</p>
            </div>
        </div>
    );
};

export const MetricsSidebar: React.FC<MetricsSidebarProps> = ({ game, defaultGame }) => {
    // Hook de idioma para el sidebar principal
    const { language } = useLanguage();
    const t = SIDEBAR_TRANSLATIONS[language.toLowerCase() as 'en' | 'es'];

    const PREVIEW_HOVER_COLOR = '#3b82f6';

    const applyHoverStyle = (e: React.MouseEvent<HTMLDivElement>, color: string, isEntering: boolean) => {
        const target = e.currentTarget;
        if (isEntering) {
            target.style.borderColor = color + '80';
            target.style.boxShadow = 'none';
        } else {
            target.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            target.style.boxShadow = 'none';
        }
    };

    const { displayData, trendingScore, peakCapacity } = useMemo(() => {
        
        if (!game && !defaultGame) return { displayData: null, trendingScore: 0, peakCapacity: 0 };
        
        // SI NO HAY JUEGO PERO SÍ DEFAULT, USAMOS DEFAULT
        if (!game) return { displayData: defaultGame, trendingScore: 0, peakCapacity: 0 };

        const isDetailed = 'rating' in game;
        const pseudoRandom = (seed: number) => {
            const x = Math.sin(game.id + seed) * 10000;
            return x - Math.floor(x);
        };
        
        const computedDisplayData: FeaturedGame = isDetailed ? (game as FeaturedGame) : {
            ...defaultGame, ...game, score: game.score || 85, rating: defaultGame.rating,
            players: { activity24h: game.currentPlayers || Math.floor(pseudoRandom(1) * 500000), peakAllTime: Math.floor(pseudoRandom(2) * 1000000) },
            activityByWeekday: defaultGame.activityByWeekday?.map((d, i) => ({ ...d, avgPlayers: Math.floor(d.avgPlayers * (pseudoRandom(i + 10) * 0.4 + 0.6)) })),
            activity24hTimeline: defaultGame.activity24hTimeline?.map((h, i) => ({ hour: String(h.hour).padStart(2, '0') + 'h', players: Math.floor(h.players * (pseudoRandom(i + 50) * 0.4 + 0.6)) }))
        };
        const computedTrendingScore = Math.min(99, Math.floor((computedDisplayData.score || 80) + 5));
        const computedPeakCapacity = Math.min(95, Math.floor(((computedDisplayData.players.activity24h || 0) / (computedDisplayData.players.peakAllTime || 1)) * 100)) || 65;

        return { displayData: computedDisplayData, trendingScore: computedTrendingScore, peakCapacity: computedPeakCapacity };
    }, [game, defaultGame]);

    if (!displayData) {
        return <div className="h-full w-full rounded-2xl bg-white/5 animate-pulse" />;
    }
    
    return (
        <div className="sticky top-24 flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500 pb-0 gap-4">

            {/* 1. TARJETA SUPERIOR (PREVIEW) */}
            <div
                className="bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group transition-colors duration-300 flex-1 flex flex-col"
                onMouseEnter={(e) => applyHoverStyle(e, PREVIEW_HOVER_COLOR, true)}
                onMouseLeave={(e) => applyHoverStyle(e, PREVIEW_HOVER_COLOR, false)}
            >
                <div className="relative flex-1 w-full overflow-hidden min-h-[250px]">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${displayData.coverUrl})` }}>
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-5 pb-2">
                        <div className="flex items-center justify-between mb-3">
                            <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/10 uppercase tracking-wider shadow-lg font-sans group-hover:bg-white/20 transition-colors">
                                {t.preview}
                            </span>
                            <Activity size={16} className="text-white/80" />
                        </div>
                        <h2 className="text-3xl font-black text-white line-clamp-1 font-display tracking-tight drop-shadow-xl">{displayData.name}</h2>
                    </div>
                </div>

                {/* CONTENIDO INFERIOR DE LA TARJETA (Métricas) */}
                <div className="p-4 pt-3 space-y-3 shrink-0">
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-black/40 rounded-xl p-2.5 border border-white/5 transition-all duration-300 hover:border-[#EFB537]/50 hover:bg-[#EFB537]/10">
                            <div className="flex items-center gap-1 text-gray-400 text-[10px] font-medium mb-0.5 uppercase tracking-wide">
                                <Star size={10} className="text-[#EFB537] fill-[#EFB537]" /> {t.score}
                            </div>
                            <p className="text-lg font-bold text-white tabular-nums">{displayData.score}</p>
                        </div>
                        
                        <div className="bg-black/40 rounded-xl p-2.5 border border-white/5 transition-all duration-300 hover:border-[#00FF62]/50 hover:bg-[#00FF62]/10">
                            <div className="flex items-center gap-1 text-gray-400 text-[10px] font-medium mb-0.5 uppercase tracking-wide">
                                <Users size={10} className="text-[#00FF62]" /> {t.online}
                            </div>
                            <p className="text-lg font-bold text-white tabular-nums">{(game.currentPlayers || displayData.players.activity24h).toLocaleString()}</p>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <CircularMetric 
                            value={trendingScore} 
                            label={t.trending} 
                            gradientId="gradTrending" 
                            colors={['#4530BE', '#2DD4E0']} 
                            icon={TrendingUp} 
                        />
                        <CircularMetric 
                            value={peakCapacity} 
                            label={t.peakCap} 
                            gradientId="gradPeak" 
                            colors={['#b340bf', '#f6339a']} 
                            icon={Trophy} 
                        />
                    </div>
                </div>
            </div>

            {/* 2. GRÁFICO INFERIOR */}
            <div className="w-full h-64 shrink-0 rounded-2xl transition-colors duration-300 border border-transparent">
                <ActivityTimelineChart data={displayData.activity24hTimeline} />
            </div>

        </div>
    );
};