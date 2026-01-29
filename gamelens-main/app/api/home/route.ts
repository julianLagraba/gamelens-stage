import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    console.log("🏠 Pidiendo Home Data a Python...");
    
    // Llamamos al endpoint de home en Python
    const res = await fetch('http://127.0.0.1:8001/api/home', {
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Error en backend" }, { status: 500 });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("❌ Error conectando Home con Python:", error);
    return NextResponse.json({ user: {}, games: [], featuredGame: null });
  }
}