'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation'; // IMPORTANTE
import { X, Search, UserPlus, MessageCircle, MoreHorizontal, ExternalLink, BellOff, UserMinus, Check } from 'lucide-react';
import Image from 'next/image';

const COLORS = {
  ROSA: '#FD1372',
  VERDE: '#00FF62',
  BG_DARK: '#131119', 
  BG_CARD: '#1A1A20',
};

interface FriendsModalProps {
  userId: number;
  onClose: () => void;
  onOpenChat: (friend: any) => void;
}

export const FriendsModal = ({ userId, onClose, onOpenChat }: FriendsModalProps) => {
  const router = useRouter(); // Hook de navegación
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'find'>('friends');
  
  const [friends, setFriends] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      const [resFriends, resReq] = await Promise.all([
        fetch(`http://localhost:8001/api/friends/${userId}`),
        fetch(`http://localhost:8001/api/friends/requests/${userId}`)
      ]);
      if (resFriends.ok) setFriends(await resFriends.json());
      if (resReq.ok) setRequests(await resReq.json());
    } catch (e) { console.error(e); }
  };

  useEffect(() => { loadData(); }, [userId]);

  useEffect(() => {
    const handleClickOutside = () => setActiveMenuId(null);
    if (activeMenuId) window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [activeMenuId]);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:8001/api/users/search/query?q=${searchQuery}&current_user_id=${userId}`);
          if (res.ok) setSearchResults(await res.json());
        } catch(e) { console.error(e); }
        finally { setLoading(false); }
      } else setSearchResults([]);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchQuery, userId]);

  const sendRequest = async (username: string) => {
    try {
      await fetch(`http://localhost:8001/api/friends/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: userId, target_username: username })
      });
      alert("Solicitud enviada");
    } catch (e) { console.error(e); }
  };

  const handleRequest = async (reqId: number, action: 'accept' | 'reject') => {
    try {
      await fetch(`http://localhost:8001/api/friends/request/${reqId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      loadData(); 
    } catch (e) { console.error(e); }
  };

  const handleRemoveFriend = async (friendId: number) => {
      // Optimismo UI
      setFriends(prev => prev.filter(f => f.id !== friendId));
      setActiveMenuId(null);
      
      // Llamada real al backend
      try {
        await fetch(`http://localhost:8001/api/friends/${userId}/${friendId}`, {
            method: 'DELETE'
        });
      } catch (error) { console.error(error); }
  };

  const handleViewProfile = (friendId: number) => {
      onClose(); // Cerramos el modal
      router.push(`/profile/${friendId}`); // Navegamos
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-[#131119] rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-modal-pop" style={{ maxHeight: '85vh' }}>
        
        {/* HEADER */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-[#131119]">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-[#00FF62]/10 text-[#00FF62]">
               <UserPlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Friends List</h2>
              <p className="text-sm text-gray-500 font-medium">{friends.length} friends total</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* TABS */}
        <div className="px-6 pt-4 flex gap-6 border-b border-white/5 bg-[#131119]">
          <button onClick={() => setActiveTab('friends')} className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'friends' ? 'text-white border-[#00FF62]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>My Friends</button>
          <button onClick={() => setActiveTab('requests')} className={`pb-3 text-sm font-bold transition-all border-b-2 flex items-center gap-2 ${activeTab === 'requests' ? 'text-white border-[#00FF62]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Requests {requests.length > 0 && <span className="bg-[#FD1372] text-white text-[10px] px-1.5 rounded-full">{requests.length}</span>}</button>
          <button onClick={() => setActiveTab('find')} className={`pb-3 text-sm font-bold transition-all border-b-2 ${activeTab === 'find' ? 'text-white border-[#00FF62]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}>Add Friend</button>
        </div>

        {/* BUSCADOR */}
        {(activeTab === 'friends' || activeTab === 'find') && (
            <div className="px-6 py-4 bg-[#131119]">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
                    <input type="text" placeholder={activeTab === 'find' ? "Search users by ID..." : "Filter friends..."} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1A1A20] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF62]/30 transition-all" />
                </div>
            </div>
        )}

        {/* CONTENIDO */}
        <div className="flex-1 overflow-y-auto p-6 space-y-2 bg-[#131119] min-h-[300px]">
          
          {/* TAB 1: AMIGOS */}
          {activeTab === 'friends' && (
            <>
              {friends.length === 0 ? <div className="flex flex-col items-center justify-center h-40 text-gray-600"><p>No friends yet.</p></div> : 
                friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(f => (
                <div key={f.id} className="group flex items-center justify-between p-3 hover:bg-[#1A1A20] rounded-2xl transition-colors border border-transparent hover:border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-neutral-800 overflow-hidden border border-white/5">
                            <Image src={f.avatarUrl} alt={f.name} width={48} height={48} className="object-cover" />
                        </div>
                        {f.isOnline && <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00FF62] border-2 border-[#131119] rounded-full"></div>}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                          <h4 className="text-white font-bold text-sm">{f.name}</h4>
                          <span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded border border-white/5">Lvl {f.level}</span>
                      </div>
                      <p className={`text-xs font-medium mt-0.5 ${f.isOnline ? 'text-[#00FF62]' : 'text-gray-600'}`}>{f.isOnline ? 'Online' : 'Offline'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { onClose(); onOpenChat(f); }} className="w-10 h-10 rounded-full bg-[#1A1A20] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Chat">
                        <MessageCircle size={18} />
                    </button>
                    
                    {/* BOTÓN DE MENÚ */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === f.id ? null : f.id);
                            }}
                            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors ${activeMenuId === f.id ? 'bg-white text-black border-white' : 'bg-[#1A1A20] border-white/5 text-gray-400 hover:text-white hover:bg-white/10'}`}
                        >
                            <MoreHorizontal size={18} />
                        </button>
                        
                        {/* MENÚ DESPLEGABLE */}
                        {activeMenuId === f.id && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A20] border border-white/10 rounded-xl shadow-2xl z-50 p-1.5 animate-in fade-in zoom-in-95 duration-100">
                                <button onClick={(e) => { e.stopPropagation(); handleViewProfile(f.id); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left">
                                    <ExternalLink size={14} /> View Profile
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); alert("Muted"); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left">
                                    <BellOff size={14} /> Mute Notifications
                                </button>
                                <div className="h-px bg-white/5 my-1" />
                                <button onClick={(e) => { e.stopPropagation(); handleRemoveFriend(f.id); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-[#FD1372] hover:bg-[#FD1372]/10 transition-colors text-left">
                                    <UserMinus size={14} /> Remove Friend
                                </button>
                            </div>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* TAB 2 y 3 (Se mantienen igual) */}
          {activeTab === 'requests' && (
            <div className="space-y-2">
               {requests.length === 0 ? <p className="text-gray-600 text-center mt-10 text-sm">No pending requests.</p> : 
               requests.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-[#1A1A20] rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden relative"><Image src={r.avatarUrl} alt={r.name} fill className="object-cover" /></div>
                    <div><p className="text-white font-bold text-sm">{r.name}</p><p className="text-xs text-gray-500">Wants to be friends</p></div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRequest(r.id, 'accept')} className="p-2 bg-[#00FF62] text-black rounded-xl hover:opacity-90 transition-opacity"><Check size={18} /></button>
                    <button onClick={() => handleRequest(r.id, 'reject')} className="p-2 bg-white/5 text-gray-400 rounded-xl hover:bg-[#FD1372]/20 hover:text-[#FD1372] transition-colors"><X size={18} /></button>
                  </div>
                </div>
               ))}
            </div>
          )}

          {activeTab === 'find' && (
            <div className="space-y-2">
                {loading && <p className="text-center text-gray-600 text-xs py-4">Searching...</p>}
                {!loading && searchResults.length === 0 && searchQuery.length >= 2 && <p className="text-center text-gray-600 text-xs py-4">No users found.</p>}
                {searchResults.map(user => (
                  <div key={user.id} className="flex items-center justify-between p-3 hover:bg-[#1A1A20] rounded-2xl border border-transparent hover:border-white/5 transition-colors">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden relative border border-white/5"><Image src={user.avatar_url} alt={user.username} fill className="object-cover" /></div>
                        <div><p className="text-white font-bold text-sm">{user.username}</p><span className="text-[10px] bg-white/10 text-gray-400 px-1.5 py-0.5 rounded">Lvl {user.level}</span></div>
                     </div>
                     <button onClick={() => sendRequest(user.username)} className="px-4 py-2 bg-[#00FF62]/10 text-[#00FF62] text-xs font-bold rounded-xl hover:bg-[#00FF62] hover:text-black transition-all flex items-center gap-2"><UserPlus size={16} /> Add</button>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/5 bg-[#131119] flex justify-end">
            <button onClick={onClose} className="px-6 py-2.5 bg-white text-black font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors shadow-lg">Close</button>
        </div>
      </div>
    </div>
  );
};