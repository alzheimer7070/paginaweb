// Listener principal para el envío del formulario de creación de cuenta
document.getElementById('create-account-form').addEventListener('submit', async function (event) {
  event.preventDefault(); // Prevenir el envío tradicional del formulario

  const nombreCuidador = document.getElementById('nombreCuidador').value.trim();
  const edadValue = document.getElementById('edad').value.trim();
  const ocupacionValue = document.getElementById('ocupacion').value.trim();
  const parentescoValue = document.getElementById('parentesco').value.trim(); // 🟢 CORREGIDO
  const usuario = document.getElementById('usuario').value.trim();
  const passwordValue = document.getElementById('password').value;
  const confirmPasswordValue = document.getElementById('confirmPassword').value;
  const emailValue = document.getElementById('email').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const messageElement = document.getElementById('message');

  messageElement.textContent = '';

  // Validación de contraseñas
  if (passwordValue !== confirmPasswordValue) {
    messageElement.textContent = 'Las contraseñas no coinciden.';
    messageElement.style.color = 'red';
    return;
  }

  if (passwordValue.length < 8) {
    messageElement.textContent = 'La contraseña debe tener al menos 8 caracteres.';
    messageElement.style.color = 'red';
    return;
  }

  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(emailValue)) { // ✅ CORREGIDO
    messageElement.textContent = 'Por favor, introduce un correo electrónico válido.';
    messageElement.style.color = 'red';
    return;
  }

  try {
    const response = await fetch('https://mi-api-express.onrender.com/crear-cuenta', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombreCuidador: nombreCuidador,
        edadCuidador: parseInt(edadValue), // 🟢 Asegurarse de enviar como número
        ocupacionCuidador: ocupacionValue,
        parentescoCuidador: parentescoValue,
        usuario: usuario,
        contrasena: passwordValue,
        correo: emailValue,
        telefono: telefono
      }),
    });

    const data = await response.json();

    if (response.ok) {
      messageElement.textContent = data.message || 'Cuenta creada exitosamente. Redirigiendo...';
      messageElement.style.color = 'green';
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
    } else {
      messageElement.textContent = data.message || 'Ocurrió un error al crear la cuenta.';
      messageElement.style.color = 'red';
    }
  } catch (error) {
    console.error('Error en fetch:', error);
    messageElement.textContent = 'Error de conexión con el servidor. Intenta más tarde.';
    messageElement.style.color = 'red';
  }
});