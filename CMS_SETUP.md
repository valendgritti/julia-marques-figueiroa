# Configuração do TinaCMS

O site continua estático. O TinaCloud autentica os editores e grava o conteúdo no
GitHub; o Eleventy gera `_site`; o GitHub Actions publica esse artefato no Pages.

## 1. Criar o projeto TinaCloud

1. Entre em <https://app.tina.io> e crie um projeto.
2. Conecte `valendgritti/julia-marques-figueiroa` e selecione a branch `main`.
3. Em **Overview**, copie o **Client ID**.
4. Em **Tokens**, crie e copie um **Read-only token**.
5. Cadastre como Site URL exatamente:
   `https://valendgritti.github.io/julia-marques-figueiroa/`

## 2. Cadastrar segredos no GitHub

No repositório, abra **Settings > Secrets and variables > Actions > New repository
secret** e crie:

- `NEXT_PUBLIC_TINA_CLIENT_ID`: Client ID do projeto TinaCloud;
- `TINA_TOKEN`: read-only token do TinaCloud.

O token nunca deve ser colocado no código. O Client ID é público e será incorporado
ao painel durante o build, como previsto pelo TinaCMS.

## 3. Publicar no GitHub Pages

1. Envie a configuração para a branch `main`.
2. Abra **Settings > Pages**.
3. Em **Build and deployment > Source**, escolha **GitHub Actions**.
4. Acompanhe o workflow **Publicar site** na aba **Actions**.

O painel será publicado em:

`https://valendgritti.github.io/julia-marques-figueiroa/admin/`

## 4. Dar acesso ao cliente sem conta GitHub

1. No TinaCloud, abra **User Management** e convide o e-mail da Julia.
2. Abra a área **Collaborators** do projeto e conceda acesso de edição.
3. A Julia confirma o cadastro TinaCloud pelo e-mail.
4. Ela entra diretamente no `/admin/`; não precisa ser colaboradora do GitHub.

Ao salvar, o TinaCloud grava o arquivo na branch configurada. O push dispara o
workflow do GitHub Pages automaticamente.

## 5. Editar conteúdo

- **Página inicial**: abertura, Trabalhos, Sobre e Contato.
- **Projetos > Create New**: cria um projeto em `src/projetos`.
- **Modelo do projeto**: ao criar um projeto, escolha narrativo, foto still,
  fotografia digital, vídeo vertical ou roteiro. Cada modelo mostra somente os
  campos compatíveis com aquele formato.
- Imagens são armazenadas em `imagens/uploads`.

Todo o HTML público é gerado pelo Eleventy a partir de `src/`. Não edite `_site/`
nem recrie HTMLs na raiz: o TinaCMS e os arquivos de `src/` são a fonte canônica.

## 6. Desenvolvimento local opcional

Use Node 22 LTS. O Node 24 no Windows ainda pode tentar compilar uma dependência
nativa do TinaCMS.

Crie `.env` (não é versionado):

```dotenv
NEXT_PUBLIC_TINA_CLIENT_ID=seu_client_id
TINA_TOKEN=seu_token_somente_leitura
NEXT_PUBLIC_TINA_BRANCH=main
```

Depois execute:

```sh
npm install
npm run start
```

Abra `http://localhost:8080/admin/index.html`. O uso de localhost é apenas para
manutenção; a Julia fará as edições no painel online.
