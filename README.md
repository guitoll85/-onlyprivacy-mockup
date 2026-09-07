# OnlyPrivacy — mockup app

Mockup de plataforma estilo OnlyFans, usado como app fake pra filmar em set (tela de celular) e capturar interações pra pós-produção.

## Estrutura

- `src/App.jsx` — código-fonte principal (todas as telas: feed, perfil, mensagens, cadastro)
- `src/entry.jsx` — ponto de entrada que renderiza o App
- `public/` — HTML, manifest (PWA) e ícones para "Adicionar à Tela de Início" no iPhone
- `netlify.toml` — configuração de build do Netlify

## Como funciona o deploy

Este repositório está conectado ao Netlify via Git. Todo `git push` na branch principal dispara um novo build e publica automaticamente — não precisa mais fazer deploy manual.

## Desenvolvimento local

```bash
npm install
npm run build   # gera a pasta dist/ pronta pra servir
```

## Dados

Os dados (personagens, posts, mensagens) são salvos em tempo real no Firebase Firestore, sincronizados entre todos os celulares que abrirem o app.
