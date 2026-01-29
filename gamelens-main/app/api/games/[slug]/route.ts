import { NextResponse } from 'next/server';

// Configuración para que no guarde caché vieja
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Context = {
  params: Promise<{ slug: string }>;
};

export async function GET(request: Request, context: Context) {
  // 1. Obtenemos el slug (ej: "elden-ring")
  const { slug } = await context.params;

  console.log(`🔌 Conectando a Python para buscar: ${slug}`);

  try {
    // 2. Llamamos a TU backend Python (puerto 8000)
    const res = await fetch(`http://127.0.0.1:8001/api/games/${slug}`, {
      cache: 'no-store', // Importante: pedir siempre datos frescos
    });

    // Si Python dice que no existe (404), avisamos al front
    if (!res.ok) {
      return NextResponse.json(
        { error: "Juego no encontrado en el backend" }, 
        { status: res.status }
      );
    }

    // 3. Convertimos la respuesta de Python a JSON
    const data = await res.json();

    // 4. Se la mandamos al Frontend
    return NextResponse.json(data);

  } catch (error) {
    console.error("❌ Error fatal conectando con Python:", error);
    return NextResponse.json(
      { error: "El backend Python parece estar apagado o falló." }, 
      { status: 500 }
    );
  }
}