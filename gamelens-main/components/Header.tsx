'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart, Search, User, Menu, Globe, ChevronDown, LogOut, Settings } from 'lucide-react';
import { VerticalMenu } from '@/components/VerticalMenu';
import { useLanguage } from '../app/context/LanguageContext';
import { useAuth } from '../app/context/AuthContext';
import { useNotifications } from '@/app/context/NotificationContext';

export function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [localUser, setLocalUser] = useState<any>(null);
  const { language, toggleLanguage } = useLanguage();
  const { user: contextUser, logout } = useAuth();
  const { notifications } = useNotifications();

  useEffect(() => {
    const storedSession = localStorage.getItem('user_session');
    
    if (storedSession) {
      try {
        const user = JSON.parse(storedSession);
        
        setLocalUser(user);

        if (user && user.id) {
            fetch(`http://127.0.0.1:8001/api/users/${user.id}/favorites`)
              .then(res => {
                  if (!res.ok) throw new Error("Backend offline o error 404");
                  return res.json();
              })
              .then(favs => {
                if (Array.isArray(favs)) {
                  const ids = favs.map((f: any) => f.game_id);
                  localStorage.setItem('user_favorites_ids', JSON.stringify(ids));
                  window.dispatchEvent(new Event("favorites_updated"));
                }
              })
              .catch(err => console.log("Aviso: No se pudieron cargar favoritos (Backend apagado o nuevo usuario)"));
        }

      } catch (e) {
        console.error("Error recuperando sesión:", e);
      }
    }
  }, []);

  const activeUser = localUser || contextUser;
  const displayName = activeUser?.username || activeUser?.name || 'Guest';
  const displayRole = activeUser?.role || 'Guest';
  const displayAvatar = activeUser?.avatar_url || activeUser?.avatarUrl;

  const translations = {
    en: { favorites: 'Favorites', searchPlaceholder: 'Search games...', login: 'Login', profile: 'My Profile', logout: 'Log Out', guest: 'Guest' },
    es: { favorites: 'Favoritos', searchPlaceholder: 'Buscar juegos...', login: 'Iniciar Sesión', profile: 'Mi Perfil', logout: 'Cerrar Sesión', guest: 'Invitado' }
  };

  const t = translations[language.toLowerCase() as 'en' | 'es'];

  const handleSearch = (e?: React.KeyboardEvent) => {
    if (!e || e.key === 'Enter') {
        if (searchTerm.trim().length > 0) {
            router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
            setSearchTerm('');
            setIsMobileMenuOpen(false);
        }
    }
  };

  // LOGOUT 
  const handleLogout = () => {
    logout(); // Limpiar contexto
    localStorage.removeItem('user_session'); // Borrar sesión real
    setLocalUser(null); // Limpiar estado local
    setIsUserMenuOpen(false);
    router.push('/login'); // Mandar al login
  };

  return (
    <>
      <div className="lg:hidden">
        <VerticalMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 md:px-10 border-b border-white/5 bg-[#131119]/80 backdrop-blur-xl shrink-0 animate-fade-up">
        <div className="flex items-center gap-4 md:gap-8">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-400 hover:text-white lg:hidden transition-colors relative z-50">
            <Menu size={24} />
          </button>

          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative w-10 h-10 transition-transform duration-700 ease-in-out group-hover:rotate-[360deg]">
              <Image src="/Logo_Game.svg" alt="GameLens Logo" width={40} height={40} className="object-contain" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 hidden sm:block font-display group-hover:from-white group-hover:to-white transition-all">
              GameLens
            </h1>
          </Link>

          <div className="relative hidden md:block group ml-6 lg:ml-14">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleSearch}
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-gray-300 focus:outline-none focus:bg-neutral-900 focus:border-blue-500/50 focus:text-white focus:ring-1 focus:ring-blue-500/20 transition-all w-48 lg:w-80 placeholder:text-gray-600"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/favorites" className="hidden sm:flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-pink-600/20 hover:bg-pink-600/40 text-pink-500 rounded-full transition-colors font-semibold border border-pink-600/50 active:scale-95">
            <Heart size={18} fill="currentColor" />
            <span>{t.favorites}</span>
          </Link>

          <button onClick={toggleLanguage} className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-full transition-colors font-semibold border border-white/10 active:scale-95">
            <Globe size={18} />
            <span className="text-sm font-bold w-4 text-center">{language}</span>
          </button>

          <div className="h-8 w-px bg-white/10 hidden sm:block"></div>

          <div className="relative">
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 pl-2 group cursor-pointer focus:outline-none">
                {/* INFO DEL USUARIO */}
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-white leading-none group-hover:text-purple-400 transition-colors capitalize">
                        {displayName}
                    </p>
                    <p className="text-xs text-blue-400 font-medium mt-1 uppercase">
                        {displayRole}
                    </p>
                </div>
                
                {/* AVATAR */}
                  <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-blue-500 to-purple-500 group-hover:from-purple-500 group-hover:to-pink-500 transition-all relative">
                      
                      <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden relative">
                          {displayAvatar ? (
                              <Image src={displayAvatar} alt="Avatar" fill className="object-cover" />
                          ) : (
                              <User size={20} className="text-gray-400" />
                          )}
                      </div>

                      {/* NOTIFICACIÓN */}
                      {notifications.total > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#FD1372] rounded-full flex items-center justify-center border-2 border-[#131119] z-10 animate-pulse">
                              <span className="text-[10px] font-bold text-white leading-none pt-[1px]">
                                  {notifications.total > 99 ? '99+' : notifications.total}
                              </span>
                          </div>
                      )}
                      
                  </div>
                <ChevronDown size={14} className={`text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* MENÚ DESPLEGABLE */}
            {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#1A1A20] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-50">
                    <div className="p-1">
                        {!activeUser ? (
                            // SI NO HAY USUARIO -> MOSTRAR LOGIN
                            <Link 
                                href="/login" 
                                onClick={() => setIsUserMenuOpen(false)}
                                className="w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 rounded-lg flex items-center gap-2 font-bold"
                            >
                                <User size={16} /> {t.login}
                            </Link>
                        ) : (
                            // SI HAY USUARIO -> MOSTRAR PERFIL Y LOGOUT
                            <>
                                <Link 
                                    href="/profile" 
                                    onClick={() => setIsUserMenuOpen(false)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <Settings size={16} className="text-blue-400" /> {t.profile}
                                </Link>
                                
                                <div className="h-px bg-white/10 my-1"></div>
                                
                                <button 
                                    onClick={handleLogout} 
                                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                                >
                                    <LogOut size={16} /> {t.logout}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}