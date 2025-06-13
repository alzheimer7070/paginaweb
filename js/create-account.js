// js/create-account.js (versión mejorada y completa)

// Listener principal para el envío del formulario
document.getElementById('create-account-form').addEventListener('submit', async function (event) {
  event.preventDefault(); // Prevenir el envío tradicional del formulario

  // Obtener los valores de los campos del formulario
  const nombreCuidador = document.getElementById('nombreCuidador').value.trim();
  const edadValue = document.getElementById('edad').value.trim();
  const ocupacionValue = document.getElementById('ocupacion').value.trim();
  const parentescoValue = document.getElementById('parentesco').value.trim();
  const usuario = document.getElementById('usuario').value.trim();
  const passwordValue = document.getElementById('password').value;
  const confirmPasswordValue = document.getElementById('confirmPassword').value;
  const emailValue = document.getElementById('email').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const messageElement = document.getElementById('message');

  // Limpiar mensajes anteriores
  messageElement.textContent = '';

  // 1. Validación de contraseñas que no coinciden
  if (passwordValue !== confirmPasswordValue) {
    messageElement.textContent = 'Las contraseñas no coinciden.';
    messageElement.style.color = 'red';
    return;
  }

  // 2. Validación de longitud de contraseña
  if (passwordValue.length < 8) {
    messageElement.textContent = 'La contraseña debe tener al menos 8 caracteres.';
    messageElement.style.color = 'red';
    return;
  }

  // 3. Validación de formato de correo electrónico
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(emailValue)) {
    messageElement.textContent = 'Por favor, introduce un correo electrónico válido.';
    messageElement.style.color = 'red';
    return;
  }

  // 4. Intento de enviar los datos al servidor
  try {
    const response = await fetch('https://mi-api-express.onrender.com/crear-cuenta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // Construir el cuerpo de la petición usando las variables ya definidas
      body: JSON.stringify({
        nombreCuidador: nombreCuidador,
        edadCuidador: parseInt(edadValue), // Enviar la edad como número
        ocupacionCuidador: ocupacionValue,
        parentescoCuidador: parentescoValue,
        usuario: usuario,
        contrasena: passwordValue,
        correo: emailValue.toLowerCase(), // Es buena práctica guardar los correos en minúsculas
        telefono: telefono
      })
    });

    const data = await response.json(); // Leer la respuesta del servidor

    if (response.ok) { // Si el servidor respondió con éxito (ej. status 201)
      messageElement.textContent = data.message || 'Cuenta creada exitosamente. Redirigiendo...';
      messageElement.style.color = 'green';
      setTimeout(() => {
        window.location.href = 'login.html'; // Redirigir a login
      }, 2000);
    } else { // Si el servidor respondió con un error (ej. status 409 - usuario ya existe)
      messageElement.textContent = data.mensaje || data.message || 'Ocurrió un error al crear la cuenta.'; // Usamos data.mensaje por consistencia con tu API
      messageElement.style.color = 'red';
    }
  } catch (error) { // Si hay un error de red (ej. CORS o servidor caído)
    console.error('Error en fetch:', error);
    messageElement.textContent = 'Error de conexión con el servidor. Intenta más tarde.';
    messageElement.style.color = 'red';
  }
});

// Listener para la funcionalidad de "Mostrar Contraseña"
document.addEventListener('DOMContentLoaded', function() {
    const showPasswordCheckbox = document.getElementById('showPassword');
    if (showPasswordCheckbox) {
        showPasswordCheckbox.addEventListener('change', function () {
            const type = this.checked ? 'text' : 'password';
            document.getElementById('password').type = type;
            document.getElementById('confirmPassword').type = type;
        });
    }
});