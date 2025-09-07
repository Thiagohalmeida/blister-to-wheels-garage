// src/pages/api/buscaPorCodigo.js
import miniatures from "@/data/miniatures_db.json"; // garanta que esse arquivo exista!

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Método não permitido" });
    return;
  }

  const { codigo } = req.query;
  if (!codigo) {
    res.status(400).json({ error: "Código não informado" });
    return;
  }

  // Busca local primeiro
  const local = miniatures.find(m => m.upc === codigo);
  if (local) {
    res.status(200).json(local);
    return;
  }

  // Busca online (fallback)
  const url = `https://api.upcitemdb.com/prod/trial/lookup?upc=${codigo}`;
  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();
    if (dados.items && dados.items.length > 0) {
      const item = dados.items[0];
      res.status(200).json({
        upc: codigo,
        name: item.title || "",
        brand: item.brand || "",
        year: item.attributes && item.attributes.year ? item.attributes.year : "",
        image_url: item.images ? item.images[0] : "",
        description: item.description || ""
      });
    } else {
      res.status(404).json({ error: "Miniatura não encontrada" });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro ao consultar código" });
  }
}
