'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  X, 
  LayoutDashboard, 
  Gamepad2, 
  TrendingUp, 
  Trophy, 
  Heart, 
  User, 
  Settings, 
  LogOut,
  Library
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '../app/context/LanguageContext';

const signOut = async () => console.log('Cerrando sesión...');

interface VerticalMenuProps {
  activeItem?: string; 
  isOpen?: boolean;     
  onClose?: () => void; 
}

export const VerticalMenu = ({ isOpen, onClose }: VerticalMenuProps) => {
  const router = useRouter(); 
  const pathname = usePathname(); 
  const { language } = useLanguage();

  const translations = {
    en: {
      mainMenu: 'Main Menu',
      home: 'Home',
      allGames: 'All Games',
      topSelling: 'Top-Selling',
      mostPlayed: 'Most Played',
      collection: 'Your Collection',
      myCollection: 'My Collection',
      favorites: 'Favorites',
      profile: 'Profile',
      settings: 'Settings',
      logout: 'Log Out',
      proTitle: 'GameLens Pro',
      proDesc: 'Access advanced metrics and export reports.',
      upgrade: 'Upgrade Plan'
    },
    es: {
      mainMenu: 'Menú Principal',
      home: 'Inicio',
      allGames: 'Todos los Juegos',
      topSelling: 'Más Vendidos',
      mostPlayed: 'Más Jugados',
      collection: 'Tu Colección',
      myCollection: 'Mi Colección',
      favorites: 'Favoritos',
      profile: 'Perfil',
      settings: 'Ajustes',
      logout: 'Cerrar Sesión',
      proTitle: 'GameLens Pro',
      proDesc: 'Accede a métricas avanzadas y exporta reportes.',
      upgrade: 'Mejorar Plan'
    }
  };

  const t = translations[language.toLowerCase() as 'en' | 'es'];
  
  const handleLogout = async () => {
    try {
      await signOut();
      localStorage.removeItem('user_session');
      localStorage.removeItem('ach_count');

      if (onClose) onClose();
      window.location.href = '/login'; 

    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

  const getLinkClass = (path: string, itemKey: string) => {
    const isActive = pathname === path;
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group";
    
    const colors: Record<string, string> = {
      'home': 'text-[#50a2ff] bg-[#50a2ff]/10 border-[#50a2ff]/20',
      'all-games': 'text-[#C471F2] bg-[#C471F2]/10 border-[#C471F2]/20',
      'top-selling': 'text-[#00FF62] bg-[#00FF62]/10 border-[#00FF62]/20',
      'most-played': 'text-[#efb537] bg-[#efb537]/10 border-[#efb537]/20',
      'my-collection': 'text-[#10B981] bg-[#10B981]/10 border-[#10B981]/20',
      'favorites': 'text-[#f6339a] bg-[#f6339a]/10 border-[#f6339a]/20',
      'profile': 'text-[#2DD4E0] bg-[#2DD4E0]/10 border-[#2DD4E0]/20',
      'settings': 'text-white bg-white/10 border-white/10'
    };

    if (isActive) {
      return `${baseClass} ${colors[itemKey] || ''} border font-semibold`;
    }
    
    const hoverClass: Record<string, string> = {
        'home': 'hover:text-[#50a2ff] hover:bg-[#50a2ff]/10',
        'all-games': 'hover:text-[#C471F2] hover:bg-[#C471F2]/10',
        'top-selling': 'hover:text-[#00FF62] hover:bg-[#00FF62]/10',
        'most-played': 'hover:text-[#efb537] hover:bg-[#efb537]/10',
        'my-collection': 'hover:text-[#10B981] hover:bg-[#10B981]/10',
        'favorites': 'hover:text-[#f6339a] hover:bg-[#f6339a]/10',
        'profile': 'hover:text-[#2DD4E0] hover:bg-[#2DD4E0]/10',
        'settings': 'hover:text-white hover:bg-white/5'
    };

    return `${baseClass} text-gray-400 ${hoverClass[itemKey] || ''}`;
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[9998] lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <div className={`
        flex flex-col gap-6 lg:gap-6
        fixed inset-y-0 left-0 z-[9999] w-72 bg-[#131119] p-4 border-r border-white/10 transition-transform duration-300 ease-in-out shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:h-full lg:translate-x-0 lg:bg-transparent lg:p-0 lg:border-none lg:w-full lg:z-auto lg:transition-none lg:shadow-none
      `}>
        
        <div className="flex items-center justify-end lg:hidden mb-0 px-1 shrink-0">
          <button 
            onClick={() => onClose && onClose()} 
            className="p-1 text-gray-400 hover:text-white active:scale-95 transition-transform cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        {/* 1. CAJA DE CRISTAL (MENÚ) */}
        <div className="bg-neutral-900/50 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-xl flex-1 overflow-y-auto no-scrollbar animate-fade-up flex flex-col min-h-0">
          
          <nav className="space-y-2">
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t.mainMenu}</p>
            
            <Link href="/" className={getLinkClass('/', 'home')} onClick={handleLinkClick}>
              <LayoutDashboard size={20} className="transition-transform group-hover:scale-110" />
              <span className="text-sm">{t.home}</span>
            </Link>
            
            <Link href="/all-games" className={getLinkClass('/all-games', 'all-games')} onClick={handleLinkClick}>
              <Gamepad2 size={20} />
              <span className="text-sm">{t.allGames}</span>
            </Link>
            
            <Link href="/top-selling" className={getLinkClass('/top-selling', 'top-selling')} onClick={handleLinkClick}>
              <TrendingUp size={20} />
              <span className="text-sm">{t.topSelling}</span>
            </Link>
            
            <Link href="/most-played" className={getLinkClass('/most-played', 'most-played')} onClick={handleLinkClick}>
              <Trophy size={20} />
              <span className="text-sm">{t.mostPlayed}</span>
            </Link>

            <div className="my-4 h-px bg-white/5 mx-4"></div>
            <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t.collection}</p>

            <Link href="/my-collection" className={getLinkClass('/my-collection', 'my-collection')} onClick={handleLinkClick}>
              <Library size={20} />
              <span className="text-sm">{t.myCollection}</span>
            </Link>

            <Link href="/favorites" className={getLinkClass('/favorites', 'favorites')} onClick={handleLinkClick}>
              <Heart size={20} />
              <span className="text-sm">{t.favorites}</span>
            </Link>
            
            <Link href="/profile" className={getLinkClass('/profile', 'profile')} onClick={handleLinkClick}>
              <User size={20} />
              <span className="text-sm">{t.profile}</span>
            </Link>
          </nav>

          <div className="mt-auto space-y-2 pt-4 border-t border-white/5">
            <Link href="/settings" className={getLinkClass('/settings', 'settings')} onClick={handleLinkClick}>
              <Settings size={20} />
              <span className="text-sm">{t.settings}</span>
            </Link>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl font-medium transition-all group cursor-pointer"
            >
              <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">{t.logout}</span>
            </button>
          </div>
        </div>

        {/* 2. BANNER PRO (RESTAURADO EXACTAMENTE COMO LA IMAGEN) */}
        <div className="hidden lg:flex p-6 rounded-2xl bg-gradient-to-br from-[#f6339a] to-[#a400ff] text-white relative overflow-hidden shadow-2xl border border-white/10 flex-col shrink-0 animate-fade-up delay-200">
          <div className="relative z-10 flex flex-col justify-center gap-3">
            <div className="space-y-1">
                {/* Tipografía Black y más grande como en la foto */}
                <p className="font-black text-xl leading-tight tracking-tight">GameLens Pro</p>
                <p className="text-xs text-white/90 font-medium leading-snug">{t.proDesc}</p>
            </div>
            <div className="pt-2">
              {/* Botón blanco con texto rosa en Bold */}
              <button className="w-full px-4 py-2.5 bg-white text-[#f6339a] rounded-xl text-sm font-bold shadow-lg hover:bg-gray-100 transition transform hover:scale-105 active:scale-95">
                {t.upgrade}
              </button>
            </div>
          </div>
          {/* Elementos decorativos sutiles */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-900/20 rounded-full blur-2xl"></div>
        </div>

      </div>
    </>
  );
};