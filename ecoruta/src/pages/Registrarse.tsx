import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Configurar axios para enviar cookies automáticamente
axios.defaults.withCredentials = true;

function Registrarse(){
    const navigate = useNavigate();
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // URL para usar el endpoint de registro de auth
            const respuesta = await axios.post('http://localhost:3333/auth/register', {
                nombre, 
                email, 
                password
            });

            console.log('Registro exitoso:', respuesta.data);
            setSuccess('¡Usuario registrado exitosamente! Redirigiendo...');
            
            // Limpiar formulario
            setEmail('');
            setPassword('');
            setNombre('');

            // Navegar automáticamente al home después de 2 segundos
            setTimeout(() => {
                navigate('/home');
            }, 2000);

        } catch (error: any) {
            console.error('Error al registrar el usuario:', error);
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else if (error.response?.data?.error) {
                setError(error.response.data.error);
            } else {
                setError('Error al registrar. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    }

    return(
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
          <div id="container" className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Registrarse</h1>
            <p className="text-center text-gray-600 mb-6">
              Por favor llena los campos para un registro exitoso
            </p>

            {/* Mostrar mensajes de error o éxito */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-1">Nombre</label>
                <input 
                  type="text" 
                  placeholder="Introduzca su nombre completo" 
                  value={nombre}
                  onChange={(event) => setNombre(event.target.value)}
                  required
                  disabled={loading}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
                />
              </div>
              
              <div className="flex flex-col">
                <label htmlFor="email" className="text-gray-700 font-medium mb-1">Email</label>
                <input 
                  type="email" 
                  placeholder="Ingresa el email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  disabled={loading}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="password" className="text-gray-700 font-medium mb-1">
                  Contraseña
                </label>
                <input 
                  type="password" 
                  placeholder="Introduzca su contraseña"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={loading}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
                />
              </div>

              <button 
                type='submit' 
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed">
                {loading ? 'Registrando...' : 'Registrar'}
              </button>
            </form>

            <p className="text-center mt-4">
              ¿Ya te registraste? {' '} 
              <a href="/" className="text-blue-600 hover:underline">Inicia Sesión</a>
            </p>
          </div>
        </div>
    )
}

export default Registrarse;