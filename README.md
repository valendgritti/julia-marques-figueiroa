# Portfólio de cinema — Julia Marques Figueiroa

Primeira versão de um portfólio artístico para apresentar os trabalhos audiovisuais
de uma estudante de cinema. O projeto também foi pensado como uma introdução prática
a desenvolvimento web.

## Tecnologias

- Eleventy e Nunjucks: geração das páginas HTML a partir do conteúdo canônico;
- TinaCMS: edição visual e gerenciamento dos projetos;
- CSS: cores, tipografia, layout, responsividade e animações;
- JavaScript: interações no navegador e scripts de build e validação;
- esbuild e Eleventy Image: minificação dos assets e geração de imagens responsivas.

## Como executar

Use Node.js 22. Instale as dependências com `npm ci`, crie o `.env` conforme
`CMS_SETUP.md` e execute `npm run start`. Para validar conteúdo e sintaxe, use
`npm run check`; para gerar o site e o painel do CMS, use `npm run build`.

O comando `npm run check` valida o conteúdo, os valores iniciais dos formulários do
TinaCMS, a renderização segura dos templates, a sintaxe e as dependências conhecidas
como vulneráveis.

## Estrutura do projeto

```text
julia-marques-figueiroa/
├── src/_data/       # conteúdo global da página inicial
├── src/_includes/   # templates Nunjucks compartilhados
├── src/projetos/    # conteúdo canônico dos projetos
├── tina/            # schema e configuração do TinaCMS
├── imagens/         # originais enviados pelo CMS
├── src/js/          # módulos de interação do navegador
├── scripts/         # tarefas de build e validações automatizadas
├── patches/         # correções temporárias aplicadas pelo patch-package
├── .github/workflows/ # integração contínua e publicação
├── styles.css       # fonte dos estilos compartilhados
├── fonts/           # fontes WOFF2 hospedadas localmente
└── _site/           # saída gerada, não versionada
```

## Fonte canônica

Edite conteúdo somente pelo TinaCMS ou nos arquivos de `src/`. Os HTMLs são gerados
pelo Eleventy e publicados a partir de `_site/`; nunca devem ser mantidos manualmente
na raiz ou em `projetos/`.

## Conteúdo e publicação

Os projetos são criados e ordenados no TinaCMS. O schema controla categorias,
modelos, URLs e campos obrigatórios. Durante o build, o Eleventy converte as imagens
originais para AVIF e WebP responsivos, gera as páginas, o sitemap e os metadados SEO.

CSS e JavaScript são minificados pelo esbuild e recebem hash no nome. O arquivo
`_headers` configura segurança e cache em provedores compatíveis, como Cloudflare
Pages e Netlify. O GitHub Pages ignora esse arquivo; nele, a CSP continua ativa pela
meta tag, mas headers HTTP e cache customizado exigem uma camada CDN ou migração.

O `postinstall` usa `patch-package` para aplicar automaticamente duas correções
temporárias compatíveis com as versões fixadas em `package.json`:

- `patches/@tinacms+cli+2.5.6.patch`: torna o Tina CLI compatível com as versões
  corrigidas de Vite e esbuild;
- `patches/tinacms+3.11.0.patch`: evita o bloqueio indevido ao navegar entre itens de
  formulários aninhados. A validação de conteúdo e de salvamento continua ativa.

Ao atualizar o TinaCMS, reavalie esses patches e remova cada um somente quando a
correção correspondente estiver disponível oficialmente. Depois da atualização,
execute `npm ci`, `npm run check`, `npm run build` e teste manualmente a criação e a
edição de itens aninhados no painel.

O workflow em `.github/workflows/pages.yml` executa validações, build do TinaCMS e
publicação do diretório `_site` no GitHub Pages. Consulte `CMS_SETUP.md` para configurar
as credenciais e o acesso editorial.
