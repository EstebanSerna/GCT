import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Shell } from "./components/Shell";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Asistencia from "./pages/Asistencia";
import ContadorDashboard from "./pages/ContadorDashboard";
import Clientes from "./pages/Clientes";
import AdminDashboard from "./pages/AdminDashboard";
import Empleados from "./pages/Empleados";
import Futuro from "./pages/Futuro";

function Protegida({ children, soloAdmin = false }: { children: ReactNode; soloAdmin?: boolean }) {
  const { usuarioActual, cargandoSesion } = useApp();

  if (cargandoSesion) {
    return <div className="flex min-h-screen items-center justify-center bg-ink" />;
  }
  if (!usuarioActual) return <Navigate to="/portal" replace />;
  if (soloAdmin && usuarioActual.rol !== "admin") return <Navigate to="/asistencia" replace />;

  return <Shell>{children}</Shell>;
}

function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/portal" element={<Login />} />
      <Route path="/asistencia" element={<Protegida><Asistencia /></Protegida>} />
      <Route path="/contador" element={<Protegida><ContadorDashboard /></Protegida>} />
      <Route path="/admin" element={<Protegida soloAdmin><AdminDashboard /></Protegida>} />
      <Route path="/empleados" element={<Protegida soloAdmin><Empleados /></Protegida>} />
      <Route path="/clientes" element={<Protegida><Clientes /></Protegida>} />
      <Route path="/futuro" element={<Protegida><Futuro /></Protegida>} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Rutas />
      </BrowserRouter>
    </AppProvider>
  );
}
