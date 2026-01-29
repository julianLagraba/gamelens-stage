// components/GameKPIs.tsx
'use client';

import { FeaturedGame } from '@/types';
import { TrendingUp, MessageCircle } from 'lucide-react';

interface GameKPIsProps {
  game: FeaturedGame;
}

export const GameKPIs: React.FC<GameKPIsProps> = ({ game }) => {
  // Lógica de cálculo de reseñas encapsulada aquí
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ratingData = game.rating as any;
  const distribution = ratingData.starsDistribution || game.rating;
  
  const totalReviews = Object.values(distribution).reduce((acc: number, curr: unknown) => {
     return typeof curr === 'number' ? acc + curr : acc;
  }, 0);

  return (
    <div className="grid grid-cols-2 gap-4">
        {/* KPI 1: Metascore */}
        <div className="bg-neutral-900/50 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:border-yellow-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <TrendingUp size={48} className="text-yellow-500" />
            </div>
            <p className="text-sm text-gray-400 font-medium mb-1">Metascore</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white tracking-tight">{game.score}</p>
              <span className="text-sm text-yellow-500 font-bold">/100</span>
            </div>
        </div>

        {/* KPI 2: Reseñas */}
        <div className="bg-neutral-900/50 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <MessageCircle size={48} className="text-blue-500" />
            </div>
            <p className="text-sm text-gray-400 font-medium mb-1">Reseñas</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-white tracking-tight">{totalReviews.toLocaleString()}</p>
            </div>
        </div>
    </div>
  );
};