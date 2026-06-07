
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const REST_URL = '';
const supabase = createClient('https://phjrcdjjftlvarupieyk.supabase.co', 'sb_publishable_A1nmH7cSLTR0as3dTyEmOw_6ku0MNO3')


function cargarDatalistNiveles() {
    const datalist = document.getElementById('OpcionesNivel');
    if (!datalist) return;

    fetch('/api/levels')
        .then(response => response.json())
        .then(listaNiveles => {
            datalist.innerHTML = '';

            listaNiveles.forEach(nivel => {
                const opcion = document.createElement('option');
                opcion.value = nivel.Nombre_Nivel; 
                opcion.dataset.id = nivel.ID_Level;

                datalist.appendChild(opcion);
            });
        })
        .catch(error => console.error("Error al llenar el datalist de niveles:", error));
}

document.addEventListener('DOMContentLoaded', cargarDatalistNiveles);

const inputNivel = document.getElementById('buscar-nivel');

inputNivel.addEventListener('input', (e) => {
    const valorInput = e.target.value;
    const datalist = document.getElementById('OpcionesNivel');
    
    const opcionSeleccionada = Array.from(datalist.options).find(opt => opt.value === valorInput);
    
    if (opcionSeleccionada) {
        const idDelNivel = opcionSeleccionada.dataset.id;
        console.log(`El usuario seleccionó: ${valorInput} con ID: ${idDelNivel}`);
    }
});


function cargarDatalistPlayers() {
    const datalistplyrs = document.getElementById('dataPlayers');
    if (!datalistplyrs) return;

    fetch('/api/players')
        .then(response => response.json())
        .then(listaPlayers => {
            
            datalistplyrs.innerHTML = '';

            listaPlayers.forEach(player => {
                const opcion = document.createElement('option');
                
                opcion.value = player.Nombre; 
                

                opcion.dataset.id = player.ID_plyr;

                datalistplyrs.appendChild(opcion);
            });
        })
        .catch(error => console.error("Error al llenar el datalist de niveles:", error));
}

document.addEventListener('DOMContentLoaded', cargarDatalistPlayers);

const InputPlyrs = document.getElementById('buscar-players');

InputPlyrs.addEventListener('input', (e) => {
    const valorInput = e.target.value;
    const datalist = document.getElementById('dataPlayers');
    
    const opcionSeleccionada = Array.from(datalist.options).find(opt => opt.value === valorInput);
    
    if (opcionSeleccionada) {
        const idJugador = opcionSeleccionada.dataset.id;
        console.log(`El usuario seleccionó: ${valorInput} con ID: ${idJugador}`);
    }
});


document.addEventListener('DOMContentLoaded', () => {
    const formulario = document.querySelector('form');

    if (!formulario) return;

    formulario.addEventListener('submit', (evento) => {
        evento.preventDefault(); 

        const inputNivel = document.getElementById('buscar-nivel');
        const inputPlayer = document.getElementById('buscar-players');
        const linkMostrar = document.getElementById('LinkMostrar').value.trim();
        const linkRaw = document.getElementById('LinkRaw').value.trim();

        const datalistNiveles = document.getElementById('OpcionesNivel');
        const datalistPlayers = document.getElementById('dataPlayers');

        const opcionNivel = Array.from(datalistNiveles.options).find(opt => opt.value === inputNivel.value);
        const opcionPlayer = Array.from(datalistPlayers.options).find(opt => opt.value === inputPlayer.value);

        if (!opcionNivel || !opcionPlayer || !linkMostrar || !linkRaw) {
            alert("❌ Por favor, selecciona un nivel, un jugador válido de la lista y rellena todos los enlaces.");
            return;
        }

        const idNivel = opcionNivel.dataset.id;
        const idPlayer = opcionPlayer.dataset.id;

        const nuevoSubmit = {
            Nivel: parseInt(idNivel, 10),
            Player: parseInt(idPlayer, 10),
            Link_Mostrar: linkMostrar,
            Link_Raw: linkRaw,
            Status: 'P'
        };

        console.log("Enviando este submit al servidor:", nuevoSubmit);

        fetch('/api/sumbits', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoSubmit)
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(`Error del servidor: ${data.error}`);
            } else {
                alert("🏆 ¡Récord enviado con éxito! El equipo de moderación lo revisará.");
                formulario.reset();
            }
        })
        .catch(error => {
            console.error("Error al conectar con el servidor:", error);
            alert("Error crítico de red al enviar el formulario.");
        });
    });
});
