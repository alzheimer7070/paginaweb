// Contenido COMPLETO para el archivo: js/login.js

// Se envuelve todo el código en este listener para asegurar que el HTML
// esté completamente cargado antes de que el script intente encontrar elementos.
document.addEventListener('DOMContentLoaded', function() {

    // Se busca el formulario una sola vez, aquí.
    const loginForm = document.getElementById('login-form');

    // Si por alguna razón el script se carga en una página que no
    // tiene este formulario, no se hace nada para evitar errores.
    if (!loginForm) {
        return;
    }

    // El resto de tu código va dentro del listener del formulario.
    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

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
                
                // Guardar datos del usuario para usarlos en otras páginas
                localStorage.setItem('usuario', JSON.stringify(data.data)); 
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
            console.error(err); // Es bueno registrar el error real en la consola
            loginMessage.textContent = 'Error al conectar con el servidor';
            loginMessage.style.color = 'red';
        }
    });

});