import './App.css'
import {Routes, Route, BrowserRouter as Router} from "react-router-dom"
import Home from "./pages/Home"
import Registrarse from "./pages/Registrarse"
import Login from './pages/Login'
import Rutas from './pages/formularioRuta'
import MapaSimple from './pages/ruta'
function App() {
  
  return (
    <>
      <Router>

        <Routes>
          <Route path='/' element={<Login/>} />
          <Route path='/registro' element={<Registrarse/>} />
          <Route path='/home' element={<Home/>} />
          <Route path='/rutas' element={<Rutas/>} />
          <Route path='/mapa' element={<MapaSimple/>} />

        </Routes>
      </Router>
    </>
  )
}

export default App
