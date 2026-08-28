// Redimensiona y comprime una foto en el navegador antes de mandarla al
// servidor como base64 — así una foto de 4-8 MB del celular queda en
// unos 30-80 KB, cómoda para guardar en la base de datos.
const TAMANO_MAX = 320;
const CALIDAD_JPEG = 0.82;

export function archivoAFotoBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const escala = Math.min(1, TAMANO_MAX / Math.max(img.width, img.height));
      const w = Math.round(img.width * escala);
      const h = Math.round(img.height * escala);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("No se pudo procesar la imagen."));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", CALIDAD_JPEG));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo leer la imagen. Intenta con otro archivo."));
    };

    img.src = url;
  });
}
