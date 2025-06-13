document.getElementById('forgot-password-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  const emailOrPhone = document.getElementById('emailOrPhone').value;
  const messageElement = document.getElementById('message');

  try {
    const response = await fetch('https://mi-api-express.onrender.com/recuperar-contrasena', { // Ajusta la URL de tu API
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contacto: emailOrPhone }),
    });

    const data = await response.json();

    if (response.ok) {
      messageElement.textContent = data.mensaje;
      messageElement.style.color = 'green';
    } else {
      messageElement.textContent = data.mensaje || 'Ocurrió un error al intentar recuperar la contraseña.';
      messageElement.style.color = 'red';
    }
  } catch (error) {
    console.error('Error:', error);
    messageElement.textContent = 'Error de conexión con el servidor.';
    messageElement.style.color = 'red';
  }
});