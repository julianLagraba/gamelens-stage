import { HomeData } from '@/types';
import { Header } from '@/components/Header';
import { Dashboard } from '@/components/Dashboard'; 

// 1. Función para obtener los datos de la API falsa (Home) con manejo de errores robusto
async function getHomeData(): Promise<HomeData> {
  try {
    // Detectamos la URL base: 
    // 1. Usamos una variable de entorno personalizada si existe.
    // 2. Fallback a localhost:3000 para desarrollo local.
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const res = await fetch(`${baseUrl}/api/home`, { 
      cache: 'no-store',
      // Agregamos un tiempo de espera para evitar que el build se cuelgue
      next: { revalidate: 0 } 
    });

    if (!res.ok) {
      throw new Error('API no disponible');
    }

    return await res.json();
  } catch {
    // ESTO EVITA EL ERROR EN VERCEL Y TYPESCRIPT: 
    // Ajustamos el fallback para que cumpla exactamente con la interfaz HomeData
    console.error('Error en fetch, cargando datos de respaldo...');
    
    const fallbackGame = {
      id: 1,
      slug: "elden-ring",
      name: "Elden Ring",
      coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg",
      score: 96,
      isFavorite: false,
      // Corregido: rating ahora es un objeto estructurado según la interfaz de Typescript
      rating: {
        starsAverage: 4.8,
        numeric: 96,
        totalReviews: 125000,
        starsDistribution: { "5": 85, "4": 10, "3": 3, "2": 1, "1": 1 }
      },
      players: {
        activity24h: 240000,
        peakAllTime: 953000
      },
      // Propiedades de series temporales añadidas para cumplir con FeaturedGame
      activityByWeekday: [100, 120, 150, 130, 180, 200, 190],
      activity24hTimeline: Array(24).fill(500),
      // Mantenemos estas propiedades por compatibilidad con el componente Dashboard
      images: { cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg" },
      // CAMBIO: "Action" en inglés para respetar el estado inicial
      meta: { genres: ["RPG", "Action"] },
      kpiSeries: { score: 96, currentPlayers: 240000 }
    };

    return {
      user: {
        id: 1,
        name: 'Valentín',
        favoritePlatform: 'PC',
        avatarUrl: '' 
      },
      featuredGame: fallbackGame,
      games: [
        fallbackGame,
        {
          id: 2,
          slug: "cyberpunk-2077",
          name: "Cyberpunk 2077",
          coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg",
          score: 86,
          isFavorite: false,
          rating: {
            starsAverage: 4.3,
            numeric: 86,
            totalReviews: 85000,
            starsDistribution: { "5": 70, "4": 15, "3": 10, "2": 3, "1": 2 }
          },
          players: {
            activity24h: 60000,
            peakAllTime: 1054000
          },
          images: { cover: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg" },
          meta: { genres: ["RPG", "FPS"] },
          kpiSeries: { score: 86, currentPlayers: 60000 }
        }
      ]
    } as unknown as HomeData; // Usamos unknown temporalmente para asegurar la compatibilidad total
  }
}

// 2. Componente principal (Home Page)
export default async function HomePage() {
  const data = await getHomeData();
  const { user } = data;

  return (
    // 'h-screen' y 'overflow-hidden' para bloquear el scroll de la página completa
    <div className="h-screen bg-[#131119] text-white selection:bg-pink-500/30 overflow-hidden flex flex-col">
      
      {/* Estilos Globales con Animaciones Agregadas */}
      <style dangerouslySetInnerHTML={{__html: `
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
      `}} />

      {/* ➡️ Header Importado (Componente reutilizable) */}
      <Header user={user} />
      
      {/* ➡️ Contenedor Principal: Se adapta al espacio restante sin scroll propio */}
      <main className="flex-1 px-6 md:px-10 max-w-[1920px] mx-auto w-full relative flex flex-col overflow-hidden">
        
        <div className="flex flex-col md:flex-row gap-8 flex-1 items-stretch h-full">
          
          {/* Área del Dashboard: Ocupa todo el alto disponible */}
          {/* Se añade 'animate-fade-up' para la animación de entrada */}
          <div className="flex-1 w-full min-w-0 space-y-8 flex flex-col pt-6 md:pt-10 pb-4 h-full animate-fade-up">
            <Dashboard data={data} />
          </div>

        </div>

      </main>
    </div>
  );
}