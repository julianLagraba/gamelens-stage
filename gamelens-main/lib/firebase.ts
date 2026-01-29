import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Tu configuración de web app de Firebase
// Para obtener estos valores: Ve a Firebase Console > Project Settings > General > Your apps
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase (Patrón Singleton para Next.js)
// Evita errores de "Firebase App named '[DEFAULT]' already exists" durante el Hot Reload
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicializar Auth y exportarlo para usar en toda la app
const auth = getAuth(app);

export { app, auth };