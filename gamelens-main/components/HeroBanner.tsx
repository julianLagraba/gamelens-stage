'use client';

import { useState, useEffect } from 'react';
import { FeaturedGame } from '@/types';
import { Activity, ArrowRight, Users, Star, Trophy, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
// Importamos el hook de idioma
import { useLanguage } from '../app/context/LanguageContext';

interface HeroBannerProps {
  game: FeaturedGame;
}

interface Slide {
  id: string;
  theme: 'brand' | 'game';
  title: string;
  badge: string;
  description: string;
  image: string;
  bgClass: string;
  cta: {
    text: string;
    link: string;
    icon: LucideIcon;
  };
  secondary: {
    text: string;
    icon: LucideIcon;
  } | null;
}

export const HeroBanner: React.FC<HeroBannerProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // 1. OBTENEMOS EL IDIOMA ACTUAL
  const { language } = useLanguage();

  // 2. DICCIONARIO DE TRADUCCIONES PARA LOS SLIDES
  const translations = {
    en: {
      intro: {
        title: 'Track Your Data',
        badge: 'New Tool',
        desc: 'Level up your gaming experience. Monitor your hours, analyze statistics, and discover trends.',
        cta: 'Start Tracking'
      },
      community: {
        title: 'Join the Squad',
        badge: 'Community',
        desc: 'Connect with thousands of players. Share achievements, find your squad, and compete in unique events.',
        cta: 'Go to Discord'
      },
      pro: {
        title: 'GameLens Pro',
        badge: 'Subscription',
        desc: 'Unlock full potential. Access betas, predictive analytics, and total profile customization.',
        cta: 'Upgrade Plan'
      },
      tournaments: {
        title: 'Official Tournaments',
        badge: 'Competitive',
        desc: 'Show your skill. Join weekly leagues, climb ranks, and earn unique rewards for your victories.',
        cta: 'View Calendar'
      }
    },
    es: {
      intro: {
        title: 'Rastrea tus Datos',
        badge: 'Nueva Herramienta',
        desc: 'Lleva tu experiencia de juego al siguiente nivel. Monitoriza tus horas, analiza estadísticas y descubre tendencias.',
        cta: 'Empezar'
      },
      community: {
        title: 'Únete a la Squad',
        badge: 'Comunidad',
        desc: 'Conecta con miles de jugadores. Comparte tus logros, encuentra tu squad y compite en eventos únicos.',
        cta: 'Ir al Discord'
      },
      pro: {
        title: 'GameLens Pro',
        badge: 'Suscripción',
        desc: 'Desbloquea el potencial completo. Acceso a betas, análisis predictivos y personalización total de tu perfil.',
        cta: 'Mejorar Plan'
      },
      tournaments: {
        title: 'Torneos Oficiales',
        badge: 'Competitivo',
        desc: 'Demuestra tu nivel. Participa en ligas semanales, escala rangos y gana recompensas únicas por tus victorias.',
        cta: 'Ver Calendario'
      }
    }
  };

  // 3. SELECCIONAMOS EL TEXTO SEGÚN EL IDIOMA
  const t = translations[language.toLowerCase() as 'en' | 'es'];

  // 4. CONSTRUIMOS EL ARRAY DE SLIDES CON LOS TEXTOS DINÁMICOS
  // Mantenemos los colores, iconos e IDs fijos, solo inyectamos el texto 't'
  const slides: Slide[] = [
    {
      id: 'intro',
      theme: 'brand',
      title: t.intro.title,
      badge: t.intro.badge,
      description: t.intro.desc,
      image: '/Logo_Game.svg',
      bgClass: 'bg-gradient-to-br from-[#4530BE] via-[#131119] to-[#b340bf]',
      cta: { text: t.intro.cta, link: '/login', icon: Activity },
      secondary: null
    },
    {
      id: 'community',
      theme: 'brand',
      title: t.community.title,
      badge: t.community.badge,
      description: t.community.desc,
      image: '/Logo_Game.svg',
      bgClass: 'bg-gradient-to-br from-[#2DD4E0]/80 via-[#131119] to-[#00FF62]/80',
      cta: { text: t.community.cta, link: '/community', icon: Users },
      secondary: null
    },
    {
      id: 'pro',
      theme: 'brand',
      title: t.pro.title,
      badge: t.pro.badge,
      description: t.pro.desc,
      image: '/Logo_Game.svg',
      bgClass: 'bg-gradient-to-br from-[#f6339a]/80 via-[#131119] to-[#b340bf]/80',
      cta: { text: t.pro.cta, link: '/pro', icon: Star },
      secondary: null
    },
    {
      id: 'tournaments',
      theme: 'brand',
      title: t.tournaments.title,
      badge: t.tournaments.badge,
      description: t.tournaments.desc,
      image: '/Logo_Game.svg',
      bgClass: 'bg-gradient-to-br from-[#4530BE]/80 via-[#131119] to-[#50a2ff]/80',
      cta: { text: t.tournaments.cta, link: '/tournaments', icon: Trophy },
      secondary: null
    }
  ];

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 6000); 
    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  return (
    <div 
      className="relative w-full h-[400px] rounded-3xl overflow-hidden group shadow-2xl bg-[#0f0e13] border border-white/5 hover:border-white/20 transition-colors duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {slides.map((slide, index) => {
        const isActive = index === currentSlide;
        
        return (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* --- FONDO --- */}
            {slide.theme === 'game' ? (
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-[2000ms] ease-out"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                  transform: isActive 
                    ? (isHovered ? 'scale(1.15)' : 'scale(1.05)') 
                    : 'scale(1.0)' 
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-[#131119] via-[#131119]/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#131119] via-[#131119]/70 to-transparent" />
              </div>
            ) : (
              <div 
                className={`absolute inset-0 ${slide.bgClass} transition-transform duration-[2000ms] ease-out`}
                style={{
                   transform: isActive && isHovered ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <div className="absolute inset-0 opacity-10" 
                     style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                </div>
                <div className={`absolute right-0 bottom-0 opacity-5 translate-y-1/4 translate-x-1/4 transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}>
                   <Image src="/Logo_Game.svg" width={600} height={600} alt="Background" />
                </div>
              </div>
            )}

            {/* --- CONTENIDO --- */}
            <div className="absolute inset-0 flex flex-col justify-center items-start p-8 md:p-12 w-full md:w-2/3 lg:w-1/2 z-20">
              
              {/* Badge */}
              <div className={`transition-all duration-700 delay-100 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/10 uppercase tracking-wider mb-6 inline-block shadow-lg font-sans group-hover:bg-white/20 transition-colors">
                  {slide.badge}
                </span>
              </div>

              {/* Título */}
              <div className={`transition-all duration-700 delay-200 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6 leading-tight drop-shadow-xl min-h-[3.5rem] flex items-end font-display text-left whitespace-nowrap">
                  {slide.title}
                </h2>
              </div>

              {/* Descripción */}
              <div className={`transition-all duration-700 delay-300 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <p className="text-gray-300 text-sm md:text-base mb-10 font-sans group-hover:text-gray-200 transition-colors text-left max-w-xl">
                  {slide.description}
                </p>
              </div>

              {/* Botones CTA */}
              <div className={`flex items-center gap-4 transition-all duration-700 delay-500 transform ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
                <Link 
                  href={slide.cta.link} 
                  className="group/btn flex items-center gap-2 px-8 py-3 bg-white text-black rounded-xl font-bold hover:bg-blue-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] hover:scale-105 active:scale-95 font-sans"
                >
                  <slide.cta.icon size={20} fill={slide.theme === 'game' ? "currentColor" : "none"} />
                  <span>{slide.cta.text}</span>
                  {slide.theme === 'brand' && <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />}
                </Link>

                {slide.secondary && (
                  <button className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white rounded-xl font-bold hover:bg-white/10 transition backdrop-blur-md border border-white/10 font-sans group-hover:border-white/20">
                    <slide.secondary.icon size={20} />
                    <span>{slide.secondary.text}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Indicadores (Dots) */}
      <div className="absolute bottom-6 right-8 flex gap-2 z-30">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentSlide === idx ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
            } ${isHovered ? 'scale-110' : ''}`}
            aria-label={`Ir al slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};