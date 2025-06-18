// js/script.js

// --- VARIABLES GLOBALES Y FUNCIONES DE UI ---
const API_URL = 'https://mi-api-express.onrender.com';
let mapaPrincipalInstance = null;
let marcadoresActuales = []; 

function toggleMenu() {
    document.querySelector('.menu').classList.toggle('abierta');
}

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

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'login.html';
}

// --- LÓGICA PRINCIPAL DEL DASHBOARD ---

document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'login.html';
        return;
    }

    mapaPrincipalInstance = L.map('map').setView([19.4326, -99.1332], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapaPrincipalInstance);

    document.getElementById('btn-actualizar-ubicacion')?.addEventListener('click', cargarUltimaUbicacion);
    document.getElementById('btn-mostrar-historial')?.addEventListener('click', cargarHistorialCompleto);

    cargarUltimaUbicacion();
});

// --- FUNCIONES DEL MAPA ---

function limpiarMarcadores() {
    marcadoresActuales.forEach(marker => mapaPrincipalInstance.removeLayer(marker));
    marcadoresActuales = [];
}

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

        const ultimoDato = ubicaciones[0];
        const ubicacion = ultimoDato.ubicacion;

        // --- CORRECCIÓN DE ZONA HORARIA ---
        // Se añade una 'Z' al final para indicar que la hora es UTC
        const fechaValidaString = `${ultimoDato.fecha_dato}T${ultimoDato.hora_dato}Z`;
        const fecha = new Date(fechaValidaString);
        
        const lat = ubicacion.latitud;
        const lng = ubicacion.longitud;

        mapaPrincipalInstance.setView([lat, lng], 16);
        const marker = L.marker([lat, lng]).addTo(mapaPrincipalInstance);
        
        marker.bindPopup(`<b>Última Ubicación</b><br>Dispositivo: ${ultimoDato.dispositivo}<br>Fecha: ${fecha.toLocaleDateString('es-MX')}<br>Hora: ${fecha.toLocaleTimeString('es-MX')}`).openPopup();
        marcadoresActuales.push(marker);

        infoDiv.innerHTML = `
    <p><strong>Dispositivo:</strong> ${ultimoDato.dispositivo}</p>
    <p><strong>Fecha:</strong> ${fecha.toLocaleDateString('es-MX')}</p>
    <p><strong>Hora:</strong> ${fecha.toLocaleTimeString('es-MX')}</p>
`;
    } catch (error) {
        infoDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}

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
                // --- CORRECCIÓN DE ZONA HORARIA ---
                // Se añade una 'Z' al final para indicar que la hora es UTC
                const fechaValidaString = `${punto.fecha_dato}T${punto.hora_dato}Z`;
                const fecha = new Date(fechaValidaString);

                const marker = L.marker([ubicacion.latitud, ubicacion.longitud]).addTo(mapaPrincipalInstance);
                marker.bindPopup(`<b>Dispositivo:</b> ${punto.dispositivo}<br><b>Fecha:</b> ${fecha.toLocaleDateString('es-MX')}<br><b>Hora:</b> ${fecha.toLocaleTimeString('es-MX')}`);
                marcadoresActuales.push(marker);
                markerGroup.push([ubicacion.latitud, ubicacion.longitud]);
            }
        });
        
        if (markerGroup.length > 0) {
            mapaPrincipalInstance.fitBounds(markerGroup);
            infoDiv.innerHTML = `<p>Mostrando ${markerGroup.length} puntos del historial de ${currentUser.usuario}.</p>`;
        } else {
             infoDiv.innerHTML = `<p>No se encontraron ubicaciones con coordenadas válidas.</p>`;
        }
    } catch (error) {
        infoDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}
