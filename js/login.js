// js/login.js (Versión Final y Segura)

document.addEventListener('DOMContentLoaded', function() {
    // A partir de aquí, todo el código se ejecuta solo cuando el HTML está 100% listo.

    const loginForm = document.getElementById('login-form');

    // Esta comprobación es útil si alguna vez usas este script en otra página por error.
    if (!loginForm) {
        return; 
    }

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const usuario = document.getElementById('username').value.trim();
        const contrasena = document.getElementById('password').value;
        const loginMessage = document.getElementById('message');

        loginMessage.textContent = ''; // Limpiamos mensajes anteriores

        try {
            const res = await fetch('https://mi-api-express.onrender.com/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, contrasena })
            });

            const data = await res.json();

            // Asumo que tu backend en caso de éxito devuelve { success: true, ... }
            if (res.ok && data.success) {
                loginMessage.textContent = `✅ Bienvenido, ${data.data.nombreCuidador}`;
                loginMessage.style.color = 'green';
                
                localStorage.setItem('usuario', JSON.stringify(data.data)); // Guardar datos del usuario
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
});