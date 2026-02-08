'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Users, MessageSquare, UserPlus, MoreHorizontal, ExternalLink, BellOff, UserMinus } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; 
import { FriendsModal } from './FriendsModal';
import { ChatWindow } from './ChatWindow';
import { useNotifications } from '@/app/context/NotificationContext'; // Importar hook

export const FriendsWidget = ({ userId, currentUserId }: { userId: number, currentUserId: number }) => {
  const router = useRouter();
  const { notifications } = useNotifications(); // Usamos las notificaciones
  
  const [friends, setFriends] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [activeChatFriend, setActiveChatFriend] = useState<any | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFriends = async () => {
        try {
            const res = await fetch(`http://localhost:8001/api/friends/${userId}`);
            if (res.ok) setFriends(await res.json());
        } catch (e) { console.error(e); }
    };
    loadFriends();
  }, [userId]);

  // Click outside menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- LOGICA DE NOTIFICACIONES ---
  // Función helper para saber si un amigo específico tiene mensajes sin leer
  const hasUnreadMessages = (friendId: number) => {
      return notifications.unread_senders?.includes(friendId);
  };

  const handleRemoveFriend = async (friendId: number) => {
    setFriends(prev => prev.filter(f => f.id !== friendId));
    setActiveMenuId(null);
    try {
        await fetch(`http://localhost:8001/api/friends/${currentUserId}/${friendId}`, { method: 'DELETE' });
    } catch (error) { console.error(error); }
  };

  const handleViewProfile = (friendId: number) => {
      router.push(`/profile/${friendId}`); 
      setActiveMenuId(null);
  };

  return (
    <>
      <div className="bg-[#131119] border border-white/5 rounded-3xl p-6 h-full flex flex-col" onClick={() => setActiveMenuId(null)}>
        
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div className="flex items-center gap-3">
            <Users color="#00FF62" size={22} />
            <h3 className="text-white font-bold text-lg">Friends</h3>
            <span className="text-gray-500 text-sm font-medium">({friends.length})</span>
          </div>
          
          {/* BOTÓN ADD FRIEND CON NOTIFICACIÓN DE SOLICITUDES */}
          <button 
            onClick={(e) => { e.stopPropagation(); setShowModal(true); }} 
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors relative"
          >
            <UserPlus size={18} />
            {notifications.requests > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FD1372] rounded-full flex items-center justify-center border-2 border-[#131119] animate-bounce">
                    <span className="text-[9px] font-bold text-white">{notifications.requests}</span>
                </div>
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-white/10 min-h-0">
          {friends.length === 0 ? (
            <div className="text-center text-gray-600 py-10 flex flex-col items-center h-full justify-center">
                <Users size={32} className="opacity-20 mb-2"/>
                <p className="text-sm">No friends yet.</p>
                <button onClick={() => setShowModal(true)} className="mt-4 text-[#00FF62] text-sm font-bold hover:underline">Find people</button>
            </div>
          ) : (
            friends.slice(0, 5).map((friend) => (
              <div key={friend.id} className="relative flex items-center justify-between group p-2.5 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                
                {/* Info Amigo */}
                <div className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer" onClick={() => setActiveChatFriend(friend)}>
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden border border-white/5">
                        <Image src={friend.avatarUrl} alt={friend.name} fill className="object-cover" />
                    </div>
                    <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#131119] ${friend.isOnline ? 'bg-[#00FF62]' : 'bg-gray-600'}`} />
                  </div>
                  <div className="truncate">
                    <p className="text-white font-bold text-sm truncate">{friend.name}</p>
                    <p className={`text-xs font-medium truncate ${friend.isOnline ? 'text-[#00FF62]' : 'text-gray-600'}`}>{friend.isOnline ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
                
                {/* Acciones */}
                <div className="flex items-center gap-1 shrink-0">
                    {/* BOTÓN CHAT CON NOTIFICACIÓN DE MENSAJE */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); setActiveChatFriend(friend); }}
                        className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all relative ${
                            hasUnreadMessages(friend.id) 
                            ? 'bg-[#FD1372] text-white border-[#FD1372]' // Si hay mensaje: ROSA
                            : 'bg-[#1A1A20] border-white/5 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/10' // Si no: Gris y oculto
                        }`}
                        title="Chat"
                    >
                        <MessageSquare size={14} />
                    </button>

                    {/* Menú 3 puntos */}
                    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === friend.id ? null : friend.id);
                            }}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${activeMenuId === friend.id ? 'bg-white text-black border-white' : 'bg-[#1A1A20] border-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                            <MoreHorizontal size={14} />
                        </button>

                        {activeMenuId === friend.id && (
                            <div ref={menuRef} className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A20] border border-white/10 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                <button onClick={(e) => { e.stopPropagation(); handleViewProfile(friend.id); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left"><ExternalLink size={14} /> View Profile</button>
                                <button onClick={(e) => { e.stopPropagation(); alert("Notifications muted"); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left"><BellOff size={14} /> Mute Notifications</button>
                                <div className="h-px bg-white/5 my-1" />
                                <button onClick={(e) => { e.stopPropagation(); handleRemoveFriend(friend.id); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-[#FD1372] hover:bg-[#FD1372]/10 transition-colors text-left"><UserMinus size={14} /> Remove Friend</button>
                            </div>
                        )}
                    </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-6 shrink-0">
            <button onClick={(e) => { e.stopPropagation(); setShowModal(true); }} className="w-full py-3 rounded-xl border border-white/10 text-white text-sm font-bold hover:bg-white/5 transition-all">View All Friends</button>
        </div>
      </div>

      {showModal && <FriendsModal userId={userId} onClose={() => setShowModal(false)} onOpenChat={(friend) => { setShowModal(false); setActiveChatFriend(friend); }} />}
      {activeChatFriend && <ChatWindow friend={activeChatFriend} currentUserId={currentUserId} onClose={() => setActiveChatFriend(null)} />}
    </>
  );
};