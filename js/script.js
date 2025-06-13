// Funciones de UI generales
function toggleMenu() {
  const menu = document.querySelector('.menu');
  menu.classList.toggle('abierta');
}

// Variables globales para almacenar las instancias de los mapas
let mapaPrincipalInstance = null;
let mapaHistorialInstance = null;
let mapaZonasInstance = null;

// Almacena las zonas seguras simuladas
let simulatedSafeZones = [];
// Almacena el círculo dibujado en el mapa de zonas
let currentZoneCircle = null;

// Variables para el modal de confirmación de contraseña
let pendingAction = null; // Guardará la función a ejecutar después de la confirmación
let pendingActionArgs = []; // Guardará los argumentos para esa función

function mostrarSeccion(id) {
  document.querySelectorAll('main section').forEach(sec => {
    sec.classList.add('seccion-oculta');
    sec.classList.remove('seccion-visible');
  });

  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('seccion-oculta');
    target.classList.add('seccion-visible');

    // Manejo especial para los mapas cuando su sección se hace visible
    if (id === 'historial') {
      if (!mapaHistorialInstance) {
        inicializarMapaHistorial();
      }
      if (mapaHistorialInstance) {
        mapaHistorialInstance.invalidateSize();
      }
    } else if (id === 'zonas') {
      if (!mapaZonasInstance) {
        inicializarMapaZonas();
      }
      if (mapaZonasInstance) {
        mapaZonasInstance.invalidateSize();
        cargarZonasGuardadas(); // Recargar zonas al mostrar la sección
      }
    } else if (id === 'mapa') {
      if (mapaPrincipalInstance) {
        mapaPrincipalInstance.invalidateSize();
      }
    } else if (id === 'configuracion') {
      cargarDatosCuidadorPaciente(); // Cargar datos al entrar a configuración
      // Asegurarse de que los formularios de configuración estén en modo de visualización al entrar
      setFormEditMode('form-cuidador', false);
      setFormEditMode('form-paciente', false);
    }
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  const mapDiv = document.getElementById('map');
  const datosUbicacionDiv = document.querySelector('.datos-ubicacion');
  const infoHistorialDiv = document.getElementById('info-historial');
  const mensajeZonaDiv = document.getElementById('mensaje-zona');
  const passwordConfirmModal = document.getElementById('passwordConfirmModal');
  const modalPasswordInput = document.getElementById('modalPasswordInput');
  const modalMessage = document.getElementById('modalMessage');

  if (!mapDiv) {
    console.error("El elemento con id 'map' (mapa principal) no fue encontrado.");
    return;
  }

  // SIMULACIÓN DE DATOS para el mapa principal
  const simulatedMapDataPrincipal = [
    {
      "id": "Lilygo 7070g ESP32",
      "latitud": 19.46846,
      "longitud": -99.03962,
      "fecha": "2025-05-31",
      "hora": "02:24:50",
      "descripcion": "Ubicación actual principal del paciente"
    }
  ];

  try {
    const ubicacionPrincipal = simulatedMapDataPrincipal[0];
    if (!ubicacionPrincipal) {
      console.warn("No hay datos de ubicación simulados para el mapa principal.");
      if (datosUbicacionDiv) {
        datosUbicacionDiv.innerHTML = '<p>No hay datos de ubicación disponibles para mostrar.</p>';
      }
      mapaPrincipalInstance = L.map('map').setView([19.46846, -99.03962], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapaPrincipalInstance);
      return;
    }

    mapaPrincipalInstance = L.map('map').setView([ubicacionPrincipal.latitud, ubicacionPrincipal.longitud], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapaPrincipalInstance);

    L.marker([ubicacionPrincipal.latitud, ubicacionPrincipal.longitud])
      .addTo(mapaPrincipalInstance)
      .bindPopup(`<b>${ubicacionPrincipal.descripcion}</b><br>Dispositivo: ${ubicacionPrincipal.id}<br>Fecha: ${ubicacionPrincipal.fecha} Hora: ${ubicacionPrincipal.hora}`)
      .openPopup();

    if (datosUbicacionDiv) {
      datosUbicacionDiv.innerHTML = `
        <p><strong>Fecha:</strong> ${ubicacionPrincipal.fecha}</p>
        <p><strong>Hora:</strong> ${ubicacionPrincipal.hora}</p>
        <p><strong>Latitud:</strong> ${ubicacionPrincipal.latitud}</p>
        <p><strong>Longitud:</strong> ${ubicacionPrincipal.longitud}</p>
        <p><strong>Dispositivo:</strong> ${ubicacionPrincipal.id}</p>
      `;
    }

  } catch (error) {
    console.error('Error al inicializar el mapa principal:', error);
    if (datosUbicacionDiv) {
      datosUbicacionDiv.innerHTML = '<p style="color: red;">Error al cargar los datos del mapa principal.</p>';
    }
    if (!mapaPrincipalInstance) {
      mapaPrincipalInstance = L.map('map').setView([19.46846, -99.03962], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapaPrincipalInstance);
    }
  }

  // LÓGICA PARA HISTORIAL DE UBICACIÓN
  const simulatedHistoricalData = [
    { "fecha": "2025-05-31", "latitud": 19.46846, "longitud": -99.03962, "id": "Lilygo 7070g ESP32", "hora": "02:12:27", "descripcion": "Última actualización del 31 de mayo" },
    { "fecha": "2025-05-30", "latitud": 19.46500, "longitud": -99.04200, "id": "Lilygo 7070g ESP32", "hora": "18:00:00", "descripcion": "Última actualización del 30 de mayo" },
    { "fecha": "2025-05-29", "latitud": 19.47000, "longitud": -99.03800, "id": "Lilygo 7070g ESP32", "hora": "10:00:00", "descripcion": "Última actualización del 29 de mayo" }
  ];

  function inicializarMapaHistorial() {
    const mapaHistorialDiv = document.getElementById('mapa-historial');
    if (mapaHistorialDiv && !mapaHistorialInstance) {
      mapaHistorialInstance = L.map('mapa-historial').setView([19.46846, -99.03962], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapaHistorialInstance);
      console.log('Mapa del historial inicializado.');
    }
  }

  const formHistorial = document.getElementById('form-historial');
  if (formHistorial) {
    formHistorial.addEventListener('submit', async function (event) {
      event.preventDefault();
      const fechaConsulta = document.getElementById('fechaConsulta').value;

      if (!fechaConsulta) {
        infoHistorialDiv.innerHTML = '<p style="color: red;">Por favor, selecciona una fecha.</p>';
        return;
      }

      infoHistorialDiv.innerHTML = '<p>Buscando historial para el ' + fechaConsulta + '...</p>';

      let ubicacionEncontrada = null;
      for (const data of simulatedHistoricalData) {
        if (data.fecha === fechaConsulta) {
          ubicacionEncontrada = data;
          break;
        }
      }

      if (ubicacionEncontrada) {
        if (!mapaHistorialInstance) {
          inicializarMapaHistorial();
        }
        if (mapaHistorialInstance.currentMarker) {
          mapaHistorialInstance.removeLayer(mapaHistorialInstance.currentMarker);
        }

        const lat = ubicacionEncontrada.latitud;
        const lng = ubicacionEncontrada.longitud;

        mapaHistorialInstance.setView([lat, lng], 15);

        const marker = L.marker([lat, lng])
          .addTo(mapaHistorialInstance)
          .bindPopup(`<b>${ubicacionEncontrada.descripcion}</b><br>Dispositivo: ${ubicacionEncontrada.id}<br>Fecha: ${ubicacionEncontrada.fecha} Hora: ${ubicacionEncontrada.hora}`)
          .openPopup();
        mapaHistorialInstance.currentMarker = marker;

        infoHistorialDiv.innerHTML = `
          <p><strong>Fecha:</strong> ${ubicacionEncontrada.fecha}</p>
          <p><strong>Hora de última actualización:</strong> ${ubicacionEncontrada.hora}</p>
          <p><strong>Latitud:</strong> ${ubicacionEncontrada.latitud}</p>
          <p><strong>Longitud:</strong> ${ubicacionEncontrada.longitud}</p>
          <p><strong>Dispositivo:</strong> ${ubicacionEncontrada.id}</p>
        `;
      } else {
        infoHistorialDiv.innerHTML = '<p style="color: orange;">No se encontraron datos de ubicación para la fecha seleccionada.</p>';
        if (mapaHistorialInstance.currentMarker) {
          mapaHistorialInstance.removeLayer(mapaHistorialInstance.currentMarker);
        }
      }
    });
  } else {
    console.warn("Formulario de historial (form-historial) no encontrado.");
  }


  // LÓGICA PARA ZONAS SEGURAS
  const dispositivoZonaSelect = document.getElementById('dispositivoZona');
  const nombreZonaInput = document.getElementById('nombreZona');
  const latitudZonaInput = document.getElementById('latitudZona');
  const longitudZonaInput = document.getElementById('longitudZona');
  const radioZonaInput = document.getElementById('radioZona');
  const btnGuardarZona = document.getElementById('btnGuardarZona');
  const listaZonasSegurasDiv = document.getElementById('lista-zonas-seguras');

  const simulatedRegisteredDevices = [
    { id: "Lilygo 7070g ESP32", nombre: "Lilygo Paciente A" },
    { id: "ESP32-GPS-002", nombre: "Dispositivo Paciente B" },
    { id: "Tracker-XYZ-003", nombre: "Localizador Paciente C" }
  ];

  function poblarDispositivosZona() {
    if (dispositivoZonaSelect) {
      // Limpiar opciones existentes antes de poblar
      dispositivoZonaSelect.innerHTML = '<option value="">-- Selecciona --</option>';
      simulatedRegisteredDevices.forEach(device => {
        const option = document.createElement('option');
        option.value = device.id;
        option.textContent = `${device.nombre} (${device.id})`;
        dispositivoZonaSelect.appendChild(option);
      });
    }
  }

  function inicializarMapaZonas() {
    const mapaZonasDiv = document.getElementById('mapa-zonas');
    if (mapaZonasDiv && !mapaZonasInstance) {
      mapaZonasInstance = L.map('mapa-zonas').setView([19.46846, -99.03962], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapaZonasInstance);
      console.log('Mapa de zonas inicializado.');

      mapaZonasInstance.on('click', function (e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;

        latitudZonaInput.value = lat;
        longitudZonaInput.value = lng;

        if (currentZoneCircle) {
          mapaZonasInstance.removeLayer(currentZoneCircle);
        }

        const radius = parseInt(radioZonaInput.value);
        currentZoneCircle = L.circle([lat, lng], {
          color: 'blue',
          fillColor: '#30f',
          fillOpacity: 0.2,
          radius: radius
        }).addTo(mapaZonasInstance).bindPopup(`Centro de la zona: ${lat.toFixed(5)}, ${lng.toFixed(5)}<br>Radio: ${radius}m`).openPopup();

        mensajeZonaDiv.textContent = `Centro de zona seleccionado: ${lat.toFixed(5)}, ${lng.toFixed(5)}. Radio: ${radius}m.`;
        mensajeZonaDiv.style.color = 'blue';
      });
    }
  }

  function cargarZonasGuardadas() {
    const storedZones = JSON.parse(localStorage.getItem('safeZones')) || [];
    simulatedSafeZones = storedZones;

    if (listaZonasSegurasDiv) {
      // Limpiar marcadores/círculos anteriores del mapa de zonas
      if (mapaZonasInstance) {
        mapaZonasInstance.eachLayer(function (layer) {
          if (layer instanceof L.Circle || layer instanceof L.Marker) {
            mapaZonasInstance.removeLayer(layer);
          }
        });
      }

      if (simulatedSafeZones.length === 0) {
        listaZonasSegurasDiv.innerHTML = '<p>No hay zonas seguras configuradas (simulado).</p>';
      } else {
        listaZonasSegurasDiv.innerHTML = '<h4>Tus zonas:</h4>';
        simulatedSafeZones.forEach((zone, index) => {
          const p = document.createElement('p');
          p.innerHTML = `<strong>${zone.nombre}</strong> para ${zone.dispositivoId}<br>Lat: ${zone.latitud.toFixed(5)}, Lng: ${zone.longitud.toFixed(5)} (Radio: ${zone.radio}m) <button class="delete-zone-btn" data-index="${index}">Eliminar</button>`;
          listaZonasSegurasDiv.appendChild(p);

          if (mapaZonasInstance) {
            L.circle([zone.latitud, zone.longitud], {
              color: 'purple',
              fillColor: '#800080',
              fillOpacity: 0.1,
              radius: zone.radio
            }).addTo(mapaZonasInstance).bindPopup(`${zone.nombre} (${zone.dispositivoId})`);
          }
        });
        document.querySelectorAll('.delete-zone-btn').forEach(button => {
          button.onclick = (e) => {
            const indexToDelete = parseInt(e.target.dataset.index);
            openPasswordConfirmModal(() => eliminarZona(indexToDelete));
          };
        });
      }
    }
  }

  window.eliminarZona = function (index) {
    if (simulatedSafeZones[index]) {
      simulatedSafeZones.splice(index, 1);
      localStorage.setItem('safeZones', JSON.stringify(simulatedSafeZones));
      cargarZonasGuardadas();
      mensajeZonaDiv.textContent = "Zona segura eliminada exitosamente.";
      mensajeZonaDiv.style.color = 'green';
    } else {
      mensajeZonaDiv.textContent = "Error: Zona no encontrada para eliminar.";
      mensajeZonaDiv.style.color = 'red';
    }
    closePasswordConfirmModal();
  };

  if (btnGuardarZona) {
    btnGuardarZona.addEventListener('click', function () {
      const dispositivoId = dispositivoZonaSelect.value;
      const nombreZona = nombreZonaInput.value.trim();
      const latitud = parseFloat(latitudZonaInput.value);
      const longitud = parseFloat(longitudZonaInput.value);
      const radio = parseInt(radioZonaInput.value);

      if (!dispositivoId || !nombreZona || isNaN(latitud) || isNaN(longitud) || isNaN(radio)) {
        mensajeZonaDiv.textContent = 'Por favor, completa todos los campos y selecciona un centro en el mapa.';
        mensajeZonaDiv.style.color = 'red';
        return;
      }

      const nuevaZona = {
        dispositivoId,
        nombre: nombreZona,
        latitud,
        longitud,
        radio
      };

      simulatedSafeZones.push(nuevaZona);
      localStorage.setItem('safeZones', JSON.stringify(simulatedSafeZones));

      mensajeZonaDiv.textContent = `Zona "${nombreZona}" guardada exitosamente.`;
      mensajeZonaDiv.style.color = 'green';

      nombreZonaInput.value = '';
      dispositivoZonaSelect.value = '';
      latitudZonaInput.value = '';
      longitudZonaInput.value = '';
      if (currentZoneCircle) {
        mapaZonasInstance.removeLayer(currentZoneCircle);
        currentZoneCircle = null;
      }
      cargarZonasGuardadas();
    });
  }


  // LÓGICA PARA LA SECCIÓN DE CONFIGURACIÓN
  const formCuidador = document.getElementById('form-cuidador');
  const mensajeCuidadorDiv = document.getElementById('mensaje-cuidador');
  const formPaciente = document.getElementById('form-paciente');
  const mensajePacienteConfigDiv = document.getElementById('mensaje-paciente-config');
  const formCambiarContrasena = document.getElementById('form-cambiar-contrasena');
  const mensajeCambiarContrasenaDiv = document.getElementById('mensaje-cambiar-contrasena');

  // Datos simulados de cuidador y paciente (se cargan al entrar a Configuración)
  // Nota: La contraseña está en texto plano SOLO para simulación. En real, ¡DEBE ESTAR HASHEADA!
  let simulatedCuidadorData = JSON.parse(localStorage.getItem('simulatedCuidador')) || {
    nombre: "Juan Perez",
    edad: 45,
    ocupacion: "Administrador",
    parentesco: "Hijo",
    correo: "cuidador@example.com",
    telefono: "5512345678",
    contrasena: "password" // Contraseña de prueba
  };

  let simulatedPacienteData = JSON.parse(localStorage.getItem('simulatedPaciente')) || {
    nombre: "Maria Lopez",
    edad: 80,
    direccion: "Av. Siempre Viva 742",
    telefono: "5587654321",
    idDispositivo: "Lilygo 7070g ESP32"
  };

  // Función para establecer el modo de edición de un formulario
  function setFormEditMode(formId, isEditing) {
    const form = document.getElementById(formId);
    if (!form) return;

    const inputs = form.querySelectorAll('input:not([type="hidden"]):not([readonly])');
    const saveBtn = form.querySelector('.save-btn');
    const cancelBtn = form.querySelector('.cancel-btn');
    const editBtn = form.closest('.config-section').querySelector('.edit-btn'); // Busca el botón de editar asociado

    inputs.forEach(input => {
      input.disabled = !isEditing;
    });

    if (saveBtn) saveBtn.style.display = isEditing ? 'inline-block' : 'none';
    if (cancelBtn) cancelBtn.style.display = isEditing ? 'inline-block' : 'none';
    if (editBtn) editBtn.style.display = isEditing ? 'none' : 'inline-block';

    // Limpiar mensajes al cambiar de modo
    const messageDiv = form.nextElementSibling; // Asumiendo que el p de mensaje es el siguiente hermano
    if (messageDiv && messageDiv.tagName === 'P') {
      messageDiv.textContent = '';
    }
  }

  // Listener para los botones de Editar
  document.querySelectorAll('.edit-btn').forEach(button => {
    button.addEventListener('click', function () {
      const formId = this.dataset.form; // 'cuidador' o 'paciente'
      setFormEditMode(`form-${formId}`, true);
    });
  });

  // Listener para los botones de Cancelar
  document.querySelectorAll('.cancel-btn').forEach(button => {
    button.addEventListener('click', function () {
      const formId = this.closest('form').id; // Obtiene el ID del formulario padre
      cargarDatosCuidadorPaciente(); // Recargar datos originales
      setFormEditMode(formId, false); // Volver a modo visualización
      // Limpiar mensajes de error
      const messageDiv = this.closest('form').nextElementSibling;
      if (messageDiv && messageDiv.tagName === 'P') {
        messageDiv.textContent = '';
      }
    });
  });


  // Función para cargar los datos en los formularios de configuración
  function cargarDatosCuidadorPaciente() {
    // Siempre cargar desde localStorage para reflejar los últimos cambios
    simulatedCuidadorData = JSON.parse(localStorage.getItem('simulatedCuidador')) || simulatedCuidadorData;
    simulatedPacienteData = JSON.parse(localStorage.getItem('simulatedPaciente')) || simulatedPacienteData;

    if (formCuidador) {
      document.getElementById('cuidadorNombre').value = simulatedCuidadorData.nombre;
      document.getElementById('cuidadorEdad').value = simulatedCuidadorData.edad;
      document.getElementById('cuidadorOcupacion').value = simulatedCuidadorData.ocupacion;
      document.getElementById('cuidadorParentesco').value = simulatedCuidadorData.parentesco;
      document.getElementById('cuidadorCorreo').value = simulatedCuidadorData.correo;
      document.getElementById('cuidadorTelefono').value = simulatedCuidadorData.telefono;
    }
    if (formPaciente) {
      document.getElementById('pacienteNombreConfig').value = simulatedPacienteData.nombre;
      document.getElementById('pacienteEdadConfig').value = simulatedPacienteData.edad;
      document.getElementById('pacienteDireccionConfig').value = simulatedPacienteData.direccion;
      document.getElementById('pacienteTelefonoConfig').value = simulatedPacienteData.telefono;
      document.getElementById('pacienteDispositivoConfig').value = simulatedPacienteData.idDispositivo;
    }
  }

  // Listeners para los formularios de actualización
  if (formCuidador) {
    formCuidador.addEventListener('submit', function (event) {
      event.preventDefault();
      // Paso 1: Abrir modal de confirmación
      openPasswordConfirmModal(() => {
        // Paso 2: Si la contraseña es correcta, ejecutar la lógica de actualización
        simulatedCuidadorData.nombre = document.getElementById('cuidadorNombre').value;
        simulatedCuidadorData.edad = parseInt(document.getElementById('cuidadorEdad').value);
        simulatedCuidadorData.ocupacion = document.getElementById('cuidadorOcupacion').value;
        simulatedCuidadorData.parentesco = document.getElementById('cuidadorParentesco').value;
        simulatedCuidadorData.correo = document.getElementById('cuidadorCorreo').value;
        simulatedCuidadorData.telefono = document.getElementById('cuidadorTelefono').value;

        localStorage.setItem('simulatedCuidador', JSON.stringify(simulatedCuidadorData));
        mensajeCuidadorDiv.textContent = 'Datos del cuidador actualizados exitosamente.';
        mensajeCuidadorDiv.style.color = 'green';
        setFormEditMode('form-cuidador', false); // Volver a modo visualización
        closePasswordConfirmModal();
      });
    });
  }

  if (formPaciente) {
    formPaciente.addEventListener('submit', function (event) {
      event.preventDefault();
      // Paso 1: Abrir modal de confirmación
      openPasswordConfirmModal(() => {
        // Paso 2: Si la contraseña es correcta, ejecutar la lógica de actualización
        simulatedPacienteData.nombre = document.getElementById('pacienteNombreConfig').value;
        simulatedPacienteData.edad = parseInt(document.getElementById('pacienteEdadConfig').value);
        simulatedPacienteData.direccion = document.getElementById('pacienteDireccionConfig').value;
        simulatedPacienteData.telefono = document.getElementById('pacienteTelefonoConfig').value;
        // idDispositivo NO se actualiza aquí, es readonly.
        localStorage.setItem('simulatedPaciente', JSON.stringify(simulatedPacienteData));
        mensajePacienteConfigDiv.textContent = 'Datos del paciente actualizados exitosamente.';
        mensajePacienteConfigDiv.style.color = 'green';
        setFormEditMode('form-paciente', false); // Volver a modo visualización
        closePasswordConfirmModal();
      });
    });
  }

  if (formCambiarContrasena) {
    formCambiarContrasena.addEventListener('submit', function (event) {
      event.preventDefault();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmNewPassword = document.getElementById('confirmNewPassword').value;

      if (currentPassword !== simulatedCuidadorData.contrasena) {
        mensajeCambiarContrasenaDiv.textContent = 'Contraseña actual incorrecta.';
        mensajeCambiarContrasenaDiv.style.color = 'red';
        return;
      }
      if (newPassword !== confirmNewPassword) {
        mensajeCambiarContrasenaDiv.textContent = 'Las nuevas contraseñas no coinciden.';
        mensajeCambiarContrasenaDiv.style.color = 'red';
        return;
      }
      if (newPassword.length < 6) { // Validación simple de longitud
        mensajeCambiarContrasenaDiv.textContent = 'La nueva contraseña debe tener al menos 6 caracteres.';
        mensajeCambiarContrasenaDiv.style.color = 'red';
        return;
      }

      // Simular actualización de contraseña
      simulatedCuidadorData.contrasena = newPassword; // En real: hashear y guardar
      localStorage.setItem('simulatedCuidador', JSON.stringify(simulatedCuidadorData));
      mensajeCambiarContrasenaDiv.textContent = 'Contraseña cambiada exitosamente.';
      mensajeCambiarContrasenaDiv.style.color = 'green';
      formCambiarContrasena.reset(); // Limpiar el formulario
    });
  }


  // LÓGICA DEL MODAL DE CONFIRMACIÓN DE CONTRASEÑA (expuestas globalmente)
  window.openPasswordConfirmModal = function (actionToExecute, ...args) {
    pendingAction = actionToExecute;
    pendingActionArgs = args;
    modalPasswordInput.value = '';
    modalMessage.textContent = '';
    passwordConfirmModal.style.display = 'flex';
  }

  window.closePasswordConfirmModal = function () {
    passwordConfirmModal.style.display = 'none';
    pendingAction = null;
    pendingActionArgs = [];
    modalMessage.textContent = ''; // Limpiar mensaje al cerrar
  }

  window.confirmPasswordAndProceed = function () {
    const enteredPassword = modalPasswordInput.value;
    if (enteredPassword === simulatedCuidadorData.contrasena) { // En real: comparar con el hash
      if (pendingAction) {
        pendingAction(...pendingActionArgs); // Ejecutar la acción pendiente
      }
    } else {
      modalMessage.textContent = 'Contraseña incorrecta.';
    }
  }


  // LÓGICA ADICIONAL PARA MANEJAR LA SECCIÓN INICIAL BASADA EN EL HASH DE LA URL
  const initialHash = window.location.hash.substring(1);
  if (initialHash) {
    mostrarSeccion(initialHash);
  } else {
    mostrarSeccion('mapa');
  }

  window.addEventListener('hashchange', () => {
    const newHash = window.location.hash.substring(1);
    if (newHash) {
      mostrarSeccion(newHash);
    } else {
      mostrarSeccion('mapa');
    }
  });

  // Inicializar la lista desplegable de dispositivos al cargar el DOM
  poblarDispositivosZona();
});