---
name: infinite-idle-economy
description: >-
  Use this skill when implementing or balancing currency math, station costs,
  offline earnings, multi-layer prestige formulas, or big-number formatting in
  Taverna Infinita. Enforces break_eternity.js usage and prevents floating-point
  overflow or NaN corruption.
---

# Taverna Infinita — Infinite Idle Economy Rules

## Mandatory Big-Number Engineering
1. **Never use native JS `number`** for Gold, GPS, Station Costs, Prestige Currencies, or Multipliers. Always use `Decimal` from `break_eternity.js`.
2. **Serialization:** Always store `Decimal` values as strings (`value.toString()`) in saves and hydrate via `new Decimal(raw || "0")`. Guard against `NaN` or negative values on load.
3. **Human-Readable Formatter:** Format values cleanly (`K, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dc`, then `aa..zz`, then scientific `1.45e3050`).

## Scaling Architecture
- **Station Cost:** `C(n) = C0 * r^n * (1 + 0.08 * floor(n / 50))` with `r` in `[1.07, 1.15]`.
- **Milestones:** Apply burst multipliers (`x2` every 25 levels, `x3` every 100 levels) to keep dopamine pacing tight.
- **4-Layer Infinite Prestige:**
  1. Tavern Renown (Arcane Stars)
  2. Realm Ascension (Dimensional Essence)
  3. Cauldron Fusion (Cosmic Shards)
  4. Omega Cycles (Procedural infinite scaling)

## Verification Checklist
- Run automated progression simulations verifying zero `NaN`, monotonic growth, and balanced prestige pacing up to `1e1000`.
