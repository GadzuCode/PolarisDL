document.addEventListener('DOMContentLoaded', () => {
    const cuerpoTabla = document.getElementById('tabla-ranking');

    // Comprobamos que el elemento realmente exista en el HTML antes de disparar el fetch
    if (!cuerpoTabla) return;

    fetch('/api/ranking')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en el servidor: ${response.status}`);
            }
            return response.json();
        })
        .then(jugadores => {
            cuerpoTabla.innerHTML = '';

            if (!jugadores || jugadores.length === 0) {
                cuerpoTabla.innerHTML = `<tr><td colspan="3" class="text-muted py-4">No hay registros en el ranking todavía.</td></tr>`;
                return;
            }

            jugadores.forEach((jugador, indice) => {
                const fila = document.createElement('tr');
                const posicion = indice + 1;
                
                const nombreJugador = jugador.Nombre || "Jugador Desconocido";
                const puntosTotales = jugador.Puntos_Totales || 0; 

                fila.innerHTML = `
                    <td class="fw-bold fs-5 text-warning">#${posicion}</td>
                    <td class="text-start ps-5 fw-semibold text-white">${nombreJugador}</td>
                    <td class="text-warning fw-bold">${puntosTotales} pts</td>
                `;

                cuerpoTabla.appendChild(fila);
            });
        })
        .catch(error => {
            console.error('Error al cargar el ranking:', error);
            cuerpoTabla.innerHTML = `<tr><td colspan="3" class="text-danger py-4">Error al conectar con el servidor de rankings.</td></tr>`;
        });
});