// Contenido para el archivo: js/login.js

document.getElementById('login-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const usuario = document.getElementById('loginUsuario').value.trim();
  const contrasena = document.getElementById('loginPassword').value;
  const loginMessage = document.getElementById('loginMessage');

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
      
      // Aquí deberías redirigir al dashboard principal
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