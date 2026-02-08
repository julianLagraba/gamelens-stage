'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Library, Filter, SortAsc, 
  Gamepad2, Trash2,
  PlayCircle, Trophy, XCircle, Clock, ChevronDown
} from 'lucide-react';

import { Header } from '@/components/Header';
import { VerticalMenu } from '@/components/VerticalMenu';
import { useLanguage } from '@/app/context/LanguageContext';
import { useCollection } from '@/app/context/CollectionContext';

export const dynamic = 'force-dynamic';

const COLORS = {
  ROSA: '#FD1372',
  VIOLETA: '#A400FF',
  VIOLETA_CLARO: '#C471F2',
  AZUL: '#3B75F8',
  CYAN: '#2DD4E0',
  VERDE: '#00FF62',
  DORADO: '#EFB537',
};

type SortOption = 'name' | 'id_desc';

const STATUS_OPTIONS = [
  { key: 'playing', label: 'Playing', icon: PlayCircle, color: COLORS.AZUL },
  { key: 'completed', label: 'Completed', icon: Trophy, color: COLORS.DORADO },
  { key: 'dropped', label: 'Dropped', icon: XCircle, color: COLORS.ROSA },
  { key: 'owned', label: 'Backlog', icon: Clock, color: COLORS.VERDE },
];

export default function MyCollectionPage() {
  const { collection, removeFromCollection, addToCollection } = useCollection();
  
  // Estado para el filtro activo
  const [activeFilter, setActiveFilter] = useState('All');
  const [sortBy, setSortBy] = useState<SortOption>('id_desc');
  // const [showSortMenu, setShowSortMenu] = useState(false); // (Opcional si quieres ordenar luego)

  const { language } = useLanguage();

  const translations = {
    en: {
        title: 'My Collection',
        subtitle: 'Manage your entire game library.',
        results: 'Games',
        viewDetails: 'View Details',
        removeTooltip: 'Remove from collection',
        sortTooltip: 'Sort by...',
        empty: { title: 'Your collection is empty', generalDesc: 'Start building your library by clicking the (+) on any game.', button: 'Discover Games' }
    },
    es: {
        title: 'Mi Colección',
        subtitle: 'Gestiona toda tu biblioteca de juegos.',
        results: 'Juegos',
        viewDetails: 'Ver Detalles',
        removeTooltip: 'Eliminar de la colección',
        sortTooltip: 'Ordenar por...',
        empty: { title: 'Tu colección está vacía', generalDesc: 'Empieza a armar tu biblioteca haciendo clic en el (+) de cualquier juego.', button: 'Descubrir Juegos' }
    }
  };

  const t = translations[language.toLowerCase() as 'en' | 'es'];

  const getStatusConfig = (statusKey: string) => {
    return STATUS_OPTIONS.find(s => s.key === statusKey) || STATUS_OPTIONS[3]; 
  };

  // --- LÓGICA DE FILTRADO Y ORDENAMIENTO ---
  const filteredCollection = collection
    .filter(item => {
        if (activeFilter === 'All') return true;
        return item.status === activeFilter;
    })
    .sort((a, b) => {
        if (sortBy === 'id_desc') return b.id - a.id; 
        if (sortBy === 'name') return a.game_name.localeCompare(b.game_name);
        return 0;
    });

  const handleStatusChange = (e: React.MouseEvent, item: any, newStatus: string) => {
    e.preventDefault();
    e.stopPropagation(); 
    addToCollection({
        id: item.game_id,
        name: item.game_name,
        slug: item.game_slug,
        coverUrl: item.cover_url
    }, newStatus);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#131119]" style={{ colorScheme: 'dark' }}>
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .game-card-hover { transition: all 0.3s ease !important; }
        .game-card-hover:hover { transform: translateY(-5px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.5); z-index: 10; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
        .group:hover .group-hover\\:opacity-100 { opacity: 1; visibility: visible; }
      `}</style>

      <Header />

      <main className="flex-1 px-6 md:px-10 max-w-[1920px] mx-auto w-full relative flex flex-col">
        <div className="flex flex-col md:flex-row gap-8 flex-1 items-stretch">
          
          <aside className="hidden md:block w-[260px] shrink-0 relative">
             <div className="sticky top-[74px] pt-6 pb-10 h-[calc(100vh-80px)] overflow-y-auto no-scrollbar">
                <VerticalMenu activeItem="my-collection" />
             </div>
          </aside>

          <div className="flex-1 w-full min-w-0 space-y-8 flex flex-col pt-6 md:pt-10 pb-10 animate-fade-up">
            
            {/* HEADER DE LA SECCIÓN */}
            <div className="sticky top-[73px] z-40 bg-[#131119] pt-2 pb-6 -mt-2 border-b border-white/5 md:border-none">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2 font-display tracking-tight">
                    <Library size={24} style={{ color: COLORS.VERDE }} /> {t.title}
                    <span className="text-xs font-normal text-gray-500 bg-white/5 px-2 py-1 rounded ml-2 font-sans">
                      {filteredCollection.length} {t.results}
                    </span>
                  </h2>
                  <p className="text-gray-400 text-sm">{t.subtitle}</p>
                </div>

                {/* --- FILTROS FUNCIONALES --- */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 xl:pb-0">
                  {/* Botón ALL */}
                  <button 
                    onClick={() => setActiveFilter('All')}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                        activeFilter === 'All' 
                        ? 'bg-[#00FF62] text-black border-[#00FF62]' 
                        : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    All Games
                  </button>

                  {/* Botones de Estado */}
                  {STATUS_OPTIONS.map((status) => (
                      <button
                        key={status.key}
                        onClick={() => setActiveFilter(status.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
                            activeFilter === status.key
                            ? 'bg-white/10 text-white' // Activo
                            : 'bg-white/5 text-gray-400 border-white/5 hover:border-white/20 hover:text-white' // Inactivo
                        }`}
                        style={activeFilter === status.key ? { borderColor: status.color, color: status.color } : {}}
                      >
                        <status.icon size={14} />
                        {status.label}
                      </button>
                  ))}
                </div>
              </div>
            </div>

            {filteredCollection.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {filteredCollection.map((item) => {
                        const currentConfig = getStatusConfig(item.status);
                        
                        return (
                        <div key={item.id} className="relative group/card">
                            <Link 
                                href={`/game/${item.game_slug}`} 
                                className="game-card-hover block relative bg-[#1A1A20] rounded-2xl p-3 border border-white/5 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl no-underline"
                            >
                                <div className="relative w-full aspect-[5/6] rounded-xl overflow-hidden mb-3 bg-gray-800">
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
                                    <div className="w-full h-full bg-gray-800 group-hover/card:scale-105 transition-transform duration-500 relative">
                                        <Image
                                            src={item.cover_url || "/placeholder.jpg"}
                                            alt={item.game_name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 50vw, 20vw"
                                            unoptimized
                                        />
                                    </div>
                                    
                                    {/* --- BADGE ESTADO --- */}
                                    <div className="absolute top-2 right-2 z-30 group/status"> 
                                        <button 
                                            onClick={(e) => e.preventDefault()}
                                            className="flex items-center gap-1.5 backdrop-blur-md px-2.5 py-1 rounded-lg shadow-lg hover:scale-105 transition-transform border"
                                            style={{ 
                                                borderColor: currentConfig.color, 
                                                color: currentConfig.color,       
                                                backgroundColor: 'rgba(0,0,0,0.4)' 
                                            }}
                                        >
                                            <currentConfig.icon size={12} strokeWidth={3} />
                                            <span className="text-[10px] font-black uppercase tracking-wide">
                                                {currentConfig.label}
                                            </span>
                                            <ChevronDown size={10} style={{ opacity: 0.7 }} />
                                        </button>

                                        {/* --- DROPDOWN --- */}
                                        <div className="absolute right-0 top-full mt-1 w-32 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden opacity-0 invisible group-hover/status:opacity-100 group-hover/status:visible transition-all duration-200 transform origin-top-right z-40">
                                            <div className="p-1">
                                                {STATUS_OPTIONS.map((option) => {
                                                    const isSelected = item.status === option.key;
                                                    const buttonStyle = { '--status-color': option.color } as React.CSSProperties;
                                                    
                                                    return (
                                                    <button
                                                        key={option.key}
                                                        onClick={(e) => handleStatusChange(e, item, option.key)}
                                                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                                                            isSelected 
                                                            ? 'bg-white/5 border-[color:var(--status-color)] text-[color:var(--status-color)]' 
                                                            : 'border-transparent text-gray-400 hover:text-[color:var(--status-color)] hover:border-[color:var(--status-color)] hover:bg-white/5'
                                                        }`}
                                                        style={buttonStyle}
                                                    >
                                                        <option.icon size={14} />
                                                        <span>{option.label}</span>
                                                    </button>
                                                )})}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-3 left-3 right-3 z-20">
                                        <h3 className="font-bold text-white text-base leading-tight drop-shadow-md text-left line-clamp-2">{item.game_name}</h3>
                                    </div>
                                </div>

                                <div className="px-1">
                                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                                        <span className="text-xs font-medium text-pink-400 group-hover/card:text-pink-300 flex items-center gap-1 transition-colors">
                                          {t.viewDetails}
                                        </span>
                                        
                                        <button 
                                            onClick={(e) => {
                                                e.preventDefault(); 
                                                e.stopPropagation();
                                                removeFromCollection(item.game_id); 
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
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-[#1A1A20]/30">
                    <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mb-6">
                        <Library size={40} className="text-gray-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{t.empty.title}</h3>
                    <p className="text-gray-400 max-w-md mb-8">{t.empty.generalDesc}</p>
                    <Link href="/all-games" className="flex items-center gap-2 px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-lg hover:shadow-white/10 no-underline">
                        <Gamepad2 size={20} /> {t.empty.button}
                    </Link>
                </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}