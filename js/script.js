// Funciones de UI generales
function toggleMenu() {
  const menu = document.querySelector('.menu');
  menu.classList.toggle('abierta');
}

function mostrarSeccion(id) {
  document.querySelectorAll('main section').forEach(sec => {
    sec.classList.remove('seccion-visible');
    sec.classList.add('seccion-oculta');
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('seccion-oculta');
    target.classList.add('seccion-visible');

    // Invalida el tamaño de los mapas si es necesario para que se rendericen correctamente
    if (id === 'mapa' && mapaPrincipalInstance) {
      mapaPrincipalInstance.invalidateSize();
    } else if (id === 'historial' && mapaHistorialInstance) {
      mapaHistorialInstance.invalidateSize();
    } else if (id === 'zonas' && mapaZonasInstance) {
      mapaZonasInstance.invalidateSize();
    }
  }
}

// Variables globales para las instancias de los mapas
let mapaPrincipalInstance = null;
let marcadorPrincipal = null;
let mapaHistorialInstance = null;
let mapaZonasInstance = null;

// --- LÓGICA DEL MAPA PRINCIPAL ---

/**
 * Obtiene la última ubicación del usuario logueado desde la API 
 * y la muestra en el mapa principal.
 */
async function actualizarUbicacion() {
  const datosUbicacionDiv = document.querySelector('#mapa .datos-ubicacion');
  const btnActualizar = document.getElementById('btn-actualizar-ubicacion');

  if (!btnActualizar || !datosUbicacionDiv) return;

  btnActualizar.disabled = true;
  datosUbicacionDiv.innerHTML = '<p>Buscando ubicación...</p>';

  try {
    // 1. Obtener el usuario del localStorage
    const usuarioData = JSON.parse(localStorage.getItem('usuario'));
    if (!usuarioData || !usuarioData.usuario) {
      throw new Error("No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.");
    }
    const nombreDeUsuario = usuarioData.usuario;

    // 2. Llamar a la API con el usuario específico
    const response = await fetch(`https://mi-api-express.onrender.com/datos-ubicacion?usuario=${nombreDeUsuario}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'No se pudo obtener la ubicación.');
    }

    // 3. Procesar la respuesta (que ahora es un array)
    const ubicaciones = data.data;
    if (ubicaciones.length === 0) {
      throw new Error("No hay ubicaciones registradas para este usuario.");
    }

    // Tomamos la primera ubicación del array (la más reciente)
    const ultimoDato = ubicaciones[0]; 
    const ubicacion = ultimoDato.ubicacion;
    const fecha = new Date(ultimoDato.fecha_registro);
    const lat = ubicacion.latitud;
    const lng = ubicacion.longitud;
    
    // 4. Actualizar el mapa
    if (!marcadorPrincipal) {
      marcadorPrincipal = L.marker([lat, lng]).addTo(mapaPrincipalInstance);
    } else {
      marcadorPrincipal.setLatLng([lat, lng]);
    }

    mapaPrincipalInstance.setView([lat, lng], 16);
    marcadorPrincipal.bindPopup(`<b>Última ubicación de ${nombreDeUsuario}</b><br>Dispositivo: ${ultimoDato.dispositivo}<br>Fecha: ${fecha.toLocaleString('es-MX')}`).openPopup();

    datosUbicacionDiv.innerHTML = `
      <p><strong>Fecha:</strong> ${ultimoDato.fecha_dato}</p>
      <p><strong>Hora:</strong> ${ultimoDato.hora_dato}</p>
      <p><strong>Latitud:</strong> ${lat}</p>
      <p><strong>Longitud:</strong> ${lng}</p>
      <p><strong>Dispositivo:</strong> ${ultimoDato.dispositivo}</p>
    `;

  } catch (error) {
    console.error('Error al actualizar la ubicación:', error);
    datosUbicacionDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
  } finally {
    btnActualizar.disabled = false;
  }
}

// --- LÓGICA DE OTRAS SECCIONES (SIMULADA POR AHORA) ---

// Función para inicializar el mapa de la sección de historial
function inicializarMapaHistorial() {
    if (document.getElementById('mapa-historial') && !mapaHistorialInstance) {
        mapaHistorialInstance = L.map('mapa-historial').setView([19.4326, -99.1332], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapaHistorialInstance);
    }
}

// Función para inicializar el mapa de la sección de zonas seguras
function inicializarMapaZonas() {
    if (document.getElementById('mapa-zonas') && !mapaZonasInstance) {
        mapaZonasInstance = L.map('mapa-zonas').setView([19.4326, -99.1332], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapaZonasInstance);
    }
}

// --- EVENT LISTENER PRINCIPAL ---

document.addEventListener("DOMContentLoaded", function () {
  
  // Inicializar el mapa principal una sola vez
  if (document.getElementById('map')) {
    mapaPrincipalInstance = L.map('map').setView([19.4326, -99.1332], 5); // Vista inicial general
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapaPrincipalInstance);

    // Llamamos a la función para obtener la ubicación real al cargar la página
    actualizarUbicacion(); 
    
    // Añadimos el listener al botón para que llame a la misma función al hacer clic
    const btnActualizar = document.getElementById('btn-actualizar-ubicacion');
    if (btnActualizar) {
      btnActualizar.addEventListener('click', actualizarUbicacion);
    }
  }

  // Inicializar los otros mapas cuando sea necesario (al mostrar su sección)
  // La función mostrarSeccion() se encarga de esto.
  inicializarMapaHistorial();
  inicializarMapaZonas();

  // Aquí iría la lógica para los formularios de historial, zonas, configuración, etc.
  // Por ahora, se dejan las simulaciones o funcionalidades básicas.
  
});
