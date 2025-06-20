// js/historial.js

const API_URL = 'https://mi-api-express.onrender.com';
let historialMapInstance = null;
let marcadoresActuales = [];

// --- FUNCIONES DE UI (necesarias para esta página) ---

function toggleMenu() {
    document.querySelector('.menu').classList.toggle('abierta');
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAuthenticated');
    window.location.href = 'login.html';
}

// Función para navegar a una sección específica en index.html desde el menú
function mostrarSeccionEnIndex(id) {
    window.location.href = `index.html#${id}`;
}


// --- LÓGICA PRINCIPAL ---

document.addEventListener("DOMContentLoaded", function () {
    // 1. Proteger la página: si no hay sesión, redirigir al login
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'login.html';
        return; // Detener la ejecución del script
    }

    // 2. Inicializar el mapa
    historialMapInstance = L.map('historial-map').setView([19.4326, -99.1332], 5); // Vista inicial general
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(historialMapInstance);

    // 3. Cargar el historial completo en el mapa al cargar la página
    cargarHistorialCompleto();
});


/**
 * Obtiene el historial completo de ubicaciones del usuario logueado
 * y lo muestra en el mapa.
 */
async function cargarHistorialCompleto() {
    const infoDiv = document.getElementById('historial-info');
    infoDiv.innerHTML = '<p>Cargando historial completo...</p>';

    // Limpiar marcadores anteriores si los hubiera
    marcadoresActuales.forEach(marker => historialMapInstance.removeLayer(marker));
    marcadoresActuales = [];

    try {
        // Obtener el usuario que inició sesión desde localStorage
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.usuario) {
            throw new Error("Sesión no válida. Por favor, inicie sesión de nuevo.");
        }

        // Llamar a la API para obtener todos los datos de ese usuario
        const response = await fetch(`${API_URL}/datos-ubicacion?usuario=${currentUser.usuario}`);
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "No se pudo cargar el historial.");
        }
        
        const ubicaciones = data.data;
        if (ubicaciones.length === 0) {
            throw new Error("No hay historial de ubicaciones para este usuario.");
        }

        const markerGroup = [];
        ubicaciones.forEach(punto => {
            const ubicacion = punto.ubicacion || punto.contenido;
            if(ubicacion && ubicacion.latitud && ubicacion.longitud) {
                // Convertir la fecha y hora a un formato válido
                const fechaValidaString = `${punto.fecha_dato}T${punto.hora_dato}Z`;
                const fecha = new Date(fechaValidaString);

                const marker = L.marker([ubicacion.latitud, ubicacion.longitud]).addTo(historialMapInstance);
                marker.bindPopup(`<b>Dispositivo:</b> ${punto.dispositivo}<br><b>Fecha:</b> ${fecha.toLocaleDateString('es-MX')}<br><b>Hora:</b> ${fecha.toLocaleTimeString('es-MX')}`);
                marcadoresActuales.push(marker);
                markerGroup.push([ubicacion.latitud, ubicacion.longitud]);
            }
        });
        
        if (markerGroup.length > 0) {
            // Ajustar el mapa para que todos los puntos sean visibles
            historialMapInstance.fitBounds(markerGroup); 
            infoDiv.innerHTML = `<p>Mostrando ${markerGroup.length} puntos del historial de ${currentUser.usuario}.</p>`;
        } else {
             infoDiv.innerHTML = `<p>No se encontraron ubicaciones con coordenadas válidas.</p>`;
        }

    } catch (error) {
        infoDiv.innerHTML = `<p style="color:red;">${error.message}</p>`;
    }
}