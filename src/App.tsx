import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { Shell } from "./components/Shell";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ContadorDashboard from "./pages/ContadorDashboard";
import Clientes from "./pages/Clientes";
import AdminDashboard from "./pages/AdminDashboard";
import Futuro from "./pages/Futuro";

function Protegida({ children }: { children: React.ReactNode }) {
  const { usuarioActual } = useApp();
  if (!usuarioActual) return <Navigate to="/portal" replace />;
  return <Shell>{children}</Shell>;
}

function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/portal" element={<Login />} />
      <Route path="/contador" element={<Protegida><ContadorDashboard /></Protegida>} />
      <Route path="/admin" element={<Protegida><AdminDashboard /></Protegida>} />
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
