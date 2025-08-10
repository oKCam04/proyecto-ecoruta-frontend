import './App.css'
import {Routes, Route, BrowserRouter as Router} from "react-router-dom"
import Home from "./pages/Home"
import Registrarse from "./pages/Registrarse"
import Login from './pages/Login'
function App() {
  
  return (
    <>
      <Router>

        <Routes>
          <Route path='/' element={<Login/>} />
          <Route path='/registro' element={<Registrarse/>} />
          <Route path='/home' element={<Home/>} />

        </Routes>
      </Router>
    </>
  )
}

export default App
