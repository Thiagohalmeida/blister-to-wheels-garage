# Blister to Wheels Garage

## Sobre o Projeto

O Blister to Wheels Garage é uma aplicação web para colecionadores de miniaturas de carros (principalmente Hot Wheels) gerenciarem sua coleção. Com esta aplicação, os usuários podem catalogar suas miniaturas, visualizar estatísticas da coleção, e manter um registro organizado de todas as peças.

## Tecnologias Utilizadas

Este projeto é construído com:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Autenticação e Banco de Dados)
- React Query
- Tesseract.js (OCR para leitura de embalagens)

## Funcionalidades Principais

- **Dashboard**: Visualize estatísticas da sua coleção
- **Garage**: Explore e filtre sua coleção de miniaturas
- **Adicionar Miniatura**: Cadastre novas miniaturas com reconhecimento automático via OCR
- **Autenticação**: Sistema seguro de login/cadastro

## Como Executar o Projeto

Para executar este projeto localmente, você precisará ter Node.js e npm instalados.

```sh
# Passo 1: Clone o repositório
git clone https://github.com/Thiagohalmeida/blister-to-wheels-garage.git

# Passo 2: Navegue até o diretório do projeto
cd blister-to-wheels-garage

# Passo 3: Instale as dependências
npm install

# Passo 4: Inicie o servidor de desenvolvimento
npm run dev
```

## Estrutura do Projeto

- `/src`: Código fonte da aplicação
  - `/components`: Componentes reutilizáveis
  - `/hooks`: Custom hooks React
  - `/integrations`: Integrações com serviços externos (Supabase)
  - `/pages`: Páginas principais da aplicação
  - `/services`: Serviços da aplicação (OCR, etc)
  - `/utils`: Funções utilitárias

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests para melhorar o projeto.

## Licença

Este projeto está licenciado sob a licença MIT.
