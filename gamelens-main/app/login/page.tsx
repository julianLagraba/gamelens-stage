'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Loader2,
  AlertCircle,
  Globe 
} from 'lucide-react';
import { useLanguage } from '@/app/context/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { language, toggleLanguage } = useLanguage();

  const translations = {
    en: {
        welcomeBack: "Welcome Back",
        enterDetails: "Enter your details to access your account",
        email: "Email",
        emailPlaceholder: "user@gamelens.com",
        password: "Password",
        passwordPlaceholder: "Your password",
        signIn: "Sign In",
        signingIn: "Signing in...",
        orLogin: "Or login with",
        google: "Google",
        discord: "Discord",
        noAccount: "Don't have an account?",
        signUp: "Sign Up",
        errors: {
            invalidAuth: "Invalid email or password.",
            generic: "An error occurred. Please try again."
        }
    },
    es: {
        welcomeBack: "Bienvenido de nuevo",
        enterDetails: "Ingresa tus datos para acceder a tu cuenta",
        email: "Email",
        emailPlaceholder: "usuario@gamelens.com",
        password: "Contraseña",
        passwordPlaceholder: "Tu contraseña",
        signIn: "Iniciar Sesión",
        signingIn: "Iniciando...",
        orLogin: "O ingresa con",
        google: "Google",
        discord: "Discord",
        noAccount: "¿No tienes cuenta?",
        signUp: "Regístrate",
        errors: {
            invalidAuth: "Email o contraseña incorrectos.",
            generic: "Ocurrió un error. Intenta nuevamente."
        }
    }
  };

  const t = translations[language.toLowerCase() as 'en' | 'es'];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 🔥 CONEXIÓN AL BACKEND PYTHON 🔥
      const response = await fetch('http://127.0.0.1:8001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error de autenticación');
      }

      // ✅ ÉXITO: Guardamos la sesión
      localStorage.setItem('user_session', JSON.stringify(data));
      
      // Forzamos un evento de almacenamiento para que otros componentes se enteren (opcional pero útil)
      window.dispatchEvent(new Event("storage"));

      console.log("Login exitoso:", data);
      router.push('/'); 
      
    } catch (err: any) {
      console.error("Login error:", err);
      setError(t.errors.invalidAuth);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] flex items-center justify-center p-4 relative overflow-hidden">
      
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      <button
        onClick={toggleLanguage}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm text-gray-300 font-medium transition-all backdrop-blur-md active:scale-95"
      >
        <Globe size={16} />
        <span>{language}</span>
      </button>

      {/* Fondo Mesh Gradient */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[35vw] h-[35vw] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen" />
      </div>
      
      <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 relative z-10 flex flex-col gap-6 animate-fade-up">
        
        <div className="flex flex-col items-center justify-center space-y-4 mb-2">
          <div className="relative w-24 h-24 transition-transform duration-700 ease-in-out hover:rotate-[360deg] cursor-pointer group">
            <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-2xl opacity-50 animate-pulse z-0"></div>
            <div className="relative z-10 w-full h-full">
                <Image src="/Logo_Game.svg" alt="GameLens Logo" fill className="object-contain" priority />
            </div>
          </div>
          
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">{t.welcomeBack}</h1>
            <p className="text-gray-400 text-sm">{t.enterDetails}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">{t.email}</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input 
                type="email" 
                required
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 text-sm"
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">{t.password}</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input 
                type="password" 
                required
                className="w-full bg-black/40 border border-white/10 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all placeholder:text-gray-600 text-sm"
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span>{t.signingIn}</span>
              </>
            ) : (
              <>
                <span>{t.signIn}</span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#121212] px-2 text-gray-500">{t.orLogin}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white py-2.5 rounded-xl transition-all text-sm font-medium hover:border-white/20 hover:bg-[#EA4335]/20 hover:text-[#EA4335] group">
                {/* SVG Google... */}
                <svg className="w-4 h-4 group-hover:fill-current" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.013-1.133 8.053-3.24 2.067-2.12 2.64-5.227 2.64-7.84 0-.787-.067-1.467-.187-2.147h-10.51z"/></svg>
                {t.google}
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 text-gray-300 hover:text-white py-2.5 rounded-xl transition-all text-sm font-medium hover:border-white/20 hover:bg-[#5865F2]/20 hover:text-[#5865F2] group">
                {/* SVG Discord... */}
                <svg className="w-4 h-4 group-hover:fill-current" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.5328-9.748-1.3751-13.6888a.061.061 0 00-.0303-.0277zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.419-2.1568 2.419z"/></svg>
                {t.discord}
            </button>
        </div>

        <p className="text-center text-sm text-gray-500">
          {t.noAccount}{' '}
          <Link href="/sign-up" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
            {t.signUp}
          </Link>
        </p>

      </div>
    </div>
  );
}