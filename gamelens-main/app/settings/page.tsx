'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  User, Bell, Shield, 
  Gamepad2, Globe, Mail, Lock, LogOut, 
  AlertTriangle, Save, Smartphone, Eye
} from 'lucide-react';
import { VerticalMenu } from '@/components/VerticalMenu';
import { Header } from '@/components/Header';
// 1. IMPORTAR CONTEXTO
import { useLanguage } from '@/app/context/LanguageContext';

// --- PALETA GAMELENS ---
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

// --- TIPOS LOCALES ---
interface UserData {
  id?: number;
  name: string;
  avatarUrl: string;
  favoritePlatform: string;
}

// --- ESTILOS CSS PUROS PARA ICONOS (Solo para Discord) ---
const iconStyle = {
  width: '24px',
  height: '24px',
  fill: 'currentColor',
  display: 'block'
};

// --- ICONOS INLINE (Solo Discord) ---
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" style={iconStyle} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

// --- COMPONENTE: TOGGLE SWITCH ---
const ToggleSwitch = ({ checked, onChange, color = PALETTE.VERDE }: { checked: boolean; onChange: () => void; color?: string }) => (
  <button 
    onClick={onChange}
    className={`w-12 h-6 rounded-full relative transition-all duration-300 focus:outline-none hover:opacity-90 active:scale-95 shrink-0 ${checked ? '' : 'bg-white/10 hover:bg-white/20'}`}
    style={{ backgroundColor: checked ? color : undefined }}
  >
    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-md ${checked ? 'left-7' : 'left-1'}`} />
  </button>
);

// Definición de tipos para las conexiones
type Connection = {
  id: string;
  name: string;
  connected: boolean;
  user: string;
  color: string;
  image?: string;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'account' | 'connections' | 'privacy' | 'notifications'>('account');

  // --- ESTADOS DEL FORMULARIO ---
  const [formData, setFormData] = useState({
    displayName: "Valentín", 
    username: "valentin_dev", 
    email: "valentin_dev@gamelens.com",
    bio: "Amante de los RPGs de mundo abierto y los shooters competitivos.",
    language: "es-la", 
    twoFactor: true,
    publicProfile: true,
    showActivity: true,
    allowFriendRequests: true,
    emailNotifs: true,
    pushNotifs: false,
    marketingEmails: false
  });

  // 2. HOOK DE IDIOMA
  const { language } = useLanguage();

  // 3. DICCIONARIO
  const translations = {
    en: {
        loading: 'Loading settings...',
        title: 'Settings',
        subtitle: 'Manage your account, connections, and GameLens preferences.',
        save: 'Save Changes',
        // Tabs
        tabs: {
            account: 'Account',
            connections: 'Connections',
            privacy: 'Privacy',
            notifications: 'Notifications'
        },
        // Account Section
        accountInfo: 'Account Information',
        displayName: 'Display Name',
        displayNameDesc: 'This is the name your friends will see.',
        username: 'Username (ID)',
        usernameDesc: 'Unique identifier. Used for mentions and URLs.',
        email: 'Email',
        langLabel: 'Language',
        // Security Section
        security: 'Security',
        // CORRECCIÓN AQUÍ: Renombrado de 2fa a twoFA para evitar error de sintaxis
        twoFA: 'Two-Factor Authentication (2FA)',
        twoFADesc: 'Add an extra layer of security.',
        password: 'Password',
        lastChanged: 'Last changed 3 months ago',
        changeBtn: 'Change',
        dangerZone: 'Danger Zone',
        dangerDesc: 'These actions are irreversible. Be careful.',
        deleteAccount: 'Delete Account',
        logoutAll: 'Log Out Everywhere',
        // Connections Section
        connectedPlat: 'Connected Platforms',
        connectedDesc: 'Sync your games, achievements, and activity by connecting your accounts.',
        connectedAs: 'Connected as',
        notConnected: 'Not connected',
        disconnect: 'Disconnect',
        connect: 'Connect',
        // Privacy Section
        privacyVis: 'Privacy & Visibility',
        publicProfile: 'Public Profile',
        publicDesc: 'Anyone can see your profile and stats.',
        showActivity: 'Show Game Activity',
        showActivityDesc: 'Shows what you are playing in real-time.',
        friendReq: 'Allow Friend Requests',
        friendReqDesc: 'Users can send you invitations.',
        // Notifications Section
        notifPref: 'Notification Preferences',
        emails: 'Emails',
        emailsDesc: 'Weekly digest, security, and support.',
        push: 'Push Notifications',
        pushDesc: 'Real-time alerts on your device.',
        news: 'News & Offers',
        newsDesc: 'News about games on your wishlist.'
    },
    es: {
        loading: 'Cargando configuración...',
        title: 'Configuración',
        subtitle: 'Administra tu cuenta, conexiones y preferencias de GameLens.',
        save: 'Guardar Cambios',
        // Tabs
        tabs: {
            account: 'Cuenta',
            connections: 'Conexiones',
            privacy: 'Privacidad',
            notifications: 'Notificaciones'
        },
        // Account Section
        accountInfo: 'Información de la Cuenta',
        displayName: 'Nombre Visible',
        displayNameDesc: 'Este es el nombre que verán tus amigos.',
        username: 'Nombre de Usuario (ID)',
        usernameDesc: 'Identificador único. Se usa para menciones y URLs.',
        email: 'Correo Electrónico',
        langLabel: 'Idioma',
        // Security Section
        security: 'Seguridad',
        // CORRECCIÓN AQUÍ: Renombrado de 2fa a twoFA
        twoFA: 'Autenticación de dos pasos (2FA)',
        twoFADesc: 'Añade una capa extra de seguridad.',
        password: 'Contraseña',
        lastChanged: 'Último cambio hace 3 meses',
        changeBtn: 'Cambiar',
        dangerZone: 'Zona de Peligro',
        dangerDesc: 'Estas acciones son irreversibles. Ten cuidado.',
        deleteAccount: 'Eliminar Cuenta',
        logoutAll: 'Cerrar Sesión en todos lados',
        // Connections Section
        connectedPlat: 'Plataformas Conectadas',
        connectedDesc: 'Sincroniza tus juegos, logros y actividad conectando tus cuentas.',
        connectedAs: 'Conectado como',
        notConnected: 'No conectado',
        disconnect: 'Desconectar',
        connect: 'Conectar',
        // Privacy Section
        privacyVis: 'Privacidad y Visibilidad',
        publicProfile: 'Perfil Público',
        publicDesc: 'Cualquier persona puede ver tu perfil y estadísticas.',
        showActivity: 'Mostrar Actividad de Juego',
        showActivityDesc: 'Muestra qué estás jugando en tiempo real.',
        friendReq: 'Permitir Solicitudes de Amistad',
        friendReqDesc: 'Los usuarios pueden enviarte invitaciones.',
        // Notifications Section
        notifPref: 'Preferencias de Notificaciones',
        emails: 'Correos Electrónicos',
        emailsDesc: 'Resumen semanal, seguridad y soporte.',
        push: 'Notificaciones Push',
        pushDesc: 'Alertas en tiempo real en tu dispositivo.',
        news: 'Novedades y Ofertas',
        newsDesc: 'Noticias sobre juegos en tu wishlist.'
    }
  };

  const t = translations[language.toLowerCase() as 'en' | 'es'];

  // --- ESTADOS DE CONEXIONES ---
  const [connections, setConnections] = useState<Connection[]>([
    { 
      id: 'steam', 
      name: 'Steam', 
      connected: true, 
      user: 'Valen_Dev', 
      color: '#171a21', 
      image: '/Steam.svg' 
    },
    { 
      id: 'epic', 
      name: 'Epic Games', 
      connected: true, 
      user: 'Valen_Dev', 
      color: '#2a2a2a', 
      image: '/Epic.svg' 
    },
    { 
      id: 'discord', 
      name: 'Discord', 
      connected: true, 
      user: 'Valentin#0001', 
      color: '#5865F2',
      icon: DiscordIcon 
    },
    { 
      id: 'psn', 
      name: 'PlayStation', 
      connected: false, 
      user: '', 
      color: '#003791',
      image: '/Play.svg' 
    },
    { 
      id: 'xbox', 
      name: 'Xbox Live', 
      connected: false, 
      user: '', 
      color: '#107C10', 
      image: '/Xbox.svg' 
    },
  ]);

  useEffect(() => {
    const mockUser = { name: 'Valentín', favoritePlatform: 'PC', avatarUrl: '' };
    const timer = setTimeout(() => {
        setUser(mockUser);
        setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleConnection = (id: string) => {
    setConnections(prev => prev.map(c => c.id === id ? { ...c, connected: !c.connected } : c));
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white bg-[#131119]">{t.loading}</div>;
  }

  const safeUser = user || { name: 'Guest', favoritePlatform: 'PC', avatarUrl: '' };

  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Sección Información Pública */}
            <div className="bg-[#1A1A20] border border-white/5 rounded-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <User size={20} className="text-blue-500" /> {t.accountInfo}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Nombre Visible */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{t.displayName}</label>
                  <input 
                    type="text" 
                    value={formData.displayName}
                    onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                    placeholder="Tu nombre público"
                    className="w-full bg-[#131119] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 hover:border-white/30 transition-all"
                  />
                  <p className="text-[11px] text-gray-500 ml-1">{t.displayNameDesc}</p>
                </div>

                {/* 2. Nombre de Usuario Único (@) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{t.username}</label>
                  <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold group-focus-within:text-blue-500 transition-colors">@</span>
                      <input 
                      type="text" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                      placeholder="usuario_unico"
                      className="w-full bg-[#131119] border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50 hover:border-white/30 transition-all font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 ml-1">{t.usernameDesc}</p>
                </div>

                {/* 3. Email */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{t.email}</label>
                  <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                      <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-[#131119] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500/50 hover:border-white/30 transition-all"
                    />
                  </div>
                </div>

                {/* 4. Idioma */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{t.langLabel}</label>
                  <select 
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className="w-full bg-[#131119] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 hover:border-white/30 transition-all appearance-none cursor-pointer"
                  >
                    <option value="es-la">Español (Latinoamérica)</option>
                    <option value="es-es">Español (España)</option>
                    <option value="en-us">English (US)</option>
                    <option value="en-uk">English (UK)</option>
                    <option value="pt-br">Português (Brasil)</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="it">Italiano</option>
                    <option value="ja">日本語 (Japonés)</option>
                    <option value="ko">한국어 (Coreano)</option>
                    <option value="zh">中文 (Chino)</option>
                    <option value="ru">Русский (Ruso)</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Sección Seguridad */}
            <div className="bg-[#1A1A20] border border-white/5 rounded-2xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Shield size={20} className="text-green-500" /> {t.security}
              </h3>
              <div className="space-y-6">
                {/* 2FA: Stack en móvil para evitar desborde */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-[#131119] border border-white/5 hover:border-green-500/30 hover:bg-[#1f1f25] transition-all duration-300 gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="p-2 rounded-lg bg-green-500/10 text-green-500 shrink-0">
                      <Lock size={20} />
                    </div>
                    <div>
                      {/* CORRECCIÓN: Uso de t.twoFA en lugar de t.2fa */}
                      <p className="font-bold text-white">{t.twoFA}</p>
                      <p className="text-sm text-gray-500">{t.twoFADesc}</p>
                    </div>
                  </div>
                  <div className="self-end sm:self-center">
                    <ToggleSwitch checked={formData.twoFactor} onChange={() => setFormData({...formData, twoFactor: !formData.twoFactor})} />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 pt-4 gap-4">
                  <div className="space-y-1">
                    <p className="font-bold text-white">{t.password}</p>
                    <p className="text-sm text-gray-500">{t.lastChanged}</p>
                  </div>
                  <button className="w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-lg border border-white/10 hover:border-white/30 transition-all">
                    {t.changeBtn}
                  </button>
                </div>
              </div>
            </div>

             {/* Zona de Peligro */}
             <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 md:p-8 hover:bg-red-500/10 transition-colors duration-300">
              <h3 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                <AlertTriangle size={20} /> {t.dangerZone}
              </h3>
              <p className="text-gray-400 text-sm mb-6">{t.dangerDesc}</p>
              <div className="flex flex-col sm:flex-row gap-4">
                  <button className="w-full sm:w-auto px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-sm rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all text-center">
                    {t.deleteAccount}
                  </button>
                  <button className="w-full sm:w-auto px-5 py-2.5 bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2">
                     <LogOut size={16} /> {t.logoutAll}
                  </button>
              </div>
            </div>
          </div>
        );

      case 'connections':
        return (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#1A1A20] border border-white/5 rounded-2xl p-6 md:p-8">
               <div className="mb-8">
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                      <Globe size={20} className="text-green-500" /> {t.connectedPlat}
                  </h3>
                  <p className="text-gray-400">{t.connectedDesc}</p>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  {connections.map((conn) => (
                    // Responsive: Flex-col en móvil para que el botón pase abajo
                    <div 
                      key={conn.id}
                      className={`relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all duration-300 gap-4 ${
                        conn.connected 
                        ? 'bg-[#131119] border-green-500/30 shadow-[0_0_15px_-5px_rgba(0,255,98,0.1)] hover:shadow-[0_0_20px_-5px_rgba(0,255,98,0.2)] hover:border-green-500/50' 
                        : 'bg-[#131119]/50 border-white/5 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                        <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
                            {/* CONTENEDOR DEL ICONO */}
                            <div 
                              className={`w-14 h-14 rounded-xl flex items-center justify-center relative overflow-hidden shrink-0 transition-colors ${conn.connected ? 'text-white' : 'text-gray-500'}`} 
                              style={{ backgroundColor: conn.connected ? conn.color : '#ffffff10' }}
                            >
                                {conn.image ? (
                                  <Image 
                                    src={conn.image} 
                                    alt={conn.name} 
                                    width={28} 
                                    height={28} 
                                    className="object-contain"
                                    unoptimized
                                  />
                                ) : (
                                  conn.icon && <conn.icon />
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="font-bold text-white text-lg truncate">{conn.name}</h4>
                                {conn.connected ? (
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
                                        <p className="text-sm text-gray-300 font-medium truncate">{t.connectedAs} <span className="text-white">{conn.user}</span></p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 mt-0.5">{t.notConnected}</p>
                                )}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => handleToggleConnection(conn.id)}
                            className={`w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                                conn.connected 
                                ? 'bg-white/5 text-gray-400 hover:text-white hover:bg-red-500/10 hover:text-red-500 border border-transparent hover:border-red-500/30' 
                                : 'bg-white text-black hover:bg-gray-200 shadow-lg hover:scale-105 active:scale-95'
                            }`}
                        >
                            {conn.connected ? t.disconnect : t.connect}
                        </button>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6 animate-fadeIn">
             <div className="bg-[#1A1A20] border border-white/5 rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Eye size={20} className="text-purple-500" /> {t.privacyVis}
                </h3>
                
                <div className="space-y-6">
                    {[
                        { label: t.publicProfile, desc: t.publicDesc, state: formData.publicProfile, key: 'publicProfile' },
                        { label: t.showActivity, desc: t.showActivityDesc, state: formData.showActivity, key: 'showActivity' },
                        { label: t.friendReq, desc: t.friendReqDesc, state: formData.allowFriendRequests, key: 'allowFriendRequests' },
                    ].map((item, i) => (
                        <div key={i} className="p-4 rounded-xl bg-[#131119] border border-white/5 flex items-center justify-between hover:border-purple-500/30 hover:bg-[#1A1A20] transition-all duration-300 gap-4">
                             <div className="flex-1 min-w-0">
                                <p className="font-bold text-white text-base">{item.label}</p>
                                <p className="text-sm text-gray-500 mt-1 pr-2">{item.desc}</p>
                             </div>
                             <div className="shrink-0">
                                <ToggleSwitch checked={item.state} onChange={() => setFormData({ ...formData, [item.key as keyof typeof formData]: !item.state })} color={PALETTE.VIOLETA} />
                             </div>
                        </div>
                    ))}
                </div>
             </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#1A1A20] border border-white/5 rounded-2xl p-6 md:p-8">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Bell size={20} className="text-yellow-500" /> {t.notifPref}
                </h3>
                
                <div className="space-y-6">
                    <div className="p-4 rounded-xl bg-[#131119] border border-white/5 flex items-center justify-between hover:border-yellow-500/30 hover:bg-[#1A1A20] transition-all duration-300 gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                             <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0"><Mail size={20}/></div>
                             <div>
                                <p className="font-bold text-white">{t.emails}</p>
                                <p className="text-sm text-gray-500">{t.emailsDesc}</p>
                             </div>
                        </div>
                        <div className="shrink-0">
                            <ToggleSwitch checked={formData.emailNotifs} onChange={() => setFormData({...formData, emailNotifs: !formData.emailNotifs})} color={PALETTE.AMARILLO} />
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#131119] border border-white/5 flex items-center justify-between hover:border-yellow-500/30 hover:bg-[#1A1A20] transition-all duration-300 gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                             <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0"><Smartphone size={20}/></div>
                             <div>
                                <p className="font-bold text-white">{t.push}</p>
                                <p className="text-sm text-gray-500">{t.pushDesc}</p>
                             </div>
                        </div>
                        <div className="shrink-0">
                            <ToggleSwitch checked={formData.pushNotifs} onChange={() => setFormData({...formData, pushNotifs: !formData.pushNotifs})} color={PALETTE.AMARILLO} />
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[#131119] border border-white/5 flex items-center justify-between hover:border-yellow-500/30 hover:bg-[#1A1A20] transition-all duration-300 gap-4">
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                             <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 shrink-0"><Gamepad2 size={20}/></div>
                             <div>
                                <p className="font-bold text-white">{t.news}</p>
                                <p className="text-sm text-gray-500">{t.newsDesc}</p>
                             </div>
                        </div>
                        <div className="shrink-0">
                            <ToggleSwitch checked={formData.marketingEmails} onChange={() => setFormData({...formData, marketingEmails: !formData.marketingEmails})} color={PALETTE.AMARILLO} />
                        </div>
                    </div>
                </div>
              </div>
          </div>
        );
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col bg-[#131119]"
      style={{ colorScheme: 'dark' }}
    >
        {/* --- ESTILOS GLOBALES --- */}
        <style jsx global>{`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(5px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fadeIn {
                animation: fadeIn 0.4s ease-out forwards;
            }
            .no-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .no-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
        `}</style>

      {/* 1. HEADER INTEGRADO */}
      <Header user={safeUser} />
      
      {/* 2. MAIN WRAPPER */}
      <main className="flex-1 px-6 md:px-10 max-w-[1920px] mx-auto w-full relative flex flex-col">
        
        <div className="flex flex-col md:flex-row gap-8 flex-1 items-stretch">
          
          {/* Menú Lateral */}
          <aside className="hidden md:block w-[260px] shrink-0 relative">
             <div className="sticky top-[74px] pt-10 pb-10 h-[calc(100vh-74px)] overflow-y-auto no-scrollbar">
                <VerticalMenu activeItem="settings" />
             </div>
          </aside>

          {/* Área Derecha: Contenido de Settings */}
          <div className="flex-1 w-full min-w-0 space-y-8 flex flex-col pt-6 md:pt-10 pb-10">
            
            {/* Header de la Página - CENTRADO EN MÓVIL */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4 text-center md:text-left">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{t.title}</h2>
                    <p className="text-gray-400 text-sm">{t.subtitle}</p>
                </div>
                <button className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all duration-300 shadow-lg shadow-white/5 hover:scale-105 active:scale-95">
                    <Save size={18} />
                    {t.save}
                </button>
            </div>

            {/* Navegación por Pestañas */}
            <div className="flex overflow-x-auto no-scrollbar border-b border-white/10 gap-8">
                {[
                    { id: 'account', label: t.tabs.account, icon: User },
                    { id: 'connections', label: t.tabs.connections, icon: Globe },
                    { id: 'privacy', label: t.tabs.privacy, icon: Shield },
                    { id: 'notifications', label: t.tabs.notifications, icon: Bell },
                ].map((tab) => {
                    const isActive = activeTab === tab.id;
                    let activeColor = 'text-blue-500';
                    let activeBorder = 'border-blue-500';

                    if (tab.id === 'connections') {
                        activeColor = 'text-green-500';
                        activeBorder = 'border-green-500';
                    } else if (tab.id === 'privacy') {
                        activeColor = 'text-purple-500';
                        activeBorder = 'border-purple-500';
                    } else if (tab.id === 'notifications') {
                        activeColor = 'text-yellow-500';
                        activeBorder = 'border-yellow-500';
                    }

                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                                isActive 
                                ? `text-white ${activeBorder}` 
                                : 'text-gray-500 border-transparent hover:text-gray-300'
                            }`}
                        >
                            <tab.icon size={18} className={isActive ? activeColor : ''} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Contenido Dinámico */}
            <div className="min-h-[500px]">
                {renderContent()}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}