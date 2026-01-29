// types/index.ts

// --- TIPOS BASE ---
export interface UserProfile {
  id: number;
  name: string;
  avatarUrl: string;
  favoritePlatform: string;
}

export interface GameBasic {
  id: number;
  slug: string;
  name: string;
  coverUrl: string;
  score: number;
  isFavorite: boolean; 
  currentPlayers?: number;
  genres?: string[]; // Agregado para el filtro
}

// Alias para compatibilidad
export type Game = GameBasic;

export interface ReviewStats {
  total: number;
  positivePercent: number;
  mixedPercent: number;
  negativePercent: number;
  starsDistribution?: Record<string, number>;
}

// --- TIPOS HOME ---
export interface FeaturedGame extends GameBasic {
  // Eliminado duplicado, dejamos solo esta definición
  reviewCount?: number;
  
  rating: {
    starsAverage: number;
    numeric: number;
    totalReviews: number;
    starsDistribution: Record<string, number>;
    [key: string]: unknown; 
  };
  players: {
    activity24h: number;
    peakAllTime: number;
  };
  // Ajustado para coincidir con el mock (weekday)
  activityByWeekday: { weekday: string; avgPlayers: number }[];
  activity24hTimeline: { hour: string; players: number }[];
}

export interface HomeData {
  user: UserProfile;
  games: GameBasic[];
  featuredGame: FeaturedGame;
}

// --- TIPOS DETALLE ---
export interface GameDetail extends GameBasic {
  storeUrl: string;
  images: {
    cover: string;
    hero: string;
    screenshots: string[];
  };
  meta: {
    genres: string[];
    platforms: string[];
    developer: string;
    publisher: string;
    releaseDate: string;
  };
  
  playerGrowth14d: { day: string; players: number }[];
  kpiSeries: {
    topCountries: { country: string; code: string; weight: number }[];
    peakPlayers: number;
    score: number;
    currentPlayers: number;
    players24hChangePercent: number;
  };
  rankingMovement: {
    currentRank: number;
    change: number;
    history: { day: string; rank: number }[];
  };
  platformDistribution: { platform: string; percent: number }[];
  retention: { d1: number; d2: number; d3: number };
  
  userReviews: ReviewStats;
  criticReviews: Omit<ReviewStats, 'starsDistribution'>;
  communitySentiment: {
    positivePercent: number;
    mixedPercent: number;
    negativePercent: number;
  };
  
  peakHours: { hour: string; players: number }[];
}

export interface FavoritesData {
    userId: number;
    favorites: GameBasic[];
}