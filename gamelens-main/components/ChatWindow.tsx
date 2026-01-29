'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Smile } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: number;
  sender_id: number;
  content: string;
  timestamp: string;
}

interface ChatWindowProps {
  friend: { id: number; name: string; avatarUrl: string; isOnline: boolean };
  currentUserId: number;
  onClose: () => void;
}

export const ChatWindow = ({ friend, currentUserId, onClose }: ChatWindowProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Cargar mensajes y hacer Polling (actualización automática)
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        // Nota: Pasamos el ID del usuario actual como query param
        const res = await fetch(`http://localhost:8001/api/chat/${friend.id}?current_user_id=${currentUserId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching chat:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    
    // Actualizar cada 2 segundos para ver si el amigo respondió
    const interval = setInterval(fetchMessages, 2000); 

    return () => clearInterval(interval);
  }, [friend.id, currentUserId]);

  // 2. Auto-scroll al fondo cuando llega un mensaje nuevo
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Enviar mensaje
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;

    // Optimismo: Agregarlo visualmente antes de confirmar (para que se sienta rápido)
    const tempMsg = { id: Date.now(), sender_id: currentUserId, content: newMessage, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setNewMessage("");

    try {
      await fetch(`http://localhost:8001/api/chat/send?sender_id=${currentUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: friend.id,
          content: tempMsg.content
        })
      });
      // No necesitamos hacer nada si sale bien, el Polling traerá el mensaje real pronto
    } catch (error) {
      console.error("Error sending message");
      // Aquí podrías mostrar un error visual si falla
    }
  };

  return (
    <div className="fixed bottom-0 right-20 z-50 w-80 md:w-96 bg-[#131119] border border-white/10 rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-up h-[500px]">
      
      {/* HEADER */}
      <div className="bg-[#1A1A20] p-4 flex items-center justify-between border-b border-white/5 cursor-pointer" onClick={onClose}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-neutral-800 overflow-hidden relative border border-white/10">
              {friend.avatarUrl && <Image src={friend.avatarUrl} alt={friend.name} fill className="object-cover" />}
            </div>
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#1A1A20] ${friend.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
          </div>
          <div>
            <h4 className="font-bold text-white text-sm">{friend.name}</h4>
            <p className="text-xs text-green-400">{friend.isOnline ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* MENSAJES */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d0b10] scrollbar-thin scrollbar-thumb-white/10">
        {loading ? (
            <div className="text-center text-xs text-gray-500 mt-10">Loading history...</div>
        ) : messages.length === 0 ? (
            <div className="text-center text-xs text-gray-600 mt-20 flex flex-col items-center">
                <Smile size={32} className="mb-2 opacity-20"/>
                <p>Say hi to {friend.name}!</p>
            </div>
        ) : (
            messages.map((msg) => {
              const isMe = msg.sender_id === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : 'bg-[#1A1A20] text-gray-200 border border-white/5 rounded-bl-none'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <form onSubmit={handleSendMessage} className="p-3 bg-[#1A1A20] border-t border-white/5 flex gap-2">
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..." 
          className="flex-1 bg-[#131119] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button 
          type="submit" 
          disabled={!newMessage.trim()}
          className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};