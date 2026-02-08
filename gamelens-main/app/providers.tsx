'use client';

import React from 'react';
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { CollectionProvider } from "./context/CollectionContext";
import { AchievementProvider } from "./context/AchievementContext";
import { LanguageProvider } from "./context/LanguageContext";
import { NotificationProvider } from "./context/NotificationContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <FavoritesProvider>
          <CollectionProvider>
            <AchievementProvider>
              <NotificationProvider>
                {children}
              </NotificationProvider>
            </AchievementProvider>
          </CollectionProvider>
        </FavoritesProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}