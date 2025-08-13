import './App.css'
import { Routes, Route, BrowserRouter as Router } from "react-router-dom"
import Home from "./pages/Home"
import HomeAdmin from "./Admin/pages/HomeAdmin"
import Registrarse from "./pages/Registrarse"
import Login from './pages/Login'
import Rutas from './User/pages/RutaUser'
import MapaSimple from './Admin/pages/Ruta'
import Premios from './User/pages/Premios'
function App() {

  return (
    <>
      <Router>

        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/registro' element={<Registrarse />} />
          <Route path='/login' element={<Login />} />
          <Route path='/homeUser' element={<Home />} />
          <Route path='/homeAdmin' element={<HomeAdmin />} />
          <Route path='/rutas' element={<Rutas />} />
          <Route path='/mapa' element={<MapaSimple />} />
          <Route path='/premios' element={<Premios />} />

        </Routes>
      </Router>
    </>
  )
}

export default App
