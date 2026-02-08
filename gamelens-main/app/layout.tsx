import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
        <Providers>
            {children}
        </Providers>
      </body>
    </html>
  );
}