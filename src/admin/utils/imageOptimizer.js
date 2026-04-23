//src/admin/utils/imageOptimizer.js
function leerArchivoComoDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function calcularDimensiones(width, height, maxWidth, maxHeight) {
  if (!width || !height) {
    return { width: maxWidth, height: maxHeight };
  }

  const ratio = Math.min(1, maxWidth / width, maxHeight / height);

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function soportaWebp() {
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

export async function optimizarArchivoImagen(
  file,
  { maxWidth = 1600, maxHeight = 1600, quality = 0.82 } = {},
) {
  const originalDataUrl = await leerArchivoComoDataUrl(file);
  if (!originalDataUrl) return "";

  try {
    const image = await cargarImagen(originalDataUrl);
    const { width, height } = calcularDimensiones(
      image.naturalWidth || image.width,
      image.naturalHeight || image.height,
      maxWidth,
      maxHeight,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      return originalDataUrl;
    }

    context.drawImage(image, 0, 0, width, height);

    const mimeType = soportaWebp() ? "image/webp" : "image/jpeg";
    const optimizada = canvas.toDataURL(mimeType, quality);

    if (!optimizada || optimizada.length >= originalDataUrl.length) {
      return originalDataUrl;
    }

    return optimizada;
  } catch (error) {
    console.error("No se pudo optimizar la imagen en el navegador:", error);
    return originalDataUrl;
  }
}
