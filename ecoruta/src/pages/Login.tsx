import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import forest from "../assets/forest.jpg";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post("http://localhost:3333/auth/login", {
        email,
        password,
      });

      if (data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        console.log("Login exitoso:", data);
        if(data.user.es_admin==true){
          navigate("/homeAdmin");
        }else{
          navigate("/homeUser");
        }
        
      } else {
        setError("No se recibió un token del servidor.");
      }
    } catch (error: any) {
      console.error("Error en login:", error);
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError("Error al iniciar sesión. Intenta de nuevo.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-gray-100 bg-cover bg-center"
      style={{
        backgroundImage: `url(${forest})`,
      }}
    >
      <div className="w-full max-w-sm bg-gray-50/40 bg-opacity-90 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
          Inicio de sesión
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Email</label>
            <input
              type="email"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
              required
              disabled={loading}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
              placeholder="tu@email.com"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-gray-700 font-medium mb-1">Contraseña</label>
            <input
              type="password"
              onChange={(event) => setPassword(event.target.value)}
              value={password}
              required
              disabled={loading}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:ring-blue-300 disabled:bg-gray-100"
            />
          </div>

          <div className="text-right">
            <a href="#" className="text-sm text-blue-600 hover:underline">
              ¿Olvidó su contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Iniciando..." : "Iniciar"}
          </button>

          <div className="text-center text-sm text-gray-600">
            ¿Quieres poder{" "}
            <a href="/registro" className="text-blue-600 hover:underline">
              registrarte?
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
