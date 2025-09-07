// src/utils/hotwheelsLookup.ts
import lookupData from "@/data/hotwheels_lookup.json";

interface MiniatureData {
  model_name: string;
  brand: string;
  launch_year: number | null;
  series: string;
  collection_number: string;
  base_color: string;
  acquisition_date: string;
  price_paid: number | null;
  condition: string;
  variants: string;
  is_treasure_hunt: boolean;
  is_super_treasure_hunt: boolean;
  personal_notes: string;
  upc?: string;
}

export function autoFillByModelOrUpc(data: Partial<MiniatureData>): Partial<MiniatureData> {
  if (!data.model_name && !data.upc) return {};

  // Busca por model_name OU por upc (ignora espaços e case)
  let found = (lookupData as any[]).find(
    item =>
      (data.model_name &&
        item.model_name.replace(/\s+/g, '').toLowerCase() ===
          data.model_name.replace(/\s+/g, '').toLowerCase()) ||
      (data.upc && item.upc === data.upc)
  );

  // Converte year para launch_year numérico se presente
  if (found && found.year) found.launch_year = Number(found.year);

  return found || {};
}
