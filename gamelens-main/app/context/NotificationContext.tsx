'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Notifications {
  requests: number;
  messages: number;
  total: number;
  unread_senders: number[]; // <--- NUEVO CAMPO
}

interface NotificationContextType {
  notifications: Notifications;
  refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  // Inicializamos con array vacío
  const [notifications, setNotifications] = useState<Notifications>({ 
      requests: 0, 
      messages: 0, 
      total: 0, 
      unread_senders: [] 
  });
  const [userId, setUserId] = useState<number | null>(null);

  const fetchNotis = async (id: number) => {
    try {
      // PUERTO 8001
      const res = await fetch(`http://localhost:8001/api/users/${id}/notifications`);
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (e) { 
        // Error silencioso
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('user_session');
    if (stored) {
        try {
            const user = JSON.parse(stored);
            setUserId(user.id);
            fetchNotis(user.id);
        } catch (e) {}
    }

    const interval = setInterval(() => {
        if (userId) fetchNotis(userId);
    }, 3000); // Polling cada 3s para que sea rápido

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <NotificationContext.Provider value={{ notifications, refreshNotifications: () => userId && fetchNotis(userId) }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
};