/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { VerticalMenu } from '@/components/VerticalMenu';
import { Search, Loader2, Star, Ghost } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchGame {
  id: number;
  slug: string;
  name: string;
  coverUrl: string;
  score?: number;
  // Como el endpoint de search es simple, simulamos géneros si faltan
  genres?: string[]; 
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q'); // Leemos lo que escribiste en el Header

  const [results, setResults] = useState<SearchGame[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query) return;

    setLoading(true);
    // Llamamos al endpoint de búsqueda que ya tenés en main.py
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        // Aseguramos que data sea un array
        setResults(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error("Error buscando:", err))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="min-h-screen flex flex-col bg-[#131119]" style={{ colorScheme: 'dark' }}>
      <style jsx global>{`
        .game-card-hover { transition: all 0.3s ease !important; }
        .game-card-hover:hover { transform: translateY(-5px); }
      `}</style>

      <Header />

      <main className="flex-1 px-6 md:px-10 max-w-[1920px] mx-auto w-full relative flex flex-col">
        <div className="flex flex-col md:flex-row gap-8 flex-1 items-stretch">
          
          <aside className="hidden md:block w-[260px] shrink-0 relative">
             <div className="sticky top-[74px] pt-10 pb-10 h-[calc(100vh-74px)] overflow-y-auto">
                <VerticalMenu activeItem="" /> 
             </div>
          </aside>

          <div className="flex-1 w-full min-w-0 space-y-8 flex flex-col pt-6 md:pt-10 pb-10">
            
            {/* Header de Resultados */}
            <div className="border-b border-white/5 pb-6">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Search size={32} className="text-blue-400" /> 
                  Resultados para: <span className="text-blue-400 italic">"{query}"</span>
                </h2>
                <p className="text-gray-400 mt-2">
                    {loading ? 'Buscando en la base de datos...' : `Se encontraron ${results.length} coincidencias.`}
                </p>
            </div>

            {/* Estado de Carga */}
            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500" size={48} />
                </div>
            )}

            {/* Estado Sin Resultados */}
            {!loading && results.length === 0 && query && (
                <div className="flex flex-col items-center justify-center py-20 opacity-50">
                    <Ghost size={64} className="text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-white">No se encontraron juegos</h3>
                    <p className="text-gray-400">Intenta con otro nombre.</p>
                </div>
            )}

            {/* Grilla de Resultados */}
            {!loading && results.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {results.map((game) => (
                        <Link 
                            href={`/game/${game.slug}`} 
                            key={game.id}
                            className="game-card-hover group relative bg-[#1A1A20] rounded-2xl p-3 border border-white/5 hover:border-blue-500/30 block transition-all"
                        >
                            {/* Diseño idéntico a tus cards originales */}
                            <div className="relative w-full aspect-[5/6] rounded-xl overflow-hidden mb-3 bg-gray-800">
                                <Image
                                    src={game.coverUrl}
                                    alt={game.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    unoptimized
                                />
                                {game.score ? (
                                    <div className="absolute top-2 right-2 z-20 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-lg">
                                        <Star size={12} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-xs font-bold text-white">{game.score}</span>
                                    </div>
                                ) : null}
                            </div>
                            
                            <h3 className="font-bold text-white text-sm leading-tight line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                                {game.name}
                            </h3>
                            
                            <div className="pt-2 border-t border-white/5">
                                <span className="text-xs font-medium text-gray-500 group-hover:text-white transition-colors">
                                    Ver Detalles
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}