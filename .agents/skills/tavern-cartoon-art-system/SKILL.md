---
name: tavern-cartoon-art-system
description: >-
  Use this skill whenever creating or modifying UI components, HUD overlays,
  buttons, icons, visual effects, or PixiJS 2D scenes for Taverna Infinita.
  Enforces the official Supercell/Hearthstone stylized cartoon palette, glossy
  3D-beveled buttons, colored outlines (#2B1810), 9-slice textures, and tactile
  game juice.
---

# Taverna Infinita — Cartoon Art & UI System

## Visual Pillars
1. **No Flat Generic UI:** Every interactive button and panel must have a 3-layer glossy cartoon treatment: top specular highlight, vibrant saturated gradient, and chunky 3D bottom bevel.
2. **Colored Ink Outlines:** Never use pure black `#000000`. Use `#2B1810` for warm wood/character elements and `#14192E` for cosmic/HUD frames.
3. **Typography:** Use `Lilita One` or `Fredoka` (bold) with a `2px` `#2B1810` stroke and `0 3px 0 #2B1810` solid shadow for numbers/titles, paired with `Nunito ExtraBold` for body text.

## Official Semantic Button Palette
- **Emerald Green (Buy / Upgrade / Collect):** `#34F075` -> `#12A846`, bevel `#0B6B2B`, gloss `#B8FFD0`
- **Golden Amber (Shop / Coins / Daily Offers):** `#FFE055` -> `#F2990A`, bevel `#9E5400`, gloss `#FFF7C2`
- **Mystic Amethyst (Gems / VIP / Prestige):** `#D361FF` -> `#7C2AE8`, bevel `#471094`, gloss `#F3C9FF`
- **Arcane Sapphire (Quests / Skills / Play):** `#44CEFF` -> `#1475E1`, bevel `#0A4085`, gloss `#C2EEFF`
- **Ruby Coral (Close / Cancel / Alerts):** `#FF7161` -> `#D93025`, bevel `#8A1710`, gloss `#FFC7C0`
- **Wood & Parchment Panels:** Oak `#8C522B` -> `#572F16`, Parchment `#FAF0D7` -> `#E8D4A8`, Royal Slate `#25304D` -> `#151C2E`

## Mandatory Game Juice
- Button press: `scale(0.93, 0.90)` + `translateY(3px)` + light haptic (`10ms`) + crisp wooden click SFX.
- Purchase confirm: spring bounce (`1.06 -> 1.0`), 10-14 golden star particles, and floating `+GPS` pop text.
- Mobile portrait safety: keep primary upgrade actions inside the bottom thumb zone and respect `env(safe-area-inset-*)`.
