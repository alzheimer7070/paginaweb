// Contenido CORREGIDO para el archivo: js/login.js

document.getElementById('login-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  // ----- CORRECCIÓN AQUÍ -----
  // Usamos los IDs 'username' y 'password' que existen en tu login.html
  const usuario = document.getElementById('username').value.trim();
  const contrasena = document.getElementById('password').value;
  // Usamos el ID 'message' que existe en tu login.html
  const loginMessage = document.getElementById('message');
  loginMessage.textContent = ''; // Limpiamos mensajes anteriores

  try {
    const res = await fetch('https://mi-api-express.onrender.com/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contrasena })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      loginMessage.textContent = `✅ Bienvenido, ${data.data.nombreCuidador}`;
      loginMessage.style.color = 'green';
      localStorage.setItem('usuario', JSON.stringify(data.data)); // Guardar sesión
      localStorage.setItem('isAuthenticated', 'true'); // Guardar estado de autenticación

      // Redirigir al dashboard principal después de un momento
      setTimeout(() => {
          window.location.href = 'index.html'; 
      }, 1500);

    } else {
      loginMessage.textContent = data.message || 'Credenciales inválidas';
      loginMessage.style.color = 'red';
    }
  } catch (err) {
    loginMessage.textContent = 'Error al conectar con el servidor';
    loginMessage.style.color = 'red';
  }
});