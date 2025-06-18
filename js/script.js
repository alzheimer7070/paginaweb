// js/script.js

// --- VARIABLES GLOBALES Y FUNCIONES DE UI ---
const API_URL = 'https://mi-api-express.onrender.com';
let mapaPrincipalInstance = null;
let marcadoresActuales = []; // Array para gestionar los marcadores del mapa

// Función para mostrar/ocultar el menú lateral en móviles
function toggleMenu() {
    document.querySelector('.menu').classList.toggle('abierta');
}

// Función para cambiar entre secciones del dashboard
function mostrarSeccion(id) {
    document.querySelectorAll('main section').forEach(sec => sec.classList.replace('seccion-visible', 'seccion-oculta'));
    const target = document.getElementById(id);
    if (target) {
        target.classList.replace('seccion-oculta', 'seccion-visible');
        if (id === 'mapa' && mapaPrincipalInstance) {
            mapaPrincipalInstance.invalidateSize();
        }
    }
}

// Función para cerrar la sesión del usuario
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'login.html';
}

// --- LÓGICA PRINCIPAL DEL DASHBOARD ---

document.addEventListener("DOMContentLoaded", function () {
    // 1. Proteger la página
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    // 2. Inicializar el mapa
    mapaPrincipalInstance = L.map('map').setView([19.4326, -99.1332], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapaPrincipalInstance);

    // 3. Asignar eventos a AMBOS botones
    document.getElementById('btn-actualizar-ubicacion')?.addEventListener('click', cargarUltimaUbicacion);
    document.getElementById('btn-mostrar-historial')?.addEventListener('click', cargarHistorialCompleto);

    // 4. Cargar la última ubicación por defecto
    cargarUltimaUbicacion();
});

// --- FUNCIONES DEL MAPA ---

function limpiarMarcadores() {
    marcadoresActuales.forEach(marker => mapaPrincipalInstance.removeLayer(marker));
    marcadoresActuales = [];
}

// Función para cargar SOLO la última ubicación del usuario
async function cargarUltimaUbicacion() {
    const infoDiv = document.querySelector('#mapa .datos-ubicacion');
    infoDiv.innerHTML = '<p>Cargando última ubicación...</p>';
    limpiarMarcadores();

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.usuario) throw new Error("Sesión no válida.");
        
        const response = await fetch(`${API_URL}/datos-ubicacion?usuario=${currentUser.usuario}`);
        const data = await response.json();

        if (!response.ok || !data.success) throw new Error(data.message || "No se pudo cargar.");
        
        const ubicaciones = data.data;
        if (ubicaciones.length === 0) throw new Error("No hay ubicaciones para este usuario.");

        const ultimoDato = ubicaciones[0]; // El más reciente
        const ubicacion = ultimoDato.ubicacion;
        const fecha = new Date(ultimoDato.fecha_registro);

        mapaPrincipalInstance.setView([ubicacion.latitud, ubicacion.longitud], 16);
        const marker = L.marker([ubicacion.latitud, ubicacion.longitud]).addTo(mapaPrincipalInstance);
        marker.bindPopup(`<b>Última Ubicación</b><br>Dispositivo: ${ultimoDato.dispositivo}<br>Fecha: ${fecha.toLocaleString('es-MX')}`).openPopup();
        marcadoresActuales.push(marker);

        infoDiv.innerHTML = `<p><strong>Dispositivo:</strong> ${ultimoDato.dispositivo}</p><p><strong>Fecha:</strong> ${ultimoDato.fecha_dato} - ${ultimoDato.hora_dato}</p>`;
    } catch (error) {
        infoDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

// NUEVA FUNCIÓN para cargar TODO el historial del usuario
async function cargarHistorialCompleto() {
    const infoDiv = document.querySelector('#mapa .datos-ubicacion');
    infoDiv.innerHTML = '<p>Cargando historial completo...</p>';
    limpiarMarcadores();

    try {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.usuario) throw new Error("Sesión no válida.");

        const response = await fetch(`${API_URL}/datos-ubicacion?usuario=${currentUser.usuario}`);
        const data = await response.json();

        if (!response.ok || !data.success) throw new Error(data.message || "No se pudo cargar el historial.");
        
        const ubicaciones = data.data;
        if (ubicaciones.length === 0) throw new Error("No hay historial para este usuario.");

        const markerGroup = [];
        ubicaciones.forEach(punto => {
            const ubicacion = punto.ubicacion || punto.contenido;
            if(ubicacion && ubicacion.latitud && ubicacion.longitud) {
                const marker = L.marker([ubicacion.latitud, ubicacion.longitud]).addTo(mapaPrincipalInstance);
                marker.bindPopup(`<b>Dispositivo:</b> ${punto.dispositivo}<br><b>Fecha:</b> ${new Date(punto.fecha_registro).toLocaleString('es-MX')}`);
                marcadoresActuales.push(marker);
                markerGroup.push([ubicacion.latitud, ubicacion.longitud]);
            }
        });
        
        if (markerGroup.length > 0) {
            mapaPrincipalInstance.fitBounds(markerGroup); // Ajusta el mapa para que se vean todos los puntos
            infoDiv.innerHTML = `<p>Mostrando ${markerGroup.length} puntos del historial de ${currentUser.usuario}.</p>`;
        } else {
             infoDiv.innerHTML = `<p>No se encontraron ubicaciones con coordenadas válidas.</p>`;
        }

    } catch (error) {
        infoDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}
