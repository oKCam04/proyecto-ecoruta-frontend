import { useNavigate } from "react-router-dom";

function Login(){
    const navigate=useNavigate()
    return(
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div id="formulario" className="w-full max-w-sm bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Inicio de sesión</h1>
            <form method="post" className="space-y-5">
   
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Nombre de usuario</label>
                    <input type="text"
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"/>
                </div>

    
                <div className="flex flex-col">
                    <label className="text-gray-700 font-medium mb-1">Contraseña</label>
                    <input
                    type="password"
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300"
                    />
                </div>

                <div className="text-right">
                    <a href="#" className="text-sm text-blue-600 hover:underline">
                    ¿Olvidó su contraseña?
                    </a>
                </div>

                <input type="submit" value="Iniciar"  onClick={(e)=>{e.preventDefault, navigate("/home")}}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer"/>

     
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