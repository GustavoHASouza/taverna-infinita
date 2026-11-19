---
name: iap-liveops-guard
description: >-
  Use this skill when implementing the in-game shop, RevenueCat IAP/subscriptions,
  dynamic Time-Warp bundles, chest drop rates, rewarded ads, or offline earnings
  anti-cheat in Taverna Infinita. Ensures store compliance and infinite offer scaling.
---

# Taverna Infinita — IAP & LiveOps Guardrails

## Infinite Offer Scaling (Never Sell Fixed Gold)
- Every bundle containing Gold or Essence MUST compute rewards dynamically as a **Time-Warp** of the player's live production (`GPS_current * warpSeconds * bonusMultiplier`) so offers remain valuable from Day 1 to Omega Cycle 100+.

## Store Compliance & Player Trust
1. **Restore Purchases:** Always expose a visible "Restaurar Compras" button in Settings and Shop (mandatory for App Store & Google Play).
2. **Transparent Odds & Pity:** Every chest/gacha modal must clearly display drop percentages and current pity counter before purchase.
3. **Voluntary Ads Only:** Never trigger surprise interstitial ads during gameplay. Rewarded ads must be explicitly opt-in, and the Lifetime "No Ads" pass must grant instant collection of all rewarded ad buffs.
4. **Receipt Validation & Anti-Cheat:** Validate entitlements via RevenueCat (`@revenuecat/purchases-capacitor`) and compute offline earnings deltas using a trusted server timestamp fallback to prevent device clock manipulation.
