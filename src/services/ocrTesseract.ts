// src/services/ocrTesseract.ts
import Tesseract from "tesseract.js";

/**
 * Extrai todo texto da imagem (não só números!).
 */
export async function extractAllTextFromImage(imageFile: File | string): Promise<string> {
  let imgSrc: string;
  if (typeof imageFile === "string") {
    imgSrc = imageFile;
  } else {
    imgSrc = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(imageFile);
    });
  }

  const { data: { text } } = await Tesseract.recognize(imgSrc, "eng", {
    logger: m => console.log(m),
  });

  return text;
}

/**
 * Busca os campos básicos no texto do OCR.
 */
export function parseMiniatureInfoFromText(text: string) {
  // Nome (linha toda em maiúsculo)
  const nameMatch = text.match(/^[A-Z0-9 \-]{5,}$/m);
  // Série (ex: HW ART CARS)
  const seriesMatch = text.match(/HW\s+[A-Z ]+/m);
  // Números (tipo 82/250, 4/10, etc.)
  const collectionNumberMatch = text.match(/(\d{1,3}\/\d{2,3})/);
  // UPC (12-13 dígitos juntos)
  const upcMatch = text.match(/(\d{12,13})/);

  return {
    model_name: nameMatch ? nameMatch[0].trim() : "",
    series: seriesMatch ? seriesMatch[0].trim() : "",
    collection_number: collectionNumberMatch ? collectionNumberMatch[0] : "",
    upc: upcMatch ? upcMatch[1] : "",
  };
}
