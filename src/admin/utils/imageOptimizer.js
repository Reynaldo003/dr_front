function leerArchivoComoDataUrl(fileOrBlob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () =>
      reject(reader.error || new Error("No se pudo leer la imagen."));

    reader.readAsDataURL(fileOrBlob);
  });
}

function cargarImagenConImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () =>
      reject(new Error("El navegador no pudo cargar la imagen."));

    image.src = src;
  });
}

async function cargarImagen(src, file) {
  if (typeof createImageBitmap === "function" && file) {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        width: bitmap.width,
        height: bitmap.height,
        draw: (ctx, width, height) => {
          ctx.drawImage(bitmap, 0, 0, width, height);
          bitmap.close?.();
        },
      };
    } catch {
      // Algunos navegadores no soportan bien createImageBitmap para ciertos formatos.
    }
  }

  const image = await cargarImagenConImage(src);

  return {
    width: image.naturalWidth || image.width,
    height: image.naturalHeight || image.height,
    draw: (ctx, width, height) => {
      ctx.drawImage(image, 0, 0, width, height);
    },
  };
}

function calcularDimensiones(width, height, maxWidth, maxHeight) {
  if (!width || !height) {
    return {
      width: maxWidth,
      height: maxHeight,
    };
  }

  const ratio = Math.min(1, maxWidth / width, maxHeight / height);

  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

function canvasToBlob(canvas, mimeType, quality) {
  return new Promise((resolve) => {
    if (!canvas.toBlob) {
      resolve(null);
      return;
    }

    try {
      canvas.toBlob(
        (blob) => {
          resolve(blob || null);
        },
        mimeType,
        quality,
      );
    } catch {
      resolve(null);
    }
  });
}

async function convertirCanvasADataUrl(canvas, mimeType, quality) {
  const blob = await canvasToBlob(canvas, mimeType, quality);

  if (blob) {
    return leerArchivoComoDataUrl(blob);
  }

  try {
    return canvas.toDataURL(mimeType, quality);
  } catch {
    return "";
  }
}

function obtenerMimeSalida(file) {
  const tipo = String(file?.type || "").toLowerCase();

  if (tipo.includes("png")) {
    return "image/png";
  }

  return "image/jpeg";
}

export async function optimizarArchivoImagen(
  file,
  { maxWidth = 1400, maxHeight = 1400, quality = 0.82 } = {},
) {
  if (!file) return "";

  const tipo = String(file.type || "").toLowerCase();

  if (tipo && !tipo.startsWith("image/")) {
    throw new Error("El archivo seleccionado no es una imagen válida.");
  }

  const originalDataUrl = await leerArchivoComoDataUrl(file);

  if (!originalDataUrl) return "";

  try {
    const imagen = await cargarImagen(originalDataUrl, file);

    const { width, height } = calcularDimensiones(
      imagen.width,
      imagen.height,
      maxWidth,
      maxHeight,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    });

    if (!context) {
      return originalDataUrl;
    }

    const mimeType = obtenerMimeSalida(file);

    if (mimeType === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }

    imagen.draw(context, width, height);

    const optimizada = await convertirCanvasADataUrl(canvas, mimeType, quality);

    if (!optimizada) {
      return originalDataUrl;
    }

    if (optimizada.length >= originalDataUrl.length) {
      return originalDataUrl;
    }

    return optimizada;
  } catch (error) {
    console.error("No se pudo optimizar la imagen en este navegador:", error);
    return originalDataUrl;
  }
}
