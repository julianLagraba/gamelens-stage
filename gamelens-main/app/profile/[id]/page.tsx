'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  Trophy, Gamepad2, MapPin, Calendar, Users, Activity, Shield, Crown, Medal, Zap, Target, Flame, Swords, Clock, PlayCircle, XCircle, UserCheck, UserPlus
} from 'lucide-react';
import { VerticalMenu } from '@/components/VerticalMenu';
import { Header } from '@/components/Header';

// PALETA
const PALETTE = {
  CEL_AZUL: '#50a2ff',
  VERDE: '#00FF62',
  AMARILLO: '#efb537',
  LILA: '#b340bf',
  VIOLETA: '#a855f7',
  ROSA: '#f6339a',
  ROJO: '#FF4444',
};

const ICON_MAP: any = { "Crown": Crown, "Zap": Zap, "Swords": Swords, "Trophy": Trophy, "Medal": Medal, "Target": Target, "Flame": Flame, "Shield": Shield };

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any, bg: string }> = {
    playing: { label: 'PLAYING', color: PALETTE.VERDE, icon: PlayCircle, bg: 'rgba(0, 255, 98, 0.1)' },
    completed: { label: 'COMPLETED', color: PALETTE.AMARILLO, icon: Trophy, bg: 'rgba(239, 181, 55, 0.1)' },
    dropped: { label: 'DROPPED', color: PALETTE.ROJO, icon: XCircle, bg: 'rgba(255, 68, 68, 0.1)' },
    owned: { label: 'BACKLOG', color: PALETTE.CEL_AZUL, icon: Clock, bg: 'rgba(80, 162, 255, 0.1)' },
};

const RANKS = [
  { minLevel: 0,  title: "Rookie Tracker", color: "#CD7F32", icon: Shield }, 
  { minLevel: 10, title: "Advanced Player", color: "#C0C0C0", icon: Gamepad2 }, 
  { minLevel: 25, title: "Elite Collector", color: "#efb537", icon: Medal }, 
  { minLevel: 50, title: "Legendary Curator", color: "#b340bf", icon: Crown }, 
  { minLevel: 100, title: "Game God", color: "#FF4444", icon: Zap } 
];

const getCurrentRank = (level: number) => RANKS.slice().reverse().find(r => level >= r.minLevel) || RANKS[0];
const formatNumber = (num: number) => num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num.toString();

export default function PublicProfilePage() {
  const params = useParams(); 
  const profileId = Number(params.id); 
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null); 
  const [isFriend, setIsFriend] = useState(false); // Estado para saber si son amigos

  useEffect(() => {
    const loadPublicProfile = async () => {
        const storedSession = localStorage.getItem('user_session');
        let currentUserId = null;
        if (storedSession) {
            const parsed = JSON.parse(storedSession);
            setCurrentUser(parsed);
            currentUserId = parsed.id;
        }

        try {
            const resUser = await fetch(`http://localhost:8001/api/users/${profileId}`);
            if (!resUser.ok) {
                alert("User not found");
                router.push('/profile'); 
                return;
            }
            const userData = await resUser.json();

            // Cargar Logros
            let achievements = [];
            try {
                const resAch = await fetch(`http://localhost:8001/api/users/${profileId}/achievements`);
                if(resAch.ok) {
                    const rawAch = await resAch.json();
                    achievements = rawAch.map((ua: any) => ({
                        id: ua.achievement.id,
                        title: ua.achievement.title,
                        game: ua.achievement.game_name,
                        icon: ICON_MAP[ua.achievement.icon_name] || Trophy,
                        color: ua.achievement.color,
                        desc: ua.achievement.description
                    }));
                }
            } catch (e) {}

            // Cargar Actividad
            let activity = [];
            try {
                const resAct = await fetch(`http://localhost:8001/api/users/${profileId}/activity`);
                if(resAct.ok) activity = await resAct.json();
            } catch (e) {}

            // Cargar Amigos (Y verificar si yo soy uno de ellos)
            let friendsCount = 0;
            let amIFriend = false;
            try {
                const resFri = await fetch(`http://localhost:8001/api/friends/${profileId}`);
                if(resFri.ok) {
                    const fri = await resFri.json();
                    friendsCount = fri.length;
                    // Verificamos si mi ID está en su lista de amigos
                    if (currentUserId && fri.some((f: any) => f.id === currentUserId)) {
                        amIFriend = true;
                    }
                }
            } catch (e) {}

            setIsFriend(amIFriend);

            setProfile({
                ...userData,
                achievements,
                activity: activity.reverse().slice(0, 3),
                stats: {
                    games: activity.length,
                    friends: friendsCount,
                    achievements: achievements.length,
                    hours: 0 
                }
            });

        } catch (error) {
            console.error("Error loading profile", error);
        } finally {
            setLoading(false);
        }
    };

    if (profileId) loadPublicProfile();
  }, [profileId, router]);

  const handleSendRequest = async () => {
      if (!currentUser) return;
      try {
          await fetch(`http://localhost:8001/api/friends/request`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sender_id: currentUser.id, target_username: profile.username })
          });
          alert("Friend request sent!");
      } catch (e) { alert("Error sending request"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center text-white bg-[#131119]">Loading Public Profile...</div>;
  if (!profile) return null;

  const rank = getCurrentRank(profile.level);

  return (
    <div className="min-h-screen flex flex-col bg-[#131119]" style={{ colorScheme: 'dark' }}>
      <Header user={currentUser || { name: 'Guest', avatarUrl: '' }} />
      
      <main className="flex-1 px-6 md:px-10 max-w-[1920px] mx-auto w-full relative flex flex-col animate-fade-up">
        <div className="flex flex-col md:flex-row gap-8 flex-1 items-stretch">
          
          <aside className="hidden md:block w-[260px] shrink-0 relative">
             <div className="sticky top-[74px] pt-10 pb-10 h-[calc(100vh-74px)] overflow-y-auto no-scrollbar"><VerticalMenu activeItem="" /></div>
          </aside>

          <div className="flex-1 w-full min-w-0 space-y-8 flex flex-col pt-6 md:pt-10 pb-10">
            
            {/* HEADER PERFIL */}
            <div className="relative w-full rounded-3xl overflow-hidden border border-white/5 shadow-2xl bg-[#1A1A20]">
                <div className="h-48 md:h-64 w-full relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A20] via-[#1A1A20]/40 to-transparent z-10" />
                    <Image src={profile.cover_url || "https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1245620/library_hero.jpg"} alt="Cover" fill className="object-cover opacity-60" unoptimized />
                </div>
                
                <div className="relative z-20 px-6 md:px-8 -mt-16 md:-mt-20 flex flex-col md:flex-row items-center md:items-end gap-6 mb-8">
                    <div className="w-28 h-28 md:w-40 md:h-40 rounded-full p-1 bg-gradient-to-tr from-blue-500 to-purple-500 shadow-xl shrink-0">
                        <div className="w-full h-full rounded-full bg-neutral-900 flex items-center justify-center overflow-hidden relative">
                            {profile.avatar_url ? <Image src={profile.avatar_url} alt="Avatar" fill className="object-cover" /> : <Users size={64} className="text-gray-600" />}
                        </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-col md:items-start items-center">
                            <h2 className="text-3xl md:text-4xl font-black text-white capitalize">{profile.username}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#00FF62]/20 text-[#00FF62] border border-[#00FF62]/30">LVL {profile.level}</span>
                                <span className="text-gray-400 text-sm">@{profile.username.toLowerCase()}</span>
                            </div>
                        </div>
                        <p className="text-gray-300 mt-3 max-w-2xl text-sm leading-relaxed">{profile.bio || "No biography provided."}</p>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4 text-xs font-bold text-gray-500 uppercase tracking-wide">
                            <div className="flex items-center gap-1.5"><MapPin size={14} /> {profile.location || "Unknown"}</div>
                            <div className="flex items-center gap-1.5"><Calendar size={14} /> Joined 2026</div>
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    {currentUser && currentUser.id !== profile.id && (
                        <div className="mb-4 md:mb-2">
                             {isFriend ? (
                                 <button className="flex items-center gap-2 px-5 py-2.5 bg-[#1A1A20] border border-[#00FF62] text-[#00FF62] font-bold rounded-xl cursor-default shadow-lg">
                                    <UserCheck size={18} /> Friend
                                 </button>
                             ) : (
                                 <button onClick={handleSendRequest} className="flex items-center gap-2 px-5 py-2.5 bg-[#00FF62] text-black font-bold rounded-xl hover:opacity-90 transition-colors shadow-lg">
                                    <UserPlus size={18} /> Add Friend
                                 </button>
                             )}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/5 bg-black/20 backdrop-blur-sm">
                    {[{ label: 'Games', value: profile.stats.games, icon: Gamepad2, color: PALETTE.VIOLETA },
                      { label: 'Hours', value: formatNumber(profile.stats.hours), icon: Clock, color: PALETTE.CEL_AZUL }, 
                      { label: 'Achievs', value: profile.stats.achievements, icon: Trophy, color: PALETTE.AMARILLO }, 
                      { label: 'Friends', value: profile.stats.friends, icon: Users, color: PALETTE.VERDE }].map((stat, i) => (
                      <div key={i} className="p-4 md:p-6 flex flex-col items-center justify-center gap-1 border-r border-white/5 last:border-r-0 border-b md:border-b-0 hover:bg-white/5">
                        <stat.icon size={18} className="mb-1 opacity-80" style={{ color: stat.color }} />
                        <span className="text-2xl font-black text-white">{stat.value}</span>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</span>
                      </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-stretch flex-1">
                <div className="xl:col-span-2 space-y-8">
                    
                    {/* ACTIVIDAD */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 px-1"><Activity size={20} style={{ color: PALETTE.CEL_AZUL }} /> Recent Activity</h3>
                        <div className="space-y-3">
                            {profile.activity.length > 0 ? profile.activity.map((game: any) => {
                                const statusStyle = STATUS_CONFIG[game.status] || STATUS_CONFIG['owned'];
                                const StatusIcon = statusStyle.icon;
                                return (
                                <div key={game.id} className="flex items-center gap-5 p-5 rounded-2xl bg-[#1A1A20] border border-white/5">
                                    <div className="relative w-24 h-16 rounded-xl overflow-hidden shrink-0 shadow-md">
                                        <Image src={game.cover_url} alt={game.game_name} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-white text-lg">{game.game_name}</h4>
                                        <p className="text-xs text-gray-500 mt-1 uppercase">Updated Recently</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border" style={{ backgroundColor: statusStyle.bg, borderColor: `${statusStyle.color}30` }}>
                                        <StatusIcon size={12} style={{ color: statusStyle.color }} />
                                        <span className="text-[10px] font-bold uppercase" style={{ color: statusStyle.color }}>{statusStyle.label}</span>
                                    </div>
                                </div>
                            )}) : <div className="text-center py-10 text-gray-500 bg-[#1A1A20] rounded-2xl border border-white/5 border-dashed">No public activity.</div>}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                     {/* LOGROS */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2 px-1"><Trophy size={20} style={{ color: PALETTE.AMARILLO }} /> Achievements</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {profile.achievements.length > 0 ? profile.achievements.slice(0, 4).map((ach: any) => (
                                <div key={ach.id} className="bg-[#1A1A20] p-3 rounded-2xl border border-white/5 flex flex-col items-center text-center gap-2">
                                    <div className="p-2.5 rounded-full" style={{ backgroundColor: `${ach.color}1A`, color: ach.color }}><ach.icon size={20} /></div>
                                    <div>
                                        <p className="font-bold text-white text-sm line-clamp-1">{ach.title}</p>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{ach.game}</p>
                                    </div>
                                </div>
                            )) : <div className="col-span-2 text-center py-8 text-gray-500 text-sm">No achievements yet.</div>}
                        </div>
                    </div>

                    {/* RANGO MEJORADO */}
                    <div 
                        className="p-5 rounded-2xl border flex items-center gap-4 relative overflow-hidden shrink-0 transition-all duration-500"
                        style={{ 
                            background: `linear-gradient(135deg, ${rank.color}1A, ${rank.color}0D)`, 
                            borderColor: `${rank.color}4D`, 
                            boxShadow: `0 0 20px -5px ${rank.color}1A` 
                        }}
                    >
                        <style>{`@keyframes shimmer { 0% { transform: translateX(-150%) skewX(-15deg); } 100% { transform: translateX(150%) skewX(-15deg); } }`}</style>
                        <div 
                            className="absolute inset-0 w-full h-full z-0 pointer-events-none" 
                            style={{ 
                                background: `linear-gradient(90deg, transparent, ${rank.color}4D, transparent)`, 
                                animation: 'shimmer 3s infinite linear' 
                            }} 
                        />
                        <div className="absolute inset-0 blur-xl opacity-20" style={{ backgroundColor: rank.color }}></div>
                        <div className="p-3 rounded-full relative z-10" style={{ backgroundColor: `${rank.color}33`, color: rank.color }}>
                            <rank.icon size={28} />
                        </div>
                        <div className="relative z-10">
                            <p className="text-base font-bold transition-colors duration-300" style={{ color: rank.color }}>{rank.title}</p>
                            <p className="text-xs mt-0.5 opacity-80" style={{ color: rank.color }}>Current Rank</p>
                        </div>
                    </div>

                </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}