<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Criador de Site (Vite + Firebase Hosting + Functions)

## Rodar localmente

**Pré-requisitos:** Node.js 20+, Firebase CLI.

1. Instale dependências da raiz:
   `npm install`
2. Instale dependências das functions:
   `npm --prefix functions install`
3. Rode o app:
   `npm run dev`

## Deploy (garantindo últimas mudanças)

> As últimas mudanças não apareciam porque em muitos fluxos o `dist` fica desatualizado.
> Agora o projeto está com `predeploy` para build automático no Hosting.

### 1) Login no Firebase
`firebase login`

### 2) Configurar secret da Function (uma vez por projeto)
`firebase functions:secrets:set GEMINI_KEY`

### 3) (Opcional) Habilitar criação automática de repositório GitHub
Defina `GITHUB_TOKEN` como variável de ambiente no runtime/CI (não é obrigatório para deploy).

### 4) Deploy completo (hosting + functions)
`firebase deploy --only hosting,functions`

## Observações

- O `firebase.json` está configurado para executar `npm run build` antes do deploy do Hosting.
- `GEMINI_KEY` continua no Secret Manager (`defineSecret`).
- `GITHUB_TOKEN` é opcional: se ausente, o app salva o projeto no Firestore e marca GitHub como pendente.
