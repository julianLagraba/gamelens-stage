'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Tipos permitidos
type Language = 'EN' | 'ES';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
}

// Creamos el contexto
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Proveedor del contexto (este envolverá a toda tu app en el layout)
export function LanguageProvider({ children }: { children: ReactNode }) {
  // Estado inicial: Inglés ('EN')
  const [language, setLanguage] = useState<Language>('EN');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'EN' ? 'ES' : 'EN'));
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Hook personalizado para usar el idioma en cualquier componente
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  return context;
}