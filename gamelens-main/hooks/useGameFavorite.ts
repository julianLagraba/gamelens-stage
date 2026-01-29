import { useState, useEffect } from 'react';

export function useGameFavorite(game: { id: number, name: string, slug: string, coverUrl: string }) {
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Cargar estado inicial
  useEffect(() => {
    const checkLocalStatus = () => {
        try {
            const storedFavs = JSON.parse(localStorage.getItem('user_favorites_ids') || '[]');
            // Forzamos la comparación a números para evitar problemas de string "1" vs number 1
            const exists = storedFavs.some((fid: any) => Number(fid) === Number(game.id));
            setIsFav(exists);
        } catch (e) {
            console.error("Error leyendo localStorage", e);
        }
    };
    
    checkLocalStatus();
    window.addEventListener('favorites_updated', checkLocalStatus);
    return () => window.removeEventListener('favorites_updated', checkLocalStatus);
  }, [game.id]);

  // 2. La función de disparo
  const toggleFavorite = async () => {
    // A. Validar sesión
    const session = localStorage.getItem('user_session');
    if (!session) {
        alert("ERROR: No has iniciado sesión. Loguéate de nuevo.");
        return;
    }

    // B. Validar datos del juego (CRÍTICO)
    if (!game.id || !game.name) {
        alert(`ERROR CRÍTICO: Datos del juego incompletos. ID: ${game.id}, Name: ${game.name}`);
        return;
    }

    const user = JSON.parse(session);
    setLoading(true);

    try {
        let res;
        
        if (isFav) {
            // --- BORRAR ---
            console.log(`Intentando BORRAR favorito: User ${user.id}, Game ${game.id}`);
            res = await fetch(`http://127.0.0.1:8001/api/favorites/${user.id}/${game.id}`, {
                method: 'DELETE'
            });
        } else {
            // --- AGREGAR ---
            const payload = {
                game_id: Number(game.id), // Aseguramos que sea número
                game_name: game.name,
                game_slug: game.slug || "unknown-slug",
                cover_url: game.coverUrl || "/placeholder.jpg"
            };
            
            console.log("Enviando Payload a Python:", payload);

            res = await fetch(`http://127.0.0.1:8001/api/favorites?user_id=${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
        }

        // C. Manejo de Respuesta
        if (res.ok) {
            console.log("¡ÉXITO! Respuesta del servidor OK");
            
            // Actualizar localStorage manualmente para feedback instantáneo
            const currentIds = JSON.parse(localStorage.getItem('user_favorites_ids') || '[]');
            let newIds;
            
            if (isFav) {
                newIds = currentIds.filter((id: number) => Number(id) !== Number(game.id));
            } else {
                if (!currentIds.includes(Number(game.id))) currentIds.push(Number(game.id));
                newIds = currentIds;
            }
            
            localStorage.setItem('user_favorites_ids', JSON.stringify(newIds));
            setIsFav(!isFav); // Cambiar color visualmente
            window.dispatchEvent(new Event("favorites_updated"));
            
        } else {
            // Si el server dice NO, mostramos por qué
            const errorText = await res.text();
            console.error("Server rechazó la petición:", errorText);
            alert(`ERROR DEL SERVER: ${res.status} - ${errorText}`);
        }

    } catch (error) {
        console.error("Error de red o código:", error);
        alert("ERROR DE CONEXIÓN: Verifica que el backend Python esté corriendo.");
    } finally {
        setLoading(false);
    }
  };

  return { isFav, toggleFavorite, loading };
}