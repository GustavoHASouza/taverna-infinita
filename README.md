# 🍺 Taverna Infinita: Crônicas do Caldeirão Dourado

Jogo mobile **Idle Tycoon RPG Cartoon** construído com **PixiJS v8 + React 19 + TypeScript + Tailwind CSS v4 + Zustand + `break_eternity.js`**.

## 📱 Como Jogar em Qualquer Celular (Sem Barra de Navegador)

### Opção 1 — App Web Instalável (PWA Tela Cheia — Android & iPhone)
1. Acesse no navegador do celular: **[`https://gustavohasouza.github.io/taverna-infinita/`](https://gustavohasouza.github.io/taverna-infinita/)**
2. Toque no botão **📲 Instalar** no topo do jogo (ou no menu do Chrome `⋮` → **"Instalar aplicativo"** / **"Adicionar à tela inicial"**; no Safari iOS: **Compartilhar → Adicionar à Tela de Início**).
3. O jogo cria um ícone nativo na tela do celular e abre **100% em Tela Cheia sem nenhuma barra de navegador**!
4. Dentro do jogo também há o botão azul **`⛶` (Tela Cheia)** no topo direito que esconde imediatamente a barra do navegador.

### Opção 2 — APK Nativo Android (Capacitor)
- O workflow automático do GitHub Actions (`.github/workflows/build-apk.yml`) compila o arquivo **`Taverna-Infinita.apk`** na nuvem e publica direto na aba **[Releases do GitHub](https://github.com/GustavoHASouza/taverna-infinita/releases)**.
- Basta baixar o `.apk` em qualquer celular Android e instalar.

### Opção 3 — Rodar Localmente
```bash
npm install
npm run dev
```
Acesse: `http://127.0.0.1:5173`

## ✨ Destaques do Jogo
- **Início Autêntico do Zero:** Começa com **0 moedas** e **0/s** — sirva as primeiras canecas tocando no salão para juntar 15 moedas e inaugurar o **Balcão de Hidromel**!
- **Cena Interativa PixiJS v8 (2D Cartoon):** 4 Biomas pintados à mão (*Brasa Clara*, *Estufa de Sylvandor*, *Forja de Khaz-Ouro* e *Observatório Astral*) + *Dimensões Ômega* infinitas, sprites animados de heróis, partículas e **Febre Dourada**.
- **Economia Balanceada (`break_eternity.js`):** 6 estações com marcos multiplicadores (`25, 50, 100...`), expansão estratégica de andares e **4 Camadas de Prestígio Infinito**.
- **Lore, Heróis & Raids:** Tutorial narrativo, 7 heróis colecionáveis e defesa contra a **Guilda do Sal Seco (Barão Malakor)**.
- **Loja Escalável (Modo Sandbox pronto para RevenueCat):** Anúncios premiados voluntários, Passe Sem Anúncios, Pacote do Aprendiz, Passe do Caldeirão, Clube VIP (24h offline), Cápsulas Temporais (Time-Warps dinâmicos) e Baús com Pity garantido.
