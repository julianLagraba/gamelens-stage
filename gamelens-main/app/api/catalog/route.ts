// app/api/catalog/route.ts
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  // 1. Leemos qué página pide el frontend (ej: ?page=2)
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';

  try {
    console.log(`📡 Solicitando Catálogo Página ${page} a Python...`);
    
    // 2. Llamamos a Python
    const res = await fetch(`http://127.0.0.1:8001/api/catalog?page=${page}&limit=24`, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Error en backend Python');

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("❌ Error fetch catalog:", error);
    return NextResponse.json([], { status: 500 });
  }
}