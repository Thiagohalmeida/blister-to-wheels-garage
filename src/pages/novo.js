// src/pages/novo.js
import { useState } from "react";

export default function NovoCadastro() {
  const [codigo, setCodigo] = useState("");
  const [miniatura, setMiniatura] = useState({
    nome: "",
    marca: "",
    ano: "",
    imagem: "",
    descricao: ""
  });

  const handleCodigoChange = async (e) => {
    const value = e.target.value;
    setCodigo(value);

    if (value.length >= 6) {
      try {
        const res = await fetch(`/api/buscaPorCodigo?codigo=${value}`);
        if (!res.ok) throw new Error("Não encontrado");
        const data = await res.json();
        setMiniatura(data);
      } catch {
        setMiniatura({
          nome: "",
          marca: "",
          ano: "",
          imagem: "",
          descricao: ""
        });
      }
    }
  };

  return (
    <form>
      <label>
        Código da miniatura (UPC/EAN/Mattel):
        <input
          type="text"
          placeholder="Digite o código da miniatura"
          value={codigo}
          onChange={handleCodigoChange}
        />
      </label>
      <br />
      <label>
        Nome:
        <input
          type="text"
          placeholder="Nome"
          value={miniatura.nome}
          onChange={e => setMiniatura({ ...miniatura, nome: e.target.value })}
        />
      </label>
      <br />
      <label>
        Marca:
        <input
          type="text"
          placeholder="Marca"
          value={miniatura.marca}
          onChange={e => setMiniatura({ ...miniatura, marca: e.target.value })}
        />
      </label>
      <br />
      <label>
        Ano:
        <input
          type="text"
          placeholder="Ano"
          value={miniatura.ano}
          onChange={e => setMiniatura({ ...miniatura, ano: e.target.value })}
        />
      </label>
      <br />
      <label>
        Descrição:
        <input
          type="text"
          placeholder="Descrição"
          value={miniatura.descricao}
          onChange={e => setMiniatura({ ...miniatura, descricao: e.target.value })}
        />
      </label>
      <br />
      {miniatura.imagem && (
        <div>
          <img src={miniatura.imagem} alt="Foto miniatura" style={{ width: 120 }} />
        </div>
      )}
      {/* Campos e botões adicionais conforme seu projeto */}
    </form>
  );
}
