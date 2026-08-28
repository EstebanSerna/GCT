import { useEffect, useState } from "react";
import { LogIn, LogOut, MapPin, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { api, ApiError, type RegistroAsistencia } from "../lib/api";

function horaDe(iso: string) {
  return new Date(iso).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
}

function obtenerUbicacion(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Este dispositivo o navegador no soporta ubicación GPS."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  });
}

function mensajeErrorGeo(err: unknown): string {
  if (err instanceof GeolocationPositionError) {
    if (err.code === err.PERMISSION_DENIED) {
      return "No diste permiso de ubicación. Actívalo en los ajustes del navegador/app e intenta de nuevo.";
    }
    if (err.code === err.TIMEOUT) {
      return "Se tardó demasiado en obtener tu ubicación. Intenta de nuevo con mejor señal GPS.";
    }
    return "No se pudo obtener tu ubicación. Intenta de nuevo.";
  }
  return err instanceof Error ? err.message : "No se pudo obtener tu ubicación.";
}

export default function Asistencia() {
  const { usuarioActual } = useApp();
  const [registros, setRegistros] = useState<RegistroAsistencia[]>([]);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [marcando, setMarcando] = useState<"entrada" | "salida" | null>(null);
  const [aviso, setAviso] = useState<{ tipo: "ok" | "fuera" | "error"; texto: string } | null>(null);

  useEffect(() => {
    api
      .asistenciaHoy()
      .then(({ records }) => setRegistros(records))
      .catch(() => setAviso({ tipo: "error", texto: "No se pudo cargar tu historial de hoy." }))
      .finally(() => setCargandoLista(false));
  }, []);

  const yaMarco = (tipo: "entrada" | "salida") => registros.some((r) => r.tipo === tipo);

  async function marcar(tipo: "entrada" | "salida") {
    setAviso(null);
    setMarcando(tipo);
    try {
      const posicion = await obtenerUbicacion();
      const { record } = await api.marcar(
        tipo,
        posicion.coords.latitude,
        posicion.coords.longitude,
        posicion.coords.accuracy
      );
      setRegistros((prev) => [...prev, record]);
      setAviso(
        record.dentro_de_rango
          ? { tipo: "ok", texto: `${tipo === "entrada" ? "Entrada" : "Salida"} registrada a las ${horaDe(record.registrado_en)} — dentro del rango de la oficina.` }
          : {
              tipo: "fuera",
              texto: `${tipo === "entrada" ? "Entrada" : "Salida"} registrada a las ${horaDe(record.registrado_en)}, pero estás a ${Math.round(record.distancia_oficina_metros)} m de la oficina.`,
            }
      );
    } catch (err) {
      const texto = err instanceof ApiError ? err.message : mensajeErrorGeo(err);
      setAviso({ tipo: "error", texto });
    } finally {
      setMarcando(null);
    }
  }

  return (
    <div className="mx-auto max-w-md px-5 py-8 sm:px-8 sm:py-10">
      <p className="font-mono text-[11px] uppercase tracking-wider text-ash">
        {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">
        Hola, {usuarioActual?.nombre.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-ash">Marca tu entrada y salida del día.</p>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() => marcar("entrada")}
          disabled={marcando !== null || yaMarco("entrada")}
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-folio-green/30 bg-folio-green/5 px-5 py-7 text-center transition-colors hover:bg-folio-green/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {marcando === "entrada" ? (
            <Loader2 size={26} className="animate-spin text-folio-green" />
          ) : (
            <LogIn size={26} className="text-folio-green" />
          )}
          <span className="font-display text-base font-semibold text-ink">
            {yaMarco("entrada") ? "Entrada marcada" : "Marcar entrada"}
          </span>
          {yaMarco("entrada") && (
            <span className="font-mono text-xs text-ash">
              {horaDe(registros.find((r) => r.tipo === "entrada")!.registrado_en)}
            </span>
          )}
        </button>

        <button
          onClick={() => marcar("salida")}
          disabled={marcando !== null || !yaMarco("entrada") || yaMarco("salida")}
          className="flex flex-col items-center gap-2 rounded-2xl border-2 border-magenta/30 bg-magenta/5 px-5 py-7 text-center transition-colors hover:bg-magenta/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {marcando === "salida" ? (
            <Loader2 size={26} className="animate-spin text-magenta" />
          ) : (
            <LogOut size={26} className="text-magenta" />
          )}
          <span className="font-display text-base font-semibold text-ink">
            {yaMarco("salida") ? "Salida marcada" : "Marcar salida"}
          </span>
          {yaMarco("salida") && (
            <span className="font-mono text-xs text-ash">
              {horaDe(registros.find((r) => r.tipo === "salida")!.registrado_en)}
            </span>
          )}
        </button>
      </div>

      {!yaMarco("entrada") && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-ash">
          <MapPin size={13} /> Vamos a pedirte permiso de ubicación para confirmar que estás en la oficina.
        </p>
      )}

      {aviso && (
        <div
          className={`mt-5 flex items-start gap-2.5 rounded-lg border px-4 py-3 text-sm ${
            aviso.tipo === "ok"
              ? "border-folio-green/30 bg-folio-green/5 text-folio-green"
              : aviso.tipo === "fuera"
                ? "border-folio-amber/30 bg-folio-amber/5 text-folio-amber"
                : "border-folio-red/30 bg-folio-red/10 text-folio-red"
          }`}
        >
          {aviso.tipo === "ok" ? (
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          ) : (
            <AlertTriangle size={17} className="mt-0.5 shrink-0" />
          )}
          <span>{aviso.texto}</span>
        </div>
      )}

      <div className="mt-10">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-ash">Hoy</p>
        {cargandoLista ? (
          <p className="text-sm text-ash">Cargando...</p>
        ) : registros.length === 0 ? (
          <p className="rounded-lg border border-dashed border-ash-light px-5 py-6 text-center text-sm text-ash">
            Todavía no has marcado nada hoy.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {registros.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-ink/10 bg-white/60 px-4 py-3"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-ink">
                  {r.tipo === "entrada" ? (
                    <LogIn size={15} className="text-folio-green" />
                  ) : (
                    <LogOut size={15} className="text-magenta" />
                  )}
                  {r.tipo === "entrada" ? "Entrada" : "Salida"}
                </span>
                <span className="font-mono text-xs text-ash">{horaDe(r.registrado_en)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
