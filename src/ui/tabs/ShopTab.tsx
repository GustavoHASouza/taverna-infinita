import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Clock, Tv, RotateCcw } from 'lucide-react';
import { useGameStore } from '../../store/useGameStore';
import { formatBig } from '../../economy/bigNumber';
import { CartoonButton } from '../CartoonButton';
import type { ExtractedSprites } from '../../engine/spriteExtractor';

interface ShopTabProps {
  sprites: ExtractedSprites | null;
}

export const ShopTab: React.FC<ShopTabProps> = ({ sprites }) => {
  const gems = useGameStore((s) => s.gems);
  const chestKeys = useGameStore((s) => s.chestKeys);
  const noAds = useGameStore((s) => s.noAds);
  const starterPackBought = useGameStore((s) => s.starterPackBought);
  const permanentX2 = useGameStore((s) => s.permanentX2);
  const vipClub = useGameStore((s) => s.vipClub);
  const goldenPass = useGameStore((s) => s.goldenPass);
  const pityEpic = useGameStore((s) => s.pityEpic);
  const pityCelestial = useGameStore((s) => s.pityCelestial);

  const getTimeWarpGold = useGameStore((s) => s.getTimeWarpGold);
  const triggerAdBoost = useGameStore((s) => s.triggerAdBoost);
  const triggerAdGems = useGameStore((s) => s.triggerAdGems);
  const buyStarterPack = useGameStore((s) => s.buyStarterPack);
  const buyNoAds = useGameStore((s) => s.buyNoAds);
  const buyGoldenPass = useGameStore((s) => s.buyGoldenPass);
  const buyVipClub = useGameStore((s) => s.buyVipClub);
  const claimVipDailyGems = useGameStore((s) => s.claimVipDailyGems);
  const buyPermanentX2 = useGameStore((s) => s.buyPermanentX2);
  const buyTimeWarp = useGameStore((s) => s.buyTimeWarp);
  const buyGemPackSandbox = useGameStore((s) => s.buyGemPackSandbox);
  const openChest = useGameStore((s) => s.openChest);
  const restorePurchasesSandbox = useGameStore((s) => s.restorePurchasesSandbox);

  const [watchingAd, setWatchingAd] = useState<null | 'boost' | 'gems'>(null);

  const handleRewardedAd = (kind: 'boost' | 'gems') => {
    if (noAds) {
      if (kind === 'boost') triggerAdBoost();
      else triggerAdGems();
      return;
    }
    setWatchingAd(kind);
    setTimeout(() => {
      setWatchingAd(null);
      if (kind === 'boost') triggerAdBoost();
      else triggerAdGems();
    }, 1800);
  };

  const warp4h = getTimeWarpGold(4 * 3600);
  const warp24h = getTimeWarpGold(24 * 3600);
  const warp7d = getTimeWarpGold(7 * 24 * 3600);

  return (
    <div className="space-y-3 pb-4">
      {/* Sandbox Notice */}
      <div className="bg-[#1D253B] border-2 border-[#44CEFF]/50 rounded-xl px-3 py-2 text-[11px] font-extrabold text-[#C2EEFF] flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0 text-[#34F075]" />
        <span>
          <strong>Modo Sandbox de Teste:</strong> Todas as microtransações podem ser testadas gratuitamente aqui. Pronta para conectar ao RevenueCat / Google Play Billing.
        </span>
      </div>

      {/* Rewarded Ads / Instant No-Ads */}
      <div className="wood-panel rounded-2xl p-2.5 space-y-2">
        <div className="font-cartoon text-xs text-[#FFE055] cartoon-stroke-sm flex items-center gap-1.5">
          <Tv className="w-4 h-4" /> BÔNUS DO MERCADOR ({noAds ? 'INSTANTÂNEO SEM ANÚNCIOS!' : 'VÍDEO PREMIADO VOLUNTÁRIO'})
        </div>
        <div className="grid grid-cols-2 gap-2">
          <CartoonButton
            variant="sapphire"
            size="sm"
            disabled={watchingAd !== null}
            onClick={() => handleRewardedAd('boost')}
          >
            {watchingAd === 'boost' ? '📺 Assistindo...' : noAds ? '⚡ ×2 Ouro (2h)' : '📺 ×2 Ouro (2h)'}
          </CartoonButton>
          <CartoonButton
            variant="amethyst"
            size="sm"
            disabled={watchingAd !== null}
            onClick={() => handleRewardedAd('gems')}
          >
            {watchingAd === 'gems' ? '📺 Assistindo...' : noAds ? '⚡ +15 Gemas' : '📺 +15 Gemas'}
          </CartoonButton>
        </div>
      </div>

      {/* Starter Pack Highlight */}
      {!starterPackBought && (
        <div className="rounded-2xl p-3 border-[2.5px] border-[#FFE055] bg-gradient-to-br from-[#6B2D0C] via-[#45170A] to-[#240B08] shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              {sprites?.heroes.ignis ? (
                <img
                  src={sprites.heroes.ignis}
                  alt="Ignis"
                  className="w-14 h-14 object-contain shrink-0 drop-shadow-md"
                />
              ) : (
                <span className="text-4xl">🐉</span>
              )}
              <div className="min-w-0">
                <span className="px-2 py-0.5 rounded-full bg-[#FF7161] text-white text-[9px] font-black uppercase">
                  🔥 800% VALOR • OFERTA ÚNICA
                </span>
                <h3 className="font-cartoon text-base text-[#FFE055] cartoon-stroke-sm mt-0.5">
                  Pacote do Aprendiz
                </h3>
                <p className="text-[11px] font-extrabold text-[#FAF0D7]">
                  Ignis (Mítico) + 250 Gemas + Warp 4h ({formatBig(warp4h)} 🪙)
                </p>
              </div>
            </div>
            <CartoonButton variant="emerald" sheen size="sm" onClick={buyStarterPack}>
              R$ 4,90
            </CartoonButton>
          </div>
        </div>
      )}

      {/* Gacha Chests with Transparent Odds & Pity */}
      <div className="rounded-2xl p-3 border-[2.5px] border-[#2B1810] bg-gradient-to-br from-[#35165E] to-[#17122B]">
        <div className="flex items-center justify-between mb-2">
          <div className="font-cartoon text-sm text-[#F3C9FF] cartoon-stroke-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FFE055]" /> BAÚS DE HERÓIS (PITY GARANTIDO)
          </div>
          <span className="text-[11px] font-black text-[#FFE055] bg-[#0F1524] px-2 py-0.5 rounded-lg border border-[#2B1810]">
            🗝️ Chaves: {chestKeys}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Epic Chest */}
          <div className="bg-[#151C2E]/90 border-2 border-[#D361FF]/60 rounded-xl p-2 flex flex-col justify-between gap-2">
            <div>
              <div className="font-cartoon text-xs text-[#D361FF]">Baú Épico</div>
              <div className="text-[10px] font-bold text-[#FAF0D7]/80 mt-0.5">
                Lendário 20% • Épico 65% • Raro 15%
              </div>
              <div className="text-[10px] font-black text-[#34F075] mt-0.5">
                Pity Lendário: {pityEpic}/5
              </div>
            </div>
            <div className="space-y-1">
              {chestKeys > 0 && (
                <CartoonButton
                  variant="emerald"
                  size="xs"
                  fullWidth
                  onClick={() => openChest('epic', true)}
                >
                  🗝️ USAR CHAVE
                </CartoonButton>
              )}
              <CartoonButton
                variant="amethyst"
                size="xs"
                fullWidth
                disabled={gems < 80}
                onClick={() => openChest('epic', false)}
              >
                💎 80 Gemas
              </CartoonButton>
            </div>
          </div>

          {/* Celestial Chest */}
          <div className="bg-[#151C2E]/90 border-2 border-[#FFE055]/70 rounded-xl p-2 flex flex-col justify-between gap-2">
            <div>
              <div className="font-cartoon text-xs text-[#FFE055]">Baú Celestial ∞</div>
              <div className="text-[10px] font-bold text-[#FAF0D7]/80 mt-0.5">
                Eterno 12% • Celestial 26% • Mítico 34% • Lend. 28%
              </div>
              <div className="text-[10px] font-black text-[#44CEFF] mt-0.5">
                Pity Eterno: {pityCelestial}/10
              </div>
            </div>
            <CartoonButton
              variant="amber"
              sheen={gems >= 250}
              size="xs"
              fullWidth
              disabled={gems < 250}
              onClick={() => openChest('celestial', false)}
            >
              💎 250 Gemas
            </CartoonButton>
          </div>
        </div>
      </div>

      {/* Dynamic Infinite Time-Warps */}
      <div className="parchment-card rounded-2xl p-2.5 space-y-2">
        <div className="font-cartoon text-xs text-[#3A2010] flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#7C2AE8]" /> CÁPSULAS TEMPORAIS (ESCALAM AO INFINITO COM SEU GPS!)
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Warp 4h', sec: 4 * 3600, goldAmt: warp4h, cost: 35 },
            { label: 'Warp 24h', sec: 24 * 3600, goldAmt: warp24h, cost: 120 },
            { label: 'Warp 7d', sec: 7 * 24 * 3600, goldAmt: warp7d, cost: 450 },
          ].map((w) => (
            <div
              key={w.label}
              className="bg-[#FAF0D7] border-2 border-[#8C522B] rounded-xl p-1.5 text-center flex flex-col justify-between gap-1.5"
            >
              <div>
                <div className="font-cartoon text-xs text-[#3A2010]">{w.label}</div>
                <div className="text-[10px] font-black text-[#12A846] truncate">
                  +{formatBig(w.goldAmt)} 🪙
                </div>
              </div>
              <CartoonButton
                variant="sapphire"
                size="xs"
                fullWidth
                disabled={gems < w.cost}
                onClick={() => buyTimeWarp(w.sec, w.cost)}
              >
                💎 {w.cost}
              </CartoonButton>
            </div>
          ))}
        </div>
      </div>

      {/* Permanent Passes & Subscriptions */}
      <div className="space-y-2">
        <div className="font-cartoon text-xs text-[#FAF0D7] cartoon-stroke-sm px-1">
          PASSES PERMANENTES & CLUBE VIP
        </div>

        <div className="parchment-card rounded-2xl p-2.5 flex items-center justify-between gap-2">
          <div>
            <div className="font-cartoon text-xs text-[#3A2010]">🛡️ Passe Sem Anúncios Vitalício</div>
            <div className="text-[10px] font-extrabold text-[#6B3B1C]">
              Coleta todos os buffs de vídeo instantaneamente + 100 Gemas!
            </div>
          </div>
          <CartoonButton
            variant="emerald"
            size="xs"
            disabled={noAds}
            onClick={buyNoAds}
            className="shrink-0"
          >
            {noAds ? 'ATIVO ✓' : 'R$ 19,90'}
          </CartoonButton>
        </div>

        <div className="parchment-card rounded-2xl p-2.5 flex items-center justify-between gap-2">
          <div>
            <div className="font-cartoon text-xs text-[#3A2010]">👑 Passe do Caldeirão (30 dias)</div>
            <div className="text-[10px] font-extrabold text-[#6B3B1C]">
              Desbloqueia Trilha Dourada +20% lucro global +50 XP na hora!
            </div>
          </div>
          <CartoonButton
            variant="amber"
            size="xs"
            disabled={goldenPass}
            onClick={buyGoldenPass}
            className="shrink-0"
          >
            {goldenPass ? 'ATIVO ✓' : 'R$ 29,90'}
          </CartoonButton>
        </div>

        <div className="parchment-card rounded-2xl p-2.5 flex items-center justify-between gap-2">
          <div>
            <div className="font-cartoon text-xs text-[#3A2010]">💜 Clube VIP da Taverna (Mensal)</div>
            <div className="text-[10px] font-extrabold text-[#6B3B1C]">
              +100 Gemas/dia, +35% lucro e Ganhos Offline de 8h → 24h!
            </div>
          </div>
          {vipClub ? (
            <CartoonButton variant="amethyst" size="xs" onClick={claimVipDailyGems} className="shrink-0">
              +100 💎
            </CartoonButton>
          ) : (
            <CartoonButton variant="amethyst" size="xs" onClick={buyVipClub} className="shrink-0">
              R$ 24,90
            </CartoonButton>
          )}
        </div>

        <div className="parchment-card rounded-2xl p-2.5 flex items-center justify-between gap-2">
          <div>
            <div className="font-cartoon text-xs text-[#3A2010]">🏆 Caldeirão de Ouro ×2 Permanente</div>
            <div className="text-[10px] font-extrabold text-[#6B3B1C]">
              Dobra permanentemente o lucro em TODAS as dimensões e prestígios!
            </div>
          </div>
          <CartoonButton
            variant="amber"
            size="xs"
            disabled={permanentX2}
            onClick={buyPermanentX2}
            className="shrink-0"
          >
            {permanentX2 ? 'ATIVO ✓' : 'R$ 39,90'}
          </CartoonButton>
        </div>
      </div>

      {/* Gem Packs (All Player Tiers) */}
      <div className="wood-panel rounded-2xl p-2.5 space-y-2">
        <div className="font-cartoon text-xs text-[#FFE055] cartoon-stroke-sm">
          💎 COFRE DE GEMAS AMETISTA
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { gems: 150, price: 'R$ 9,90', label: 'Bolsa de Gemas' },
            { gems: 650, price: 'R$ 34,90', label: 'Baú Real' },
            { gems: 2500, price: 'R$ 99,90', label: 'Tesouro Astral' },
          ].map((pack) => (
            <div
              key={pack.gems}
              className="bg-[#151C2E] border-2 border-[#2B1810] rounded-xl p-2 text-center flex flex-col justify-between gap-1.5"
            >
              <div className="font-cartoon text-sm text-[#F3C9FF] cartoon-stroke-sm">
                💎 {pack.gems}
              </div>
              <div className="text-[9px] font-extrabold text-[#FAF0D7]/75">{pack.label}</div>
              <CartoonButton
                variant="emerald"
                size="xs"
                fullWidth
                onClick={() => buyGemPackSandbox(pack.gems, pack.label)}
              >
                {pack.price}
              </CartoonButton>
            </div>
          ))}
        </div>
      </div>

      {/* Store Compliance: Restore Purchases */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={restorePurchasesSandbox}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#44CEFF] underline py-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Restaurar Compras (Google Play / App Store)
        </button>
      </div>
    </div>
  );
};
