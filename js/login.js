// js/login.js

document.addEventListener('DOMContentLoaded', function() {
    
    const loginForm = document.getElementById('login-form');

    // Si no se encuentra el formulario en la página, no se ejecuta nada.
    if (!loginForm) {
        return; 
    }

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Se usan los IDs 'username' y 'password' que existen en tu login.html
        const usuario = document.getElementById('username').value.trim();
        const contrasena = document.getElementById('password').value;
        const messageElement = document.getElementById('message');
        
        messageElement.textContent = 'Verificando...';
        messageElement.style.color = 'gray';

        try {
            const response = await fetch('https://mi-api-express.onrender.com/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ usuario, contrasena })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                messageElement.textContent = `✅ ¡Bienvenido, ${data.data.nombreCuidador}!`;
                messageElement.style.color = 'green';
                
                // --- PASO CLAVE: Guardar los datos del usuario que inició sesión ---
                localStorage.setItem('currentUser', JSON.stringify(data.data)); 
                localStorage.setItem('isAuthenticated', 'true');

                // Redirigir al dashboard principal después de un momento
                setTimeout(() => {
                    window.location.href = 'index.html'; 
                }, 1500);

            } else {
                messageElement.textContent = data.message || 'Credenciales inválidas.';
                messageElement.style.color = 'red';
            }
        } catch (err) {
            console.error('Error de conexión en login:', err);
            messageElement.textContent = 'Error al conectar con el servidor. Inténtalo más tarde.';
            messageElement.style.color = 'red';
        }
    });
});
