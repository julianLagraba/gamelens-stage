import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. TUS IMÁGENES (Mantengo lo que tenías porque es más seguro y correcto)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.igdb.com', 
      },
      {
        protocol: 'https',
        hostname: 'placehold.co', 
      },
      {
        protocol: 'https',
        hostname: 'shared.akamai.steamstatic.com', 
      },
      {
        protocol: 'https',
        hostname: 'cdn.akamai.steamstatic.com',
      },
      // Agrego este comodín al final por si IGDB manda una imagen de otro lado raro
      {
        protocol: 'https',
        hostname: '**', 
      }
    ],
    unoptimized: true,
  },

  // 2. EL PUENTE A PYTHON (¡ESTO ES LO QUE TE FALTABA!) 
  // Sin esto, el frontend no sabe dónde buscar los datos del buscador.
  async rewrites() {
    return [
      {
        source: '/api/:path*', // Si la web pide /api/search...
        destination: 'http://127.0.0.1:8001/api/:path*', // ...lo mandamos a Python puerto 8000
      },
    ];
  },
};

export default nextConfig;