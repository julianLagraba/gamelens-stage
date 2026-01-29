import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { CollectionProvider } from './context/CollectionContext';
import { LanguageProvider } from "./context/LanguageContext";
import { AchievementProvider } from './context/AchievementContext';
import "./globals.css";

const poppins = Poppins({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GameLens Dashboard",
  description: "Analytics for Gamers",
  icons: {
    icon: {
      url: '/Logo_Game.svg',
      type: 'image/svg+xml',
    },
  },
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${poppins.variable} antialiased bg-[#131119] text-white selection:bg-pink-500/30 min-h-screen`}
      >
        <LanguageProvider>
          <AuthProvider>
            <FavoritesProvider>
              <CollectionProvider>
               <AchievementProvider>
                 {children}
                </AchievementProvider>
              </CollectionProvider>
            </FavoritesProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}