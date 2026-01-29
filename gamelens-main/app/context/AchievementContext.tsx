'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';

// --- COMPONENTE VISUAL (EL TOAST) ---
const AchievementToast = ({ achievement, onClose }: { achievement: any, onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); 
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed bottom-10 right-10 z-[9999] animate-fade-up">
      <div className="bg-[#1A1A20] border border-[#efb537]/50 rounded-2xl p-4 shadow-2xl flex items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#efb537]/10 animate-pulse" />
        <div className="w-12 h-12 rounded-full bg-[#efb537]/20 flex items-center justify-center relative z-10 text-[#efb537]">
          <Trophy size={24} />
        </div>
        <div className="relative z-10 pr-4">
          <h4 className="text-[#efb537] font-black text-sm uppercase tracking-wide">Achievement Unlocked!</h4>
          <p className="text-white font-bold">{achievement.title}</p>
        </div>
        <button onClick={onClose} className="relative z-10 text-gray-500 hover:text-white"><X size={16} /></button>
      </div>
    </div>
  );
};

// --- CONTEXTO Y LÓGICA ---
const AchievementContext = createContext<any>(null);

export const AchievementProvider = ({ children }: { children: React.ReactNode }) => {
  const [newUnlock, setNewUnlock] = useState<any | null>(null);

  useEffect(() => {
    const checkAchievements = async () => {
      const session = localStorage.getItem('user_session');
      if (!session) return;
      
      const user = JSON.parse(session);
      if (!user?.id) return;

      try {
        const res = await fetch(`http://localhost:8001/api/users/${user.id}/achievements`);
        if (res.ok) {
          const data = await res.json();
          
          const currentCount = data.length;
          // Si no existe en localStorage, asumimos que es la primera carga y usamos el valor actual para no disparar alertas viejas
          const savedCount = localStorage.getItem('ach_count');
          const prevCount = savedCount ? parseInt(savedCount) : currentCount;

          // LOG DEBUG (Míralo en F12 -> Console)
          // console.log(`🔍 Polling Logros: Backend=${currentCount} | Local=${prevCount}`);

          if (currentCount > prevCount) {
            console.log("🚀 ¡NUEVO LOGRO DETECTADO!");
            
            // Obtenemos el último de la lista
            const latest = data[data.length - 1];
            
            // Preparamos datos visuales (Manejando si viene anidado o plano)
            const toastData = {
                title: latest.achievement ? latest.achievement.title : latest.title,
            };
            
            setNewUnlock(toastData);
            
            // Actualizamos el contador para que no salga de nuevo
            localStorage.setItem('ach_count', currentCount.toString());
          } 
          else if (currentCount !== prevCount) {
             // Sincronización silenciosa (si borraste la DB o cambiaste de usuario)
             localStorage.setItem('ach_count', currentCount.toString());
          }
        }
      } catch (error) {
        // console.error("Error polling achievements");
      }
    };

    // Revisar inmediatamente al montar
    checkAchievements();

    // Revisar cada 2 segundos
    const interval = setInterval(checkAchievements, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AchievementContext.Provider value={{}}>
      {children}
      {newUnlock && <AchievementToast achievement={newUnlock} onClose={() => setNewUnlock(null)} />}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => useContext(AchievementContext);