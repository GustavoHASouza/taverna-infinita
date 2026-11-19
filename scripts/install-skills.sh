#!/usr/bin/env bash
set -euo pipefail

echo "=== Instalando Skills do Antigravity para Taverna Infinita ==="

# 1. Design Visual, UI/UX Premium & HUD de Jogos
npx skills add nextlevelbuilder/ui-ux-pro-max-skill --skill ui-ux-pro-max
npx skills add anthropics/skills --skill frontend-design
npx skills add anthropics/skills --skill canvas-design
npx skills add https://github.com/omer-metin/skills-for-antigravity --skill game-ui-design

# 2. Engine 2D (PixiJS v8), Arquitetura de Jogos & Performance Mobile
npx skills add pixijs/pixijs-skills
npx skills add sickn33/agentic-awesome-skills --skill game-development
npx skills add https://github.com/omer-metin/skills-for-antigravity --skill mobile-game-dev

# 3. Build Nativo Mobile (Capacitor) & Monetizacao Real (RevenueCat)
npx skills add capawesome-team/skills
npx skills add revenuecat/rc-claude-code-plugin

echo "=== Todas as skills foram instaladas com sucesso! ==="
