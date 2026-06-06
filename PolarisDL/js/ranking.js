
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const REST_URL = '';
const supabase = createClient('https://phjrcdjjftlvarupieyk.supabase.co', 'sb_publishable_A1nmH7cSLTR0as3dTyEmOw_6ku0MNO3')

document.addEventListener('DOMContentLoaded', () => {
    const cuerpoTabla = document.getElementById('tabla-ranking');

    fetch('/api/ranking')
        .then(response => response.json())
        .then(jugadores => {
            cuerpoTabla.innerHTML = '';

            if (jugadores.length === 0) {
                cuerpoTabla.innerHTML = `<tr><td colspan="3" class="text-muted">No hay registros en el ranking todavía.</td></tr>`;
                return;
            }

            jugadores.forEach((jugador, indice) => {
                const fila = document.createElement('tr');
                
                const posicion = indice + 1;
                let posicionEstilizada = posicion;
                
                fila.innerHTML = `
                    <td class="fw-bold fs-5">${posicionEstilizada}</td>
                    <td class="text-start ps-5 fw-semibold text-white">${jugador.Nombre_Jugador || jugador.Nombre}</td>
                    <td class="text-white fw-bold">${jugador.puntos_totales || jugador.puntos || 0}  pts</td>
                `;

                cuerpoTabla.appendChild(fila);
            });
        })
        .catch(error => {
            console.error('Error al cargar el ranking:', error);
            cuerpoTabla.innerHTML = `<tr><td colspan="3" class="text-danger">Error al conectar con el servidor de rankings.</td></tr>`;
        });
});