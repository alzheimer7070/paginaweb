// js/forgot-password.js (versión mejorada)

document.getElementById('forgot-password-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const emailOrPhone = document.getElementById('emailOrPhone').value.trim();
  const messageElement = document.getElementById('message');

  messageElement.textContent = ''; // Limpiar mensajes

  if (!emailOrPhone) {
    messageElement.textContent = 'Por favor, introduce tu correo o teléfono.';
    messageElement.style.color = 'red';
    return;
  }
  
  try {
    const response = await fetch('https://mi-api-express.onrender.com/recuperar-contrasena', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contacto: emailOrPhone }),
    });

    const data = await response.json();

    if (response.ok) {
      // Por seguridad, siempre es mejor mostrar un mensaje genérico.
      messageElement.textContent = 'Si tu cuenta existe, recibirás instrucciones para recuperar tu contraseña.';
      messageElement.style.color = 'green';
    } else {
      // Incluso en caso de error, el mensaje puede ser el mismo para no revelar si una cuenta existe o no.
      messageElement.textContent = 'Si tu cuenta existe, recibirás instrucciones para recuperar tu contraseña.';
      messageElement.style.color = 'green'; // Lo mostramos en verde para no confundir al usuario
    }
  } catch (error) {
    console.error('Error:', error);
    messageElement.textContent = 'Error de conexión con el servidor.';
    messageElement.style.color = 'red';
  }
});