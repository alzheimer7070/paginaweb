// js/script.js (SECCIÓN DEL MAPA PRINCIPAL MODIFICADA)

// --- LÓGICA DEL MAPA PRINCIPAL CONECTADA A LA API ---

// Variables globales para el mapa principal para poder acceder a ellas
let mapaPrincipalInstance = null;
let marcadorPrincipal = null;
const datosUbicacionDiv = document.querySelector('#mapa .datos-ubicacion');
const btnActualizar = document.getElementById('btn-actualizar-ubicacion');

// Función que se conecta a la API para obtener y mostrar la ubicación
async function actualizarUbicacion() {
  if (!btnActualizar || !datosUbicacionDiv) return;

  // 1. Mostrar estado de carga al usuario
  btnActualizar.disabled = true;
  datosUbicacionDiv.innerHTML = '<p>Actualizando ubicación...</p>';

  try {
    // 2. Hacer la petición GET a tu API en Render para la ruta /recibir
    const response = await fetch('https://mi-api-express.onrender.com/recibir');

    if (!response.ok) {
      throw new Error('No se pudo obtener la ubicación del servidor.');
    }

    const ultimoDato = await response.json();
    
    // 3. Extraer los datos del objeto 'contenido' (así lo estructura tu app.js)
    const ubicacion = ultimoDato.contenido; 
    
    if (!ubicacion || typeof ubicacion.latitud === 'undefined' || typeof ubicacion.longitud === 'undefined') {
        throw new Error('El formato de los datos recibidos no es válido.');
    }

    const lat = ubicacion.latitud;
    const lng = ubicacion.longitud;
    const fecha = new Date(ultimoDato.fecha);

    // 4. Actualizar el mapa
    if (!marcadorPrincipal) {
      marcadorPrincipal = L.marker([lat, lng]).addTo(mapaPrincipalInstance);
    } else {
      marcadorPrincipal.setLatLng([lat, lng]);
    }

    mapaPrincipalInstance.setView([lat, lng], 16);
    marcadorPrincipal.bindPopup(`<b>Última ubicación</b><br>Fecha: ${fecha.toLocaleDateString('es-MX')}<br>Hora: ${fecha.toLocaleTimeString('es-MX')}`).openPopup();

    // 5. Mostrar los datos actualizados en el panel de texto
    datosUbicacionDiv.innerHTML = `
      <p><strong>Fecha:</strong> ${fecha.toLocaleDateString('es-MX')}</p>
      <p><strong>Hora:</strong> ${fecha.toLocaleTimeString('es-MX')}</p>
      <p><strong>Latitud:</strong> ${lat}</p>
      <p><strong>Longitud:</strong> ${lng}</p>
    `;

  } catch (error) {
    console.error('Error al actualizar la ubicación:', error);
    datosUbicacionDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
  } finally {
    // 6. Volver a habilitar el botón
    btnActualizar.disabled = false;
  }
}

// Listener que se ejecuta cuando el DOM está completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  
  // Inicializar el mapa principal una sola vez
  if (document.getElementById('map')) {
    mapaPrincipalInstance = L.map('map').setView([19.4326, -99.1332], 13); // Vista inicial en CDMX
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapaPrincipalInstance);

    // Llamamos a la función para obtener la ubicación real al cargar la página
    actualizarUbicacion(); 
    
    // Añadimos el listener al botón para que llame a la misma función al hacer clic
    if (btnActualizar) {
      btnActualizar.addEventListener('click', actualizarUbicacion);
    }
  }

  // ... (Aquí continúa el resto de tu código de script.js para las otras secciones)
  
});

// (Aquí continúa el resto de tus funciones como mostrarSeccion, toggleMenu, etc.)