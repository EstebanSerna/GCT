import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import type { Rol } from "./lib/api";
import { Shell } from "./components/Shell";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Asistencia from "./pages/Asistencia";
import ContadorDashboard from "./pages/ContadorDashboard";
import Clientes from "./pages/Clientes";
import AdminDashboard from "./pages/AdminDashboard";
import Empleados from "./pages/Empleados";
import Futuro from "./pages/Futuro";

function Protegida({ children, roles }: { children: ReactNode; roles?: Rol[] }) {
  const { usuarioActual, cargandoSesion } = useApp();

  if (cargandoSesion) {
    return <div className="flex min-h-screen items-center justify-center bg-ink" />;
  }
  if (!usuarioActual) return <Navigate to="/portal" replace />;
  if (roles && !roles.includes(usuarioActual.rol)) return <Navigate to="/asistencia" replace />;

  return <Shell>{children}</Shell>;
}

function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/portal" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/asistencia" element={<Protegida><Asistencia /></Protegida>} />
      <Route path="/contador" element={<Protegida><ContadorDashboard /></Protegida>} />
      <Route path="/admin" element={<Protegida roles={["gerente", "super_admin"]}><AdminDashboard /></Protegida>} />
      <Route path="/empleados" element={<Protegida roles={["super_admin"]}><Empleados /></Protegida>} />
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
