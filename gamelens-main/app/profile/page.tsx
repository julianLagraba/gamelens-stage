'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, Search, User, Settings, Clock, Trophy, Gamepad2, MapPin, Calendar, Edit2, Medal, Users, Activity, Zap, Crown, Swords, X, Shield, Target, Flame, MessageCircle, MoreHorizontal, Camera, ChevronLeft, Check,
  PlayCircle, CheckCircle, XCircle, PauseCircle,
  UserMinus, BellOff, Flag, ExternalLink, UserPlus, Inbox
} from 'lucide-react';
import { VerticalMenu } from '@/components/VerticalMenu';
import { Header } from '@/components/Header';
import { useLanguage } from '@/app/context/LanguageContext';
import { useFavorites } from '@/app/context/FavoritesContext';
import { useCollection } from '@/app/context/CollectionContext';
import { ChatWindow } from '@/components/ChatWindow';
// IMPORTAMOS LOS COMPONENTES NUEVOS
import { FriendsWidget } from '@/components/FriendsWidget';
import { FriendsModal } from '@/components/FriendsModal';

export const dynamic = 'force-dynamic';

const PALETTE = {
  CEL_AZUL: '#50a2ff',
  VERDE: '#00FF62',
  AMARILLO: '#efb537',
  LILA: '#b340bf',
  VIOLETA: '#a855f7',
  CYAN: '#2DD4E0',
  ROSA: '#f6339a',
  MORADO: '#4530BE',
  ROJO: '#FF4444',
  BLANCO: '#FFFFFF',
  GRIS: '#9CA3AF'
};

const ICON_MAP: any = {
    "Crown": Crown, "Zap": Zap, "Swords": Swords, "Trophy": Trophy,
    "Medal": Medal, "Target": Target, "Flame": Flame, "Shield": Shield, "Settings": Settings
};

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any, bg: string }> = {
    playing: { label: 'PLAYING', color: PALETTE.VERDE, icon: PlayCircle, bg: 'rgba(0, 255, 98, 0.1)' },
    completed: { label: 'COMPLETED', color: PALETTE.AMARILLO, icon: Trophy, bg: 'rgba(239, 181, 55, 0.1)' },
    dropped: { label: 'DROPPED', color: PALETTE.ROJO, icon: XCircle, bg: 'rgba(255, 68, 68, 0.1)' },
    owned: { label: 'BACKLOG', color: PALETTE.CEL_AZUL, icon: Clock, bg: 'rgba(80, 162, 255, 0.1)' },
};

const COUNTRIES = ["Argentina", "Bolivia", "Brasil", "Canada", "Chile", "China", "Colombia", "Costa Rica", "Ecuador", "El Salvador", "España", "Estados Unidos", "Francia", "Alemania", "Guatemala", "Honduras", "Italia", "Japón", "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "Portugal", "Reino Unido", "República Dominicana", "Rusia", "South Korea", "Uruguay", "Venezuela", "Otro"];

const RANKS = [
  { minLevel: 0,  title_en: "Rookie Tracker", title_es: "Rastreador Novato", color: "#CD7F32", icon: Shield, desc_en: "Just started the journey", desc_es: "Comenzando la aventura" }, 
  { minLevel: 10, title_en: "Advanced Player", title_es: "Jugador Avanzado", color: "#C0C0C0", icon: Gamepad2, desc_en: "Gaining experience", desc_es: "Ganando experiencia" }, 
  { minLevel: 25, title_en: "Elite Collector", title_es: "Coleccionista Élite", color: "#efb537", icon: Medal, desc_en: "Top tier collection", desc_es: "Colección de alto nivel" }, 
  { minLevel: 50, title_en: "Legendary Curator", title_es: "Curador Legendario", color: "#b340bf", icon: Crown, desc_en: "A living legend", desc_es: "Una leyenda viviente" }, 
  { minLevel: 100, title_en: "Game God", title_es: "Dios del Gaming", color: "#FF4444", icon: Zap, desc_en: "Unstoppable", desc_es: "Imparable" } 
];

const getCurrentRank = (level: number) => RANKS.slice().reverse().find(r => level >= r.minLevel) || RANKS[0];
const formatNumber = (num: number) => num >= 1000000 ? (num / 1000000).toFixed(1) + 'M' : num >= 1000 ? (num / 1000).toFixed(0) + 'k' : num.toString();

const BANNER_OPTIONS = [
  { id: 'b1', name: 'Elden Ring', url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg' },
  { id: 'b2', name: 'Cyberpunk 2077', url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1091500/library_hero.jpg' },
  { id: 'b3', name: 'Hades II', url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1145350/library_hero.jpg' },
  { id: 'b4', name: 'Baldurs Gate 3', url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1086940/library_hero.jpg' },
];

const AVATAR_OPTIONS = [
  { id: 'bot1', name: 'R0-B0', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Cale' },
  { id: 'bot2', name: 'Mecha-X', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Destiny' },
  { id: 'av1', name: 'Gamer Boy', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
  { id: 'av2', name: 'Gamer Girl', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka' },
  { id: 'pix1', name: '8-Bit Hero', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Link' },
  { id: 'pix2', name: '8-Bit Villain', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ganon' },
  { id: 'lor1', name: 'Artist', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Sarah' },
  { id: 'lor2', name: 'Mage', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=John' },
];

const allAchievements = [
  { id: 1, title: "GameLens Initiate", game: "GameLens", icon: Shield, color: "#CD7F32", rarityKey: "Common", desc_en: "Create your account.", desc_es: "Crea tu cuenta." },
  { id: 2, title: "Library Builder", game: "GameLens", icon: Trophy, color: "#50a2ff", rarityKey: "Rare", desc_en: "Add 5 games.", desc_es: "Agrega 5 juegos." }
];

const initialUserProfile = {
  id: 0,
  name: "Guest",
  tag: "@guest",
  bio_es: "Usuario nuevo en GameLens. ¡Listo para empezar a trackear!",
  bio_en: "New GameLens user. Ready to start tracking!",
  avatarUrl: "", 
  coverUrl: "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg",
  location: "Earth",
  joinDate_es: "Ene 2026",
  joinDate_en: "Jan 2026",
  favoritePlatform: "PC",
  level: 1,
  xp: 0,
  stats: { gamesOwned: 0, hoursPlayed: 0, achievements: 0, friends: 0 },
  favorites: [],
  achievements: [], 
  friendsList: [], 
  requests: []     
};

export default function ProfilePage() {
  const router = useRouter(); 
  const { favorites } = useFavorites(); 
  const { collection } = useCollection();
  const { language } = useLanguage();

  const translations = {
    en: {
        loading: 'Loading profile...',
        joined: 'Joined',
        edit: 'Edit Profile',
        level: 'Lvl',
        stats: { games: 'Games', hours: 'Hours Played', ach: 'Achievements', friends: 'Friends' },
        activity: 'Recent Activity',
        viewActivity: 'View activity',
        favorites: 'Favorites',
        viewAll: 'View all',
        achievements: 'Recent Achievements',
        friendsList: 'Friends',
        modalEdit: { title: 'Edit Profile', cover: 'Choose Cover', avatar: 'Choose Avatar', name: 'Display Name', tag: 'Tag (ID)', bio: 'Bio', loc: 'Location', cancel: 'Cancel', save: 'Save Changes', back: 'Back', notEditable: 'Not editable', changeCover: 'Change Cover' },
        modalAch: { title: 'Unlocked Achievements', total: 'Total', close: 'Close' },
        modalAct: { title: 'Activity History', sub: 'All tracked games', close: 'Close', playing: 'Playing now', played: 'Played', online: 'Online', offline: 'Offline' },
        modalFav: { title: 'Favorite Games', sub: 'Your personal collection', close: 'Close' },
        rarity: { Legendary: 'Legendary', Epic: 'Epic', UltraRare: 'Ultra Rare', Rare: 'Rare', Common: 'Common' }
    },
    es: {
        loading: 'Cargando perfil...',
        joined: 'Se unió en',
        edit: 'Editar Perfil',
        level: 'Nvl',
        stats: { games: 'Juegos', hours: 'Horas Jugadas', ach: 'Logros', friends: 'Amigos' },
        activity: 'Actividad Reciente',
        viewActivity: 'Ver actividad',
        favorites: 'Favoritos',
        viewAll: 'Ver todos',
        achievements: 'Logros Recientes',
        friendsList: 'Amigos',
        modalEdit: { title: 'Editar Perfil', cover: 'Elige una Portada', avatar: 'Elige un Avatar', name: 'Nombre Visible', tag: 'Tag (ID)', bio: 'Biografía', loc: 'Ubicación', cancel: 'Cancelar', save: 'Guardar Cambios', back: 'Volver', notEditable: 'No editable', changeCover: 'Cambiar Portada' },
        modalAch: { title: 'Logros Desbloqueados', total: 'Total', close: 'Cerrar' },
        modalAct: { title: 'Historial de Actividad', sub: 'Últimos juegos jugados', close: 'Cerrar', playing: 'Jugando ahora', played: 'Jugó hace', online: 'En línea', offline: 'Desconectado' },
        modalFav: { title: 'Juegos Favoritos', sub: 'Tu colección personal', close: 'Cerrar' },
        rarity: { Legendary: 'Legendario', Epic: 'Épico', UltraRare: 'Ultra Raro', Rare: 'Raro', Common: 'Común' }
    }
  };

  const t = translations[language.toLowerCase() as 'en' | 'es'];

  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(initialUserProfile);

  const [hoveredAchievement, setHoveredAchievement] = useState<number | null>(null);
  const [hoveredActivity, setHoveredActivity] = useState<number | null>(null);
   
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  
  // ESTADOS DEL NUEVO SISTEMA DE AMIGOS
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [activeChatFriend, setActiveChatFriend] = useState<any | null>(null);

  const [showEditProfileModal, setShowEditProfileModal] = useState(false);

  const [editForm, setEditForm] = useState({ ...initialUserProfile, bio: initialUserProfile.bio_es });
  const [selectingMedia, setSelectingMedia] = useState<'cover' | 'avatar' | null>(null);

  const fullActivityList = useMemo(() => {
    const priority = { playing: 4, completed: 3, dropped: 2, owned: 1 };
    return [...collection].sort((a, b) => {
        // @ts-ignore
        const scoreA = priority[a.status] || 0;
        // @ts-ignore
        const scoreB = priority[b.status] || 0;
        if (scoreA === scoreB) return b.id - a.id;
        return scoreB - scoreA; 
    });
  }, [collection]);

  const previewActivityList = useMemo(() => fullActivityList.slice(0, 3), [fullActivityList]);

  // Carga de Datos
  useEffect(() => {
    const loadData = async () => {
      const storedSession = localStorage.getItem('user_session');
      if (!storedSession) { router.push('/login'); return; }
      
      const sessionUser = JSON.parse(storedSession);
      
      setUserProfile(prev => ({
          ...prev,
          id: sessionUser.id,
          name: sessionUser.username,
          tag: `@${sessionUser.username.toLowerCase()}`,
          avatarUrl: sessionUser.avatar_url || prev.avatarUrl,
          coverUrl: sessionUser.cover_url || prev.coverUrl,
          level: sessionUser.level || 1,
          xp: sessionUser.xp || 0
      }));

      try {
        try {
            const resUser = await fetch(`http://localhost:8000/api/users/${sessionUser.id}`);
            
            if (resUser.ok) {
                const freshUser = await resUser.json();
                localStorage.setItem('user_session', JSON.stringify(freshUser));
                
                setUserProfile(prev => ({
                    ...prev,
                    name: freshUser.username,
                    avatarUrl: freshUser.avatar_url,
                    coverUrl: freshUser.cover_url,
                    location: freshUser.location,
                    bio_es: freshUser.bio,
                    bio_en: freshUser.bio,
                    level: freshUser.level,
                    xp: freshUser.xp
                }));
            } else if (resUser.status === 404) {
                console.warn("Usuario no encontrado en DB. Cerrando sesión...");
                localStorage.removeItem('user_session'); 
                router.push('/login'); 
                return; 
            }
        } catch (e) { 
            console.warn("Backend offline o error de red"); 
        }

        let achievementsData = [];
        try {
            const resAch = await fetch(`http://localhost:8001/api/users/${sessionUser.id}/achievements`);
            if (resAch.ok) {
                const rawAchievements = await resAch.json();
                if(rawAchievements.length > 0) {
                    achievementsData = rawAchievements.map((ua: any) => ({
                        id: ua.achievement.id,
                        title: ua.achievement.title,
                        game: ua.achievement.game_name,
                        icon: ICON_MAP[ua.achievement.icon_name] || Trophy,
                        color: ua.achievement.color,
                        rarityKey: ua.achievement.rarity,
                        desc_en: ua.achievement.description,
                        desc_es: ua.achievement.description,
                        date_es: ua.unlocked_at,
                        date_en: ua.unlocked_at
                    }));
                }
            }
        } catch (e) { console.warn("Achievements API unavailable"); }

        const finalAchievements = achievementsData.length > 0 ? achievementsData : (sessionUser.id === 0 ? allAchievements : []);

        setUserProfile(prev => ({
            ...prev,
            achievements: finalAchievements,
            stats: {
                ...prev.stats,
                gamesOwned: collection.length,
                achievements: finalAchievements.length, 
                // Los amigos se cargan en el widget, pero mantenemos el stat si lo hubiera
                friends: prev.stats.friends 
            }
        }));

      } catch (e) {
        console.error("Error global:", e);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router, collection.length]); 

  useEffect(() => {
    if (showAchievementsModal || showActivityModal || showFavoritesModal || showFriendsModal || showEditProfileModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showAchievementsModal, showActivityModal, showFavoritesModal, showFriendsModal, showEditProfileModal]);

  const handleOpenEditModal = () => {
    const currentBio = language === 'EN' ? userProfile.bio_en : userProfile.bio_es;
    setEditForm({ ...userProfile, bio: currentBio });
    setSelectingMedia(null);
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async () => {
    try {
        const response = await fetch(`http://localhost:8001/api/users/${userProfile.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: editForm.name, avatar_url: editForm.avatarUrl, cover_url: editForm.coverUrl, location: editForm.location, bio: editForm.bio
            })
        });
        if (response.ok) {
            const updatedUser = await response.json();
            const finalBio = editForm.bio || userProfile.bio_es;
            setUserProfile(prev => ({ ...prev, name: updatedUser.username, avatarUrl: updatedUser.avatar_url, coverUrl: updatedUser.cover_url, location: updatedUser.location, bio_es: finalBio, bio_en: finalBio }));
            const currentSession = JSON.parse(localStorage.getItem('user_session') || '{}');
            localStorage.setItem('user_session', JSON.stringify({ ...currentSession, ...updatedUser }));
            window.dispatchEvent(new Event("storage")); 
            setShowEditProfileModal(false);
        } else { alert("Error al guardar."); }
    } catch (error) { alert("Error de conexión"); }
  };

  const handleMediaSelect = (url: string) => {
      if (selectingMedia === 'cover') setEditForm({ ...editForm, coverUrl: url });
      else if (selectingMedia === 'avatar') setEditForm({ ...editForm, avatarUrl: url });
      setSelectingMedia(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (selectingMedia === 'avatar') setEditForm({ ...editForm, avatarUrl: reader.result as string });
        else setEditForm({ ...editForm, coverUrl: reader.result as string });
        setSelectingMedia(null);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-white bg-[#131119]">{t.loading}</div>;
  const safeUser = { name: userProfile.name, avatarUrl: userProfile.avatarUrl, favoritePlatform: userProfile.favoritePlatform, username: userProfile.name, role: 'User' };

  return (
    <div className="min-h-screen flex flex-col bg-[#131119]" style={{ colorScheme: 'dark' }}>
      <style jsx global>{`
        @keyframes modalPop { 0% { opacity: 0; transform: scale(0.95) translateY(10px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-modal-pop { animation: modalPop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; }
        .game-card-hover, [class*="GameCard"] { transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1) !important; transform-origin: center center !important; will-change: transform; }
        .game-card-hover:hover { transform: scale(1.04) !important; translate: 0px 0px !important; z-index: 50 !important; filter: brightness(1.1); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.5); }
      `}</style>

      {/* MODAL EDITAR */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300" onClick={() => setShowEditProfileModal(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-[#131119] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-modal-pop">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#1A1A20]">
              <div className="flex items-center gap-3">
                  {selectingMedia && <button onClick={() => setSelectingMedia(null)} className="mr-2 p-1 hover:bg-white/10 rounded-full transition-colors"><ChevronLeft size={24} className="text-white" /></button>}
                  <h2 className="text-xl font-black text-white">{selectingMedia === 'cover' ? t.modalEdit.cover : selectingMedia === 'avatar' ? t.modalEdit.avatar : t.modalEdit.title}</h2>
              </div>
              <button onClick={() => setShowEditProfileModal(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-[#131119] no-scrollbar">
               {selectingMedia === 'cover' ? (
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative h-32 rounded-xl border-2 border-dashed border-white/30 flex flex-col items-center justify-center hover:border-white hover:bg-white/5 transition-all cursor-pointer group">
                            <label htmlFor="file-upload-cover" className="cursor-pointer flex flex-col items-center justify-center w-full h-full"><Camera size={32} className="text-gray-400 group-hover:text-white mb-2" /><span className="text-sm font-bold text-gray-400 group-hover:text-white">Upload from PC</span></label>
                            <input id="file-upload-cover" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                        </div>
                        {BANNER_OPTIONS.map((banner) => (
                           <div key={banner.id} onClick={() => handleMediaSelect(banner.url)} className={`relative h-32 rounded-xl overflow-hidden cursor-pointer border-2 transition-all group ${editForm.coverUrl === banner.url ? 'border-green-500' : 'border-transparent hover:border-white/30'}`}>
                               <Image src={banner.url} alt={banner.name} fill className="object-cover" unoptimized />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><span className="font-bold text-white text-sm">{banner.name}</span></div>
                               {editForm.coverUrl === banner.url && <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg"><Check size={14} className="text-black" /></div>}
                           </div>
                        ))}
                   </div>
               ) : selectingMedia === 'avatar' ? (
                   <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
                       <div className="flex flex-col items-center gap-2 cursor-pointer group relative">
                           <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2"><div className="w-20 h-20 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center hover:border-white hover:bg-white/5 transition-all"><Camera size={24} className="text-gray-400 group-hover:text-white" /></div><span className="text-xs font-bold text-gray-400 group-hover:text-white">Upload PC</span></label>
                           <input id="file-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                       </div>
                       {AVATAR_OPTIONS.map((avatar) => (
                           <div key={avatar.id} onClick={() => handleMediaSelect(avatar.url)} className="flex flex-col items-center gap-2 cursor-pointer group">
                               <div className={`relative w-20 h-20 rounded-full overflow-hidden border-2 transition-all bg-neutral-800 text-transparent ${editForm.avatarUrl === avatar.url ? 'border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]' : 'border-white/10 group-hover:border-white/50'}`}>
                                   <Image src={avatar.url} alt={avatar.name} fill className="object-cover" unoptimized />
                                   {editForm.avatarUrl === avatar.url && <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center text-green-500"><Check size={24} className="font-bold drop-shadow-md" /></div>}
                               </div>
                           </div>
                       ))}
                   </div>
               ) : (
                   <div className="space-y-6">
                       <div className="relative w-full h-32 md:h-40 rounded-xl overflow-hidden group cursor-pointer border border-white/10" onClick={() => setSelectingMedia('cover')}>
                           <Image src={editForm.coverUrl} alt="Cover" fill className="object-cover" unoptimized />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={24} className="text-white mr-2"/><span className="text-xs font-bold text-white uppercase">{t.modalEdit.changeCover}</span></div>
                       </div>
                       
                       <div className="relative -mt-16 ml-4 w-24 h-24 rounded-full p-1 bg-[#131119]">
                           <div className="w-full h-full rounded-full overflow-hidden relative cursor-pointer border border-white/10 group" onClick={() => setSelectingMedia('avatar')}>
                                {editForm.avatarUrl ? <Image src={editForm.avatarUrl} alt="Avatar" fill className="object-cover"/> : <div className="w-full h-full bg-neutral-800 flex items-center justify-center"><User size={32} className="text-gray-500"/></div>}
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Camera size={20} className="text-white"/></div>
                           </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                           <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{t.modalEdit.name}</label><input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[#1A1A20] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors" /></div>
                           <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{t.modalEdit.tag}</label><div className="relative"><input type="text" defaultValue={editForm.tag} disabled className="w-full bg-[#1A1A20]/50 border border-white/5 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed" /><span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-600 font-medium">{t.modalEdit.notEditable}</span></div></div>
                       </div>
                       <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{t.modalEdit.bio}</label><textarea value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} rows={3} className="w-full bg-[#1A1A20] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors resize-none" /></div>
                       <div className="space-y-2"><label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{t.modalEdit.loc}</label><div className="relative group"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10 group-focus-within:text-white transition-colors" size={16} /><select value={editForm.location || ""} onChange={(e) => setEditForm({...editForm, location: e.target.value})} className="w-full bg-[#1A1A20] border border-white/10 rounded-xl pl-10 pr-8 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer hover:bg-[#202028]"><option value="" disabled>Selecciona un país</option>{COUNTRIES.map((country) => (<option key={country} value={country} className="bg-[#1A1A20] text-white">{country}</option>))}</select></div></div>
                   </div>
               )}
            </div>

            {!selectingMedia ? (
                <div className="px-6 py-4 bg-[#1A1A20] border-t border-white/5 flex justify-end gap-3"><button onClick={() => setShowEditProfileModal(false)} className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors">{t.modalEdit.cancel}</button><button onClick={handleSaveProfile} className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg">{t.modalEdit.save}</button></div>
            ) : (
                <div className="px-6 py-4 bg-[#1A1A20] border-t border-white/5 flex justify-end"><button onClick={() => setSelectingMedia(null)} className="px-5 py-2.5 text-sm font-bold text-gray-400 hover:text-white transition-colors">{t.modalEdit.back}</button></div>
            )}
          </div>
        </div>
      )}

      {/* MODAL LOGROS */}
      {showAchievementsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"><div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowAchievementsModal(false)} /><div className="relative w-full max-w-4xl max-h-[85vh] bg-[#131119] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-modal-pop"><div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#1A1A20]"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-yellow-500/10 text-yellow-500"><Trophy size={24} /></div><div><h2 className="text-xl font-black text-white">{t.modalAch.title}</h2><p className="text-sm text-gray-400 mt-1">{t.modalAch.total}: <span className="text-white font-bold">{userProfile.stats.achievements}</span></p></div></div><button onClick={() => setShowAchievementsModal(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"><X size={24} /></button></div><div className="flex-1 overflow-y-auto p-6 bg-[#131119] no-scrollbar"><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{userProfile.achievements.map(ach => { const Icon = ach.icon; return (<div key={ach.id} className="group flex gap-4 p-4 rounded-2xl bg-[#1A1A20] border border-white/5 hover:border-white/10 transition-all"><div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center" style={{ background: `${ach.color}20`, border: `1px solid ${ach.color}40` }}><Icon size={32} style={{ color: ach.color }} /></div><div><h4 className="font-bold text-white text-lg">{ach.title}</h4><p className="text-sm text-gray-400">{language === 'EN' ? ach.desc_en : ach.desc_es}</p></div></div>)})}</div></div></div></div>
      )}

      {/* MODAL ACTIVIDAD */}
      {showActivityModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"><div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowActivityModal(false)} /><div className="relative w-full max-w-3xl max-h-[85vh] bg-[#131119] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-modal-pop"><div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#1A1A20]"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500"><Activity size={24} /></div><div><h2 className="text-xl font-black text-white">{t.modalAct.title}</h2></div></div><button onClick={() => setShowActivityModal(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"><X size={24} /></button></div><div className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#131119] no-scrollbar space-y-3">{fullActivityList.length > 0 ? (fullActivityList.map(game => {const statusStyle = STATUS_CONFIG[game.status as string] || STATUS_CONFIG['owned']; const StatusIcon = statusStyle.icon; return (<Link href={`/game/${game.game_slug}`} key={game.id} className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A1A20] border border-white/5 hover:border-blue-500/30 transition-all"><div className="w-28 h-16 rounded-xl overflow-hidden relative"><Image src={game.cover_url} alt={game.game_name} fill className="object-cover" unoptimized /></div><div className="flex-1 min-w-0"><h4 className="font-bold text-white text-lg truncate">{game.game_name}</h4><div className="flex items-center gap-2 mt-2"><div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full border" style={{ backgroundColor: statusStyle.bg, borderColor: `${statusStyle.color}40` }}><StatusIcon size={12} style={{ color: statusStyle.color }}/><span className="text-[10px] font-black uppercase tracking-wide" style={{ color: statusStyle.color }}>{statusStyle.label}</span></div></div></div></Link>)})) : <div className="text-center text-gray-500 py-10">No recent activity.</div>}</div></div></div>
      )}

      {/* MODAL FAVORITOS */}
      {showFavoritesModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4"><div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowFavoritesModal(false)} /><div className="relative w-full max-w-5xl max-h-[85vh] bg-[#131119] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-modal-pop"><div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-[#1A1A20]"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500"><Heart size={24} /></div><div><h2 className="text-xl font-black text-white">{t.modalFav.title}</h2><p className="text-sm text-gray-400 mt-1">{t.modalFav.sub}</p></div></div><button onClick={() => setShowFavoritesModal(false)} className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"><X size={24} /></button></div><div className="flex-1 overflow-y-auto p-6 bg-[#131119] no-scrollbar grid grid-cols-3 gap-4">{favorites.map(game => (<Link href={`/game/${game.slug}`} key={game.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/5"><Image src={game.coverUrl} alt={game.name} fill className="object-cover" /></Link>))}</div></div></div>
      )}

      {/* MODAL NUEVO DE AMIGOS */}
      {showFriendsModal && (
        <FriendsModal 
            userId={userProfile.id} 
            onClose={() => setShowFriendsModal(false)} 
            onOpenChat={(friend) => {
                setShowFriendsModal(false); 
                setActiveChatFriend(friend); 
            }} 
        />
      )}
      
      {/* CHAT */}
      {activeChatFriend && <ChatWindow friend={activeChatFriend} currentUserId={userProfile.id} onClose={() => setActiveChatFriend(null)} />}
      
      <Header user={safeUser} />
      
      <main className="flex-1 px-6 md:px-10 max-w-[1920px] mx-auto w-full relative flex flex-col animate-fade-up">
        <div className="flex flex-col md:flex-row gap-8 flex-1 items-stretch">
          <aside className="hidden md:block w-[260px] shrink-0 relative">
             <div className="sticky top-[74px] pt-10 pb-10 h-[calc(100vh-74px)] overflow-y-auto no-scrollbar"><VerticalMenu activeItem="profile" /></div>
          </aside>

          <div className="flex-1 w-full min-w-0 space-y-8 flex flex-col pt-6 md:pt-10 pb-10">
            {/* PROFILE HEADER (Original) */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-[#1A1A20] group">
                <div className="h-48 md:h-64 w-full relative"><div className="absolute inset-0 bg-gradient-to-t from-[#1A1A20] via-[#1A1A20]/40 to-transparent z-10" /><Image src={userProfile.coverUrl} alt="Cover" fill className="object-cover opacity-60" unoptimized /></div>
                <div className="relative z-20 px-6 md:px-8 -mt-16 md:-mt-20 flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 mb-8">
                    <div className="w-28 h-28 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500 shadow-xl shrink-0"><div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden relative">{userProfile.avatarUrl ? <Image src={userProfile.avatarUrl} alt="Avatar" fill className="object-cover" /> : <User size={64} className="text-gray-600" />}</div></div>
                    <div className="flex-1 mb-2 text-center md:text-left w-full">
                        <div className="flex flex-col md:items-start items-center"><div className="flex items-center gap-3"><h2 className="text-3xl md:text-4xl font-black text-white capitalize">{userProfile.name}</h2><span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#00FF62]/20 text-[#00FF62] border border-[#00FF62]/30">LVL {userProfile.level}</span></div>
                        <div className="w-full max-w-[200px] mt-2 group relative"><div className="h-1.5 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-[#00FF62] to-emerald-400" style={{ width: `${Math.min(100, (userProfile.xp % 1000) / 10)}%` }} /></div><div className="flex justify-between text-[10px] font-bold text-gray-500 mt-1 font-mono"><span className="text-[#00FF62]">{userProfile.xp} XP</span><span>Next: {userProfile.level * 1000} XP</span></div></div></div>
                        <p className="text-gray-400 font-medium text-sm mt-3">{userProfile.tag}</p><p className="text-gray-300 mt-2 max-w-2xl text-sm leading-relaxed">{language === 'EN' ? userProfile.bio_en : userProfile.bio_es}</p>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-xs font-bold text-gray-500 uppercase tracking-wide"><div className="flex items-center gap-1.5"><MapPin size={14} /> {userProfile.location}</div><div className="flex items-center gap-1.5"><Calendar size={14} /> {t.joined} {language === 'EN' ? userProfile.joinDate_en : userProfile.joinDate_es}</div></div>
                    </div>
                    <div className="mb-2 w-full md:w-auto flex justify-center md:block"><button onClick={handleOpenEditModal} className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg"><Edit2 size={16} /> {t.edit}</button></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/5 bg-black/20 backdrop-blur-sm">{[{ label: t.stats.games, value: collection.length, icon: Gamepad2, color: PALETTE.VIOLETA }, { label: t.stats.hours, value: formatNumber(userProfile.stats.hoursPlayed), icon: Clock, color: PALETTE.CEL_AZUL }, { label: t.stats.ach, value: formatNumber(userProfile.stats.achievements), icon: Trophy, color: PALETTE.AMARILLO }, { label: t.stats.friends, value: userProfile.stats.friends, icon: Users, color: PALETTE.VERDE }].map((stat, i) => (<div key={i} className="p-4 md:p-6 flex flex-col items-center justify-center gap-1 hover:bg-white/5 md:border-r border-white/5 last:border-r-0 border-b md:border-b-0"><stat.icon size={18} className="mb-1 opacity-80 md:w-5 md:h-5" style={{ color: stat.color }} /><span className="text-xl md:text-2xl font-black text-white">{stat.value}</span><span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span></div>))}</div>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch flex-1">
                <div className="xl:col-span-2 space-y-8 flex flex-col h-full">
                    {/* ACTIVIDAD RECIENTE (TOP 3) */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1"><h3 className="text-xl font-bold text-white flex items-center gap-2"><Activity size={20} style={{ color: PALETTE.CEL_AZUL }} /> {t.activity}</h3><button onClick={() => setShowActivityModal(true)} className="text-xs font-bold text-gray-500 hover:text-white transition-colors focus:outline-none">{t.viewActivity}</button></div>
                        <div className="space-y-3">
                            {previewActivityList.length > 0 ? (previewActivityList.map((game) => {
                                const statusStyle = STATUS_CONFIG[game.status as string] || STATUS_CONFIG['owned'];
                                const StatusIcon = statusStyle.icon;
                                return (<Link href={`/game/${game.game_slug}`} key={game.id} className="game-card-hover flex items-center gap-5 p-5 rounded-2xl bg-[#1A1A20] border transition-all duration-300 group relative z-0" style={{ borderColor: hoveredActivity === game.id ? PALETTE.CEL_AZUL : 'rgba(255,255,255,0.05)', boxShadow: hoveredActivity === game.id ? `0 4px 12px -2px ${PALETTE.CEL_AZUL}33` : 'none', transform: hoveredActivity === game.id ? 'translateY(-2px)' : 'none', backgroundColor: '#1A1A20' }} onMouseEnter={() => setHoveredActivity(game.id)} onMouseLeave={() => setHoveredActivity(null)}><div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 shadow-md"><Image src={game.cover_url} alt={game.game_name} fill className="object-cover" unoptimized /></div><div className="flex-1 min-w-0"><h4 className="font-bold text-white text-lg truncate transition-colors" style={{ color: hoveredActivity === game.id ? PALETTE.CEL_AZUL : 'white' }}>{game.game_name}</h4><p className="text-sm text-gray-400 mt-1 flex items-center gap-2"><span className="text-xs uppercase tracking-wide opacity-70">Added to collection</span></p></div><div className="pr-2"><div className="flex items-center gap-1.5 px-3 py-1 rounded-full shadow-sm border" style={{ backgroundColor: statusStyle.bg, borderColor: `${statusStyle.color}30` }}><StatusIcon size={12} style={{ color: statusStyle.color }} /><span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: statusStyle.color }}>{statusStyle.label}</span></div></div></Link>);
                            })) : <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl bg-[#1A1A20]/30 text-gray-500"><Gamepad2 size={32} className="mx-auto mb-2 opacity-30"/><p className="text-sm">Start adding games to see your activity here.</p></div>}
                        </div>
                    </div>

                    {/* 🔥🔥 RANGO (RANK) RESTAURADO AQUÍ 🔥🔥 */}
                    {(() => {
                        const rank = getCurrentRank(userProfile.level || 1);
                        return (
                            <div className="p-5 rounded-2xl border flex items-center gap-4 relative overflow-hidden shrink-0 transition-all duration-500" style={{ background: `linear-gradient(135deg, ${rank.color}1A, ${rank.color}0D)`, borderColor: `${rank.color}4D`, boxShadow: `0 0 20px -5px ${rank.color}1A` }}>
                                <style>{`@keyframes shimmer { 0% { transform: translateX(-150%) skewX(-15deg); } 100% { transform: translateX(150%) skewX(-15deg); } }`}</style>
                                <div className="absolute inset-0 w-full h-full z-0 pointer-events-none" style={{ background: `linear-gradient(90deg, transparent, ${rank.color}4D, transparent)`, animation: 'shimmer 3s infinite linear' }} />
                                <div className="absolute inset-0 blur-xl opacity-20" style={{ backgroundColor: rank.color }}></div>
                                <div className="p-3 rounded-full relative z-10 transition-colors duration-300" style={{ backgroundColor: `${rank.color}33`, color: rank.color }}><rank.icon size={28} /></div>
                                <div className="relative z-10"><p className="text-base font-bold transition-colors duration-300" style={{ color: rank.color }}>{language === 'EN' ? rank.title_en : rank.title_es}</p><p className="text-xs mt-0.5 opacity-80" style={{ color: rank.color }}>{language === 'EN' ? rank.desc_en : rank.desc_es}</p></div>
                            </div>
                        );
                    })()}

                    {/* FAVORITOS */}
                    <div className="space-y-4 flex flex-col flex-1">
                        <div className="flex items-center justify-between px-1"><h3 className="text-xl font-bold text-white flex items-center gap-2"><Heart size={20} style={{ color: PALETTE.ROSA }} /> {t.favorites}</h3><button onClick={() => setShowFavoritesModal(true)} className="text-xs font-bold text-gray-500 hover:text-white transition-colors focus:outline-none">{t.viewAll}</button></div>
                        {favorites.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 content-start">{favorites.slice(0, 4).map((game) => (<Link href={`/game/${game.slug}`} key={game.id} className="game-card-hover relative aspect-[3/4] rounded-xl overflow-hidden border border-white/5 transition-transform duration-300 ease-out group shadow-lg hover:shadow-pink-500/10 hover:-translate-y-1"><Image src={game.coverUrl} alt={game.name} fill className="object-cover transition-transform duration-300 ease-out group-hover:scale-110" unoptimized /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4"><span className="text-sm font-bold text-white leading-tight w-full">{game.name}</span></div></Link>))}</div>
                            ) : <div className="flex-1 bg-[#1A1A20] border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center p-6 text-center group hover:border-white/20 transition-colors"><div className="p-3 bg-neutral-800/50 rounded-full mb-3 group-hover:scale-110 transition-transform"><Heart size={24} className="text-gray-600 group-hover:text-pink-500 transition-colors" /></div><p className="text-sm text-gray-400 font-medium">No favorites pinned yet.</p></div>}
                    </div>
                </div>

                <div className="space-y-8 flex flex-col h-full">
                    {/* LOGROS */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1"><h3 className="text-xl font-bold text-white flex items-center gap-2"><Trophy size={20} style={{ color: PALETTE.AMARILLO }} /> {t.achievements}</h3><button onClick={() => setShowAchievementsModal(true)} className="text-xs font-bold text-gray-500 hover:text-white transition-colors focus:outline-none">{t.viewAll}</button></div>
                        <div className="grid grid-cols-2 gap-3">
                            {userProfile.achievements.slice(0, 4).map((ach) => {
                                const IconComponent = ach.icon || Trophy; // Fallback icon
                                return (
                                <div key={ach.id} className="game-card-hover bg-[#1A1A20] p-3 rounded-2xl border flex flex-col items-center text-center gap-2 transition-all duration-300 cursor-default relative z-0" style={{ borderColor: hoveredAchievement === ach.id ? ach.color : 'rgba(255,255,255,0.05)', boxShadow: hoveredAchievement === ach.id ? `0 4px 12px -2px ${ach.color}33` : 'none', transform: hoveredAchievement === ach.id ? 'translateY(-2px)' : 'none' }} onMouseEnter={() => setHoveredAchievement(ach.id)} onMouseLeave={() => setHoveredAchievement(null)}>
                                    <div className="p-2.5 rounded-full" style={{ backgroundColor: `${ach.color}1A`, color: ach.color }}><IconComponent size={20} /></div>
                                    <div><p className="font-bold text-white text-sm leading-tight line-clamp-1">{ach.title}</p><p className="text-xs text-gray-500 font-medium mt-0.5 uppercase tracking-wide truncate">{ach.game}</p></div>
                                </div>
                            )})}
                        </div>
                    </div>
                    
                    {/* WIDGET DE AMIGOS (Mejorado) */}
                    <div className="col-span-12 lg:col-span-4 h-full">
                        <FriendsWidget userId={userProfile.id} currentUserId={userProfile.id} />
                    </div>
                </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}