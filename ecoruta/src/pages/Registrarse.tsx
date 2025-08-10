

function Registrarse(){

    return(
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div id="container" className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-2 text-gray-800">Registrarse</h1>
            <p className="text-center text-gray-600 mb-6">
            Por favor llena los campos para un registro exitoso
            </p>

            <form method="post" className="space-y-5">
            
            <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-1">Nombre</label>
                <input
                type="text"
                placeholder="Introduzca su nombre completo"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
            </div>
            
            <div className="flex flex-col">
                <label htmlFor="email" className="text-gray-700 font-medium mb-1">Email</label>
                <input
                type="email"
                placeholder="Ingresa el email"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
            </div>

            <div className="flex flex-col">
                <label htmlFor="password" className="text-gray-700 font-medium mb-1">
                Contraseña
                </label>
                <input
                type="password"
                placeholder="Introduzca su contraseña"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
            </div>

           
            

        
            {/* <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-1">Proveedor</label>
                <input
                type="text"
                placeholder="Proveedor"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
            </div>

            
            <div className="flex flex-col">
                <label className="text-gray-700 font-medium mb-1">Puntos</label>
                <input
                type="text"
                placeholder="Sus puntos son:"
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                />
            </div> */}

            <input
                type="submit"
                value="Registrarse"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer"
            />
            </form>
            <p className="text-center">Ya te registraste? {' '} <a href="/" className="text-blue-600 hover:underline">Inicia Sesión</a></p>
        </div>
        </div>

    )
}

export default Registrarse;