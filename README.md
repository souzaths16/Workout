# Treino

App pessoal de força para hipertrofia, feito para o celular, em pt-BR. Programa de 6 sessões curtas (≈30 min) por semana com prioridade em braços e uma escada para a primeira barra fixa estrita. Toda prescrição segue uma hierarquia de evidência: **mulheres 40+ → mulheres → sexo misto/homens (extrapolado, sempre sinalizado no app)**. A tabela completa está em `src/domain/evidence.ts` e na aba Ajustes.

## Instalar no celular

1. Abra a URL do GitHub Pages do repositório (Settings → Pages → Source: *GitHub Actions*; o workflow `deploy.yml` publica a cada push na `main`).
2. No Safari/Chrome: *Compartilhar → Adicionar à Tela de Início*. Funciona offline.
3. Os dados ficam só no aparelho (`localStorage`). Exporte JSON/CSV em Ajustes de vez em quando.

## Desenvolvimento

```bash
npm install
npm run dev        # http://localhost:5173/Workout/
npm test           # motor de prescrição (vitest)
npm run build
node scripts/icons.mjs   # regenera os PNGs do ícone
npm run test:e2e   # smoke test Playwright em 390×844 (usa vite preview)
```

## Estrutura

- `src/domain/` — motor puro e testado: `prescribe` (dupla progressão com encaixe nos pesos que você tem), `recovery`, `week`, `sore` (troca de dia mantendo o total de séries e ≥48 h por grupo), `pullup`, `stats`, `exportImport`, mais os dados: `exercises`, `templates`, `pullupLadder`, `evidence`.
- `src/store/useStore.ts` — estado persistido (zustand + localStorage, versionado).
- `src/screens/` — Hoje, Semana, Progresso, Barra fixa, Corpo, Ajustes.
- `src/components/ui/` — componentes no padrão shadcn/ui.
