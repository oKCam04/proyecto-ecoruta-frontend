import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import axios from 'axios';

function Login(){
    // Hook para navegar programáticamente entre rutas
    const navigate = useNavigate();

    // Estados locales para capturar email y contraseña
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Manejador del submit del formulario
    const handleLogin = async (event: any) => {
        event.preventDefault(); // evita el submit nativo y la recarga

        // Petición POST al endpoint /login con los datos del formulario
        const respuesta = await axios.post('http://localhost:3000/login', {
            correo: email, 
            password: password
        });

        // Si hay respuesta (objeto de axios), navega a /home
        // Nota: axios lanza error en códigos no 2xx, por lo que este if se evalúa con la respuesta recibida.
        if (respuesta) { 
            navigate('/home');
        } else {
            alert('Error al iniciar sesión, por favor intente de nuevo');
        }
    };

    return(
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div id="formulario" className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
            {/* Título */}
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Inicio de sesión</h1>

            {/* Formulario: ejecuta handleLogin al enviar */}
            <form onSubmit={handleLogin} className="space-y-5">
   
                {/* Campo: Nombre de usuario (email en este caso) */}
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Nombre de usuario</label>
                    <input 
                      type="text" 
                      onChange={(event)=>{ setEmail(event.target.value) }} 
                      value={email}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>

                {/* Campo: Contraseña */}
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Contraseña</label>
                    <input 
                      type="password" 
                      onChange={(event)=>{ setPassword(event.target.value) }} 
                      value={password}
                      className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>

                {/* Enlace de “olvidó su contraseña” */}
                <div className="text-right">
                    <a href="#" className="text-sm text-blue-600 hover:underline">
                      ¿Olvidó su contraseña?
                    </a>
                </div>

                {/* Botón de envío */}
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer">
                    Iniciar
                </button>
     
                {/* Enlace a registro */}
                <div className="text-center text-sm text-gray-600">
                    ¿Quieres poder{' '}
                    <a href="/registro" className="text-blue-600 hover:underline">
                      registrarte?
                    </a>
                </div>
            </form>
        </div>
      </div>
    )
}

export default Login;
