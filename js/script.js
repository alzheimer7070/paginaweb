// js/script.js

// --- VARIABLES GLOBALES Y FUNCIONES DE UI ---
const API_URL = 'https://mi-api-express.onrender.com';
let mapaPrincipalInstance = null;
let marcadorPrincipal = null;
let mapaHistorialInstance = null;
let marcadoresHistorial = [];

/**
 * Muestra u oculta el menú lateral en dispositivos móviles.
 */
function toggleMenu() {
    document.querySelector('.menu').classList.toggle('abierta');
}

/**
 * Cierra la sesión del usuario limpiando el almacenamiento local y redirigiendo al login.
 */
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'login.html';
}

/**
 * Muestra una sección específica del dashboard y oculta las demás.
 * También se asegura de que los mapas se redibujen correctamente.
 * @param {string} id - El ID de la sección a mostrar.
 */
function mostrarSeccion(id) {
    document.querySelectorAll('main section').forEach(sec => sec.classList.replace('seccion-visible', 'seccion-oculta'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.replace('seccion-oculta', 'seccion-visible');
        
        if (id === 'mapa' && mapaPrincipalInstance) {
            mapaPrincipalInstance.invalidateSize();
        } else if (id === 'historial') {
            if (!mapaHistorialInstance) {
                initMapHistorial();
            }
            mapaHistorialInstance.invalidateSize();
        }
    }
}

// --- LÓGICA PRINCIPAL DEL DASHBOARD ---

document.addEventListener("DOMContentLoaded", function () {
    // 1. Proteger la página: si no hay sesión, redirigir al login
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // 2. Inicialización del mapa principal
    mapaPrincipalInstance = L.map('map').setView([19.4326, -99.1332], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapaPrincipalInstance);
    
    // 3. Asignación de Event Listeners a los botones y formularios
    document.getElementById('btn-actualizar-ubicacion')?.addEventListener('click', cargarUltimaUbicacion);
    document.getElementById('form-historial')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const fecha = document.getElementById('fechaConsulta').value;
        if (fecha) cargarHistorialPorDia(fecha);
    });

    // 4. Carga inicial de la última ubicación
    cargarUltimaUbicacion();
});

// --- FUNCIONES DEL MAPA PRINCIPAL ---

async function cargarUltimaUbicacion() {
    const infoDiv = document.querySelector('#mapa .datos-ubicacion');
    const btnActualizar = document.getElementById('btn-actualizar-ubicacion');

    infoDiv.innerHTML = '<p>Conectando con el servidor... (esto puede tardar unos segundos la primera vez)</p>';
    if (marcadorPrincipal) mapaPrincipalInstance.removeLayer(marcadorPrincipal);
    if (btnActualizar) btnActualizar.disabled = true;

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.usuario) throw new Error("Sesión no válida.");
        
        const response = await fetch(`${API_URL}/datos-ubicacion?usuario=${currentUser.usuario}`);
        const data = await response.json();

        if (!response.ok || !data.success) throw new Error(data.message || "No se pudo cargar.");
        
        const ubicaciones = data.data;
        if (ubicaciones.length === 0) throw new Error("No hay ubicaciones para este usuario.");

        const ultimoDato = ubicaciones[0];
        const ubicacion = ultimoDato.ubicacion;
        const fecha = new Date(`${ultimoDato.fecha_dato}T${ultimoDato.hora_dato}Z`);
        
        mapaPrincipalInstance.setView([ubicacion.latitud, ubicacion.longitud], 16);
        marcadorPrincipal = L.marker([ubicacion.latitud, ubicacion.longitud]).addTo(mapaPrincipalInstance);
        
        marcadorPrincipal.bindPopup(`<b>Última Ubicación</b><br>Dispositivo: ${ultimoDato.dispositivo}<br>Fecha: ${fecha.toLocaleDateString('es-MX')}<br>Hora: ${fecha.toLocaleTimeString('es-MX')}`).openPopup();

        infoDiv.innerHTML = `<p><strong>Dispositivo:</strong> ${ultimoDato.dispositivo}</p><p><strong>Fecha:</strong> ${fecha.toLocaleDateString('es-MX')}</p><p><strong>Hora:</strong> ${fecha.toLocaleTimeString('es-MX')}</p>`;
    } catch (error) {
        infoDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    } finally {
        if (btnActualizar) btnActualizar.disabled = false;
    }
}

// --- FUNCIONES PARA EL HISTORIAL POR DÍA ---

function initMapHistorial() {
    if (mapaHistorialInstance) return;
    mapaHistorialInstance = L.map('mapa-historial').setView([19.4326, -99.1332], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapaHistorialInstance);
}

function limpiarMarcadoresHistorial() {
    marcadoresHistorial.forEach(m => mapaHistorialInstance.removeLayer(m));
    marcadoresHistorial = [];
}

async function cargarHistorialPorDia(fechaSeleccionada) {
    const infoDiv = document.getElementById('info-historial');
    infoDiv.innerHTML = `<p>Buscando historial para el ${fechaSeleccionada}...</p>`;
    limpiarMarcadoresHistorial();

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.usuario) throw new Error("Sesión no válida.");

        const response = await fetch(`${API_URL}/datos-ubicacion?usuario=${currentUser.usuario}`);
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.message || 'No se pudo cargar el historial.');
        
        const ubicacionesFiltradas = data.data.filter(punto => punto.fecha_dato === fechaSeleccionada);
        if (ubicacionesFiltradas.length === 0) throw new Error(`No hay ubicaciones registradas para el día ${fechaSeleccionada}.`);

        const markerGroup = [];
        ubicacionesFiltradas.forEach(punto => {
            if (punto.ubicacion && punto.ubicacion.latitud && punto.ubicacion.longitud) {
                const fechaHora = new Date(`${punto.fecha_dato}T${punto.hora_dato}Z`);
                const marker = L.marker([punto.ubicacion.latitud, punto.ubicacion.longitud]).addTo(mapaHistorialInstance);
                marker.bindPopup(`<b>Dispositivo:</b> ${punto.dispositivo}<br><b>Hora:</b> ${fechaHora.toLocaleTimeString('es-MX')}`);
                marcadoresHistorial.push(marker);
                markerGroup.push([punto.ubicacion.latitud, punto.ubicacion.longitud]);
            }
        });

        if (markerGroup.length > 0) {
            mapaHistorialInstance.fitBounds(markerGroup);
            infoDiv.innerHTML = `<p>Mostrando ${markerGroup.length} puntos para el día ${fechaSeleccionada}.</p>`;
        } else {
            throw new Error("No se encontraron ubicaciones con coordenadas válidas.");
        }
    } catch (error) {
        infoDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}