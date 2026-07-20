# Portfólio de cinema — Julia Marques Figueiroa

Primeira versão de um portfólio artístico para apresentar os trabalhos audiovisuais
de uma estudante de cinema. O projeto também foi pensado como uma introdução prática
a desenvolvimento web.

## Tecnologias

- HTML: estrutura e conteúdo da página;
- CSS: cores, tipografia, layout, responsividade e animações;
- JavaScript: menu mobile, animações de entrada e atualização automática do ano.

## Como executar

Use Node.js 22. Instale as dependências com `npm ci`, crie o `.env` conforme
`CMS_SETUP.md` e execute `npm run start`. Para validar conteúdo e sintaxe, use
`npm run check`; para gerar o site, use `npm run build`.

## Estrutura do projeto

```text
julia-marques-figueiroa/
├── src/_data/       # conteúdo global da página inicial
├── src/_includes/   # templates Nunjucks compartilhados
├── src/projetos/    # conteúdo canônico dos projetos
├── tina/            # schema e configuração do TinaCMS
├── imagens/         # originais enviados pelo CMS
├── src/js/          # módulos de interação do navegador
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

O `postinstall` aplica `patches/@tinacms+cli+2.5.6.patch`, um ajuste mínimo que torna
o Tina CLI compatível com as versões corrigidas de Vite e esbuild fixadas em
`package.json`. Remova o patch quando uma versão oficial do Tina CLI incorporar a
correção e mantenha `npm audit` e o build do painel como critérios para a atualização.

O workflow em `.github/workflows/pages.yml` executa validações, build do TinaCMS e
publicação do diretório `_site` no GitHub Pages. Consulte `CMS_SETUP.md` para configurar
as credenciais e o acesso editorial.
