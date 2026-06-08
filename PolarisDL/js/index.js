
const elemento = document.body;
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
const REST_URL = '';
const supabase = createClient('https://phjrcdjjftlvarupieyk.supabase.co', 'sb_publishable_A1nmH7cSLTR0as3dTyEmOw_6ku0MNO3')

fetch('/api/sumbits')
    .then(response => response.json())
    .then(datos => {
        console.log("Datos recibidos de los submits:", datos);        
    })
    .catch(error => {
        console.error("Hubo un error al conectar con el servidor:", error);
    });


fetch('/api/levels')
    .then(response => response.json())
.then(listaNiveles => {
    const contenedorLista = document.getElementById('lista-demons');
    contenedorLista.innerHTML = '';

    listaNiveles.forEach((nivel) => {
        const itemHTML = `
            <button type="button" 
                data-id="${nivel.ID_Level}" 
              style="background-image: url(/Recursos/${nivel.ID_Level}.png) !important; background-size: cover;"  class="list-group-item list-group-item-action bg-dark text-white border-secondary d-flex justify-content-between align-items-center py-3 boton-nivel">
            <div class="text-start">
                <h5 class="mb-1 fw-bold">#${nivel.Top} ${nivel.Nombre_Nivel}</h5>
            </div>
        </button>
        `;
        contenedorLista.innerHTML += itemHTML;
    });
    
    contenedorLista.addEventListener('click', (evento) => {
        
        const botonTocado = evento.target.closest('.boton-nivel');
        if (!botonTocado) return;

        const botonActivoAnterior = contenedorLista.querySelector('.boton-nivel.active');
        if (botonActivoAnterior) {
            botonActivoAnterior.classList.remove('active');
        }
        botonTocado.classList.add('active');
        contenedorLista.classList.add('apartado-activo');

    const textoH5 = botonTocado.querySelector('h5').innerText; 
    const numeroTop = textoH5.replace(/[^0-9]/g, ''); 

    const idNivelSeleccionado = botonTocado.dataset.id;
   
            
    elemento.style.background-image: `url(/Recursos/'${idNivelSeleccionado}.png')` !important;
      //  console.log("Cargando detalles y submits del nivel:", idNivelSeleccionado);
        
        cargarSubmitsDelNivel(idNivelSeleccionado);

    //console.log("El Top seleccionado es el número:", numeroTop); 
const nivelSeleccionado = listaNiveles.find(n => Number(n.Top) === Number(numeroTop));
        if (!nivelSeleccionado) {
            console.error("No se encontró el nivel en la lista");
            return;
        }
        let urlOriginal = nivelSeleccionado.Link_Showcase;
let urlEmbed = '';

if (urlOriginal.includes('watch?v=')) {
    const videoId = urlOriginal.split('watch?v=')[1].split('&')[0];
    urlEmbed = `https://www.youtube.com/embed/${videoId}`;
} else if (urlOriginal.includes('youtu.be/')) {
    const videoId = urlOriginal.split('youtu.be/')[1].split('?')[0];
    urlEmbed = `https://www.youtube.com/embed/${videoId}`;
} else if (urlOriginal.includes('embed/')) {
    urlEmbed = urlOriginal;
} else {
    console.error("El formato del enlace no es válido:", urlOriginal);
    urlEmbed = ''; 
}
const contenedorLevel = document.getElementById('apartado-nivel');
const puntosDelNivel = nivelSeleccionado.Puntos ? nivelSeleccionado.Puntos.Puntos : 0;
const Apart = `    

    <h1 class="d-flex border-bottom pb-2">${nivelSeleccionado.Nombre_Nivel}</h1>
    <div class="ratio ratio-16x9 mt-4 mb-4">
        <iframe src="${urlEmbed}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
    <div class=" d-inline-block ">Creador: ${nivelSeleccionado.Creador.Nombre}</div>
    <div class=" d-inline-block m-2">Verificador: ${nivelSeleccionado.Verificador.Nombre}</div>
    <div class=" d-inline-block m-2">Puntos: ${puntosDelNivel}</div>
    <div class=" d-inline-block m-2">Level ID: ${nivelSeleccionado.Id_Gd}</div>
`;

contenedorLevel.innerHTML = Apart;
    });
});

function cargarSubmitsDelNivel(idLevel) {
    const contenedorSubmits = document.getElementById('lista-records'); // Asegúrate que este ID exista en tu HTML
    if (contenedorSubmits) contenedorSubmits.innerHTML = '<p class="text-secondary">Cargando récords...</p>';

    fetch(`/api/sumbits?id_level=${idLevel}`)
        .then(response => response.json())
        .then(listaSubmits => {
            
            if (listaSubmits.error) {
                console.error("Error devuelto por el servidor:", listaSubmits.error);
                if (contenedorSubmits) {
                    contenedorSubmits.innerHTML = `<div class="text-danger">Error: ${listaSubmits.error}</div>`;
                }
                return;
            }

            if (contenedorSubmits) contenedorSubmits.innerHTML = '';
            if (Array.isArray(listaSubmits)) {
                if (listaSubmits.length === 0) {
                    contenedorSubmits.innerHTML = '<div class="text-muted">No hay récords registrados para este nivel.</div>';
                    return;
                }
                
                listaSubmits.forEach(submit => {
    //console.log("Submit con nombre:", submit);
    
    let nombreJugador = "Jugador Anónimo";
    if (submit.Jugador && submit.Jugador.Nombre) {
        nombreJugador = submit.Jugador.Nombre;
    } else if (submit.Player) {
        nombreJugador = `Jugador #${submit.Player}`; 
    }
    
    const enlaceVideo = submit.Link_Mostrar || "#";
    const submitHTML = `
        <div class="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center py-2 mb-2">
            <div class="text-start">
                <h6 class="mb-0 fw-bold">${nombreJugador}</h6>
            </div>
            <a href="${enlaceVideo}" target="_blank" class="text-danger fs-4 d-flex align-items-center justify-content-center " title="Ver Video">
                <i class="bi bi-youtube"></i> 
                </a>
        </div>
    `;
    contenedorSubmits.innerHTML += submitHTML;
});
            }
        })
        .catch(err => {
            console.error("Error en el fetch del cliente:", err);
            if (contenedorSubmits) contenedorSubmits.innerHTML = '<div class="text-danger">Error al conectar con el servidor</div>';
        });
}


