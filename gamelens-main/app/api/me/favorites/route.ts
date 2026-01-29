// app/api/me/favorites/route.ts
import { NextResponse } from 'next/server';
import favoritesData from '@/mocks/favorites.mock.json';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Simulamos un pequeño delay
  // await new Promise((resolve) => setTimeout(resolve, 500));
  
  return NextResponse.json(favoritesData, {
    headers: {
      'Cache-Control': 'no-store, no-cache',
    }
  });
}