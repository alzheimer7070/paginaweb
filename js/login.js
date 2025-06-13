// js/login.js (versión mejorada)

document.getElementById('login-form').addEventListener('submit', async function (event) {
  event.preventDefault(); // Prevenir el envío tradicional

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const messageElement = document.getElementById('message');

  messageElement.textContent = ''; // Limpiar mensajes anteriores

  // Validación simple en el frontend
  if (!username || !password) {
    messageElement.textContent = 'Por favor, introduce tu usuario y contraseña.';
    messageElement.style.color = 'red';
    return;
  }

  try {
    const response = await fetch('https://mi-api-express.onrender.com/login', { // Asumiendo que esta será la ruta del backend
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: username, // El backend espera 'usuario'
        contrasena: password // El backend espera 'contrasena'
      }),
    });

    const data = await response.json();

    if (response.ok) {
      messageElement.textContent = data.message || 'Inicio de sesión exitoso. Redirigiendo...';
      messageElement.style.color = 'green';

      // Guardar estado de autenticación y ID de usuario si el backend lo envía
      localStorage.setItem('isAuthenticated', 'true');
      if (data.userId) {
        localStorage.setItem('userId', data.userId);
      }
      
      // Aquí podrías añadir la lógica para redirigir a registro-dispositivo.html
      // si el backend te informa que el usuario no tiene dispositivos.
      // Por ahora, redirigimos a la página principal.
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);

    } else { // Si el servidor responde con un error (ej. 401 Credenciales incorrectas)
      messageElement.textContent = data.mensaje || data.message || 'Usuario o contraseña incorrectos.';
      messageElement.style.color = 'red';
    }
  } catch (error) {
    console.error('Error en fetch:', error);
    messageElement.textContent = 'Error de conexión con el servidor.';
    messageElement.style.color = 'red';
  }
});