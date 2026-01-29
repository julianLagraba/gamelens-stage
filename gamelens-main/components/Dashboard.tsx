'use client';

import { useState } from 'react';
import { HomeData, GameBasic } from '@/types';
import { HeroBanner } from '@/components/HeroBanner';
import { GameList } from '@/components/GameList';
import { MetricsSidebar } from '@/components/MetricsSidebar';
import { VerticalMenu } from '@/components/VerticalMenu';
// Conexión al contexto de idioma
import { useLanguage } from '../app/context/LanguageContext';

interface DashboardProps {
  data: HomeData;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const [hoveredGame, setHoveredGame] = useState<GameBasic | null>(null);

  // 1. OBTENER IDIOMA ACTUAL
  const { language } = useLanguage();

  // 2. DICCIONARIO DE TRADUCCIONES LOCAL
  const translations = {
    en: {
      trending: 'Trending Games',
      results: 'Results'
    },
    es: {
      trending: 'Tendencias',
      results: 'Resultados'
    }
  };

  // 3. SELECCIÓN DE TEXTOS
  const t = translations[language.toLowerCase() as 'en' | 'es'];

  // El juego que se muestra en la derecha: El que tiene hover O el destacado por defecto
  const activeGame = hoveredGame || data.featuredGame;

  return (
    // 1. GRID PRINCIPAL: Ocupa el 100% del alto disponible
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_420px] gap-8 h-[calc(100vh-9.625rem)]">
      
      {/* 2. MENÚ IZQUIERDO */}
      {/* Este componente ya tiene su propia conexión al contexto, así que cambiará solo */}
      <aside className="hidden lg:block h-full overflow-hidden">
        <VerticalMenu />
      </aside>

      {/* 3. CENTRO */}
      <section className="space-y-8 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        
        {/* HeroBanner recibirá los datos. Si tiene texto estático (botones), habrá que editarlo luego */}
        <HeroBanner game={data.featuredGame} />
        
        <div className="pb-10">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 font-display tracking-tight">
            {/* TRADUCCIÓN DINÁMICA */}
            {t.trending}
            <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded ml-2 font-sans">
              {data.games.length} {t.results}
            </span>
          </h3>
          <GameList 
            games={data.games} 
            onGameHover={setHoveredGame} 
          />
        </div>
      </section>

      {/* 4. DERECHA (Sidebar) */}
      <aside className="hidden xl:block h-full overflow-hidden">
        <MetricsSidebar 
          game={activeGame} 
          defaultGame={data.featuredGame} 
        />
      </aside>

    </div>
  );
};