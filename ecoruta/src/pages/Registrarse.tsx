import { useState } from 'react';
import axios from 'axios';

function Registrarse(){
    // Estados locales para capturar lo que escribe el usuario
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    // Función que se ejecuta cuando el formulario hace submit
    const handleSubmit= async()=>{
        try{
            // Llamada POST al backend con Axios enviando los tres campos
            const respuesta= await axios.post('http://localhost:3000/users',{
                nombre, 
                email, 
                password
            });

            // Muestra en consola la respuesta del servidor
            console.log(respuesta.data);

            // Limpia los estados (resetea los inputs)
            setEmail('');
            setPassword('');
            setNombre('');
        }
        catch(error){
            // Si algo falla, muestra el error en consola
            console.error('Error al registrar el usuario:', error);
        }
    }

    return(
        // Contenedor centrado con Tailwind
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          {/* Tarjeta/box del formulario */}
          <div id="container" className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            {/* Encabezado */}
            <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Registrarse</h1>
            <p className="text-center text-gray-600 mb-6">
              Por favor llena los campos para un registro exitoso
            </p>

            {/* Formulario: dispara handleSubmit al hacer submit */}
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Campo: Nombre */}
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-1">Nombre</label>
                <input 
                  type="text" 
                  placeholder="Introduzca su nombre completo" 
                  onChange={(event)=> setNombre(event.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>
              
              {/* Campo: Email */}
              <div className="flex flex-col">
                <label htmlFor="email" className="text-gray-700 font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  placeholder="Ingresa el email"  
                  onChange={(event)=> setEmail(event.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>

              {/* Campo: Contraseña */}
              <div className="flex flex-col">
                <label htmlFor="password" className="text-gray-700 font-medium mb-1">
                  Contraseña
                </label>
                <input 
                  type="password" 
                  placeholder="Introduzca su contraseña"  
                  onChange={(event)=> setPassword(event.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
              </div>

              {/* Botón submit */}
              <button 
                type='submit' 
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer">
                Registrar
              </button>
            </form>

            {/* Enlace para ir a inicio de sesión */}
            <p className="text-center">
              Ya te registraste? {' '} 
              <a href="/" className="text-blue-600 hover:underline">Inicia Sesión</a>
            </p>
          </div>
        </div>
    )
}

export default Registrarse;
