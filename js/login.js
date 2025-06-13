document.getElementById('login-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const messageElement = document.getElementById('message');

  // SIMULACIÓN DE LOGIN
  if (username === 'user' && password === 'password') { // Credenciales de prueba
    const simulatedUserId = '60c72b2f9f1b2c001f3e4d5a'; // Un ID de usuario simulado
    localStorage.setItem('userId', simulatedUserId);
    localStorage.setItem('isAuthenticated', 'true');

    // SIMULACIÓN DE VERIFICACIÓN DE DISPOSITIVO
    // Puedes cambiar esta lógica para simular diferentes escenarios:
    // true: el usuario ya tiene un dispositivo registrado
    // false: el usuario NO tiene un dispositivo registrado
    const simulatedHasDevice = false; // <-- CAMBIA ESTO PARA PROBAR AMBOS CASOS

    if (simulatedHasDevice) {
      messageElement.textContent = 'Inicio de sesión exitoso. Redirigiendo al mapa...';
      messageElement.style.color = 'green';
      setTimeout(() => {
        window.location.href = 'index.html'; // Redirige a la página principal con mapa
      }, 1000);
    } else {
      messageElement.textContent = 'Inicio de sesión exitoso. Parece que no tienes un dispositivo. Redirigiendo a registro de dispositivo...';
      messageElement.style.color = 'orange';
      setTimeout(() => {
        window.location.href = 'registro-dispositivo.html'; // Redirige a la página de registro de dispositivo
      }, 1000);
    }

  } else {
    messageElement.textContent = 'Usuario o contraseña incorrectos (simulado).';
    messageElement.style.color = 'red';
  }
});