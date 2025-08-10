import { Leaf } from "lucide-react";

function Navbar(){
    return(
         <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/70 border-b border-emerald-100">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-emerald-600" />
            <span className="font-semibold">EcoRutas</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#features" className="hover:text-emerald-700">Características</a>
            <a href="#como-funciona" className="hover:text-emerald-700">Cómo funciona</a>
            <a href="#impacto" className="hover:text-emerald-700">Impacto</a>
          </nav>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-xl text-sm font-medium hover:bg-emerald-50">Ingresar</button>
            <button className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 shadow">Crear cuenta</button>
          </div>
        </div>
      </header>
    )
}

export default Navbar;