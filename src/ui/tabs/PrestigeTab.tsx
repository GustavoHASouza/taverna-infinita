import React from 'react';
import Decimal from 'break_eternity.js';
import { useGameStore } from '../../store/useGameStore';
import { PRESTIGE_UPGRADES } from '../../lore/gameData';
import {
  formatBig,
  calculateArcaneStarsGain,
  calculateDimensionalEssenceGain,
  calculateCosmicShardsGain,
  calculateOmegaSeedsGain,
} from '../../economy/bigNumber';
import { CartoonButton } from '../CartoonButton';

export const PrestigeTab: React.FC = () => {
  const runGold = useGameStore((s) => s.runGold);
  const arcaneStars = useGameStore((s) => s.arcaneStars);
  const dimensionalEssence = useGameStore((s) => s.dimensionalEssence);
  const cosmicShards = useGameStore((s) => s.cosmicShards);
  const omegaSeeds = useGameStore((s) => s.omegaSeeds);
  const omegaCycleCount = useGameStore((s) => s.omegaCycleCount);
  const prestigeUpgrades = useGameStore((s) => s.prestigeUpgrades);
  const heroStars = useGameStore((s) => s.heroStars);
  const autoBuyerEnabled = useGameStore((s) => s.autoBuyerEnabled);
  const autoPrestigeEnabled = useGameStore((s) => s.autoPrestigeEnabled);
  const performPrestigeLayer = useGameStore((s) => s.performPrestigeLayer);
  const buyPrestigeUpgrade = useGameStore((s) => s.buyPrestigeUpgrade);
  const toggleAutoBuyer = useGameStore((s) => s.toggleAutoBuyer);
  const toggleAutoPrestige = useGameStore((s) => s.toggleAutoPrestige);

  const dimStarMult = Decimal.pow(2, prestigeUpgrades['dim_star_boost'] || 0);
  const echoMult = 1 + 0.25 * (heroStars['aurelius_echo'] || 0);

  const gainL1 = calculateArcaneStarsGain(runGold).mul(dimStarMult).mul(echoMult).floor();
  const gainL2 = calculateDimensionalEssenceGain(arcaneStars);
  const gainL3 = calculateCosmicShardsGain(dimensionalEssence);
  const gainL4 = calculateOmegaSeedsGain(cosmicShards);

  const layers = [
    {
      layer: 1 as const,
      title: 'Camada 1 • Renomeação da Taverna',
      currencyName: 'Estrelas Arcanas',
      icon: '⭐',
      owned: arcaneStars,
      pending: gainL1,
      reqText: 'Requer 1M de Ouro nesta jornada (+5% lucro por estrela)',
      color: 'from-[#16386B] to-[#0D1E3A]',
      btnVariant: 'sapphire' as const,
    },
    {
      layer: 2 as const,
      title: 'Camada 2 • Ascensão de Reino',
      currencyName: 'Essência Dimensional',
      icon: '🌌',
      owned: dimensionalEssence,
      pending: gainL2,
      reqText: 'Requer 500 Estrelas Arcanas',
      color: 'from-[#42186B] to-[#1D0D33]',
      btnVariant: 'amethyst' as const,
    },
    {
      layer: 3 as const,
      title: 'Camada 3 • Fusão do Caldeirão',
      currencyName: 'Fragmentos Cósmicos',
      icon: '🪐',
      owned: cosmicShards,
      pending: gainL3,
      reqText: 'Requer 250 Essências Dimensionais',
      color: 'from-[#5C2208] to-[#290F05]',
      btnVariant: 'amber' as const,
    },
    {
      layer: 4 as const,
      title: `Camada 4 • Ciclo Ômega ∞ (#${omegaCycleCount})`,
      currencyName: 'Sementes Eternas',
      icon: '♾️',
      owned: omegaSeeds,
      pending: gainL4,
      reqText: 'Requer 150 Fragmentos Cósmicos (Escala Infinita!)',
      color: 'from-[#6B124A] to-[#240929]',
      btnVariant: 'coral' as const,
    },
  ];

  const getLayerBalance = (layer: 1 | 2 | 3 | 4) => {
    if (layer === 1) return { bal: arcaneStars, icon: '⭐' };
    if (layer === 2) return { bal: dimensionalEssence, icon: '🌌' };
    if (layer === 3) return { bal: cosmicShards, icon: '🪐' };
    return { bal: omegaSeeds, icon: '♾️' };
  };

  return (
    <div className="space-y-2.5 pb-4">
      {/* Automation Toggles (when unlocked) */}
      {((prestigeUpgrades['dim_autobuyer'] || 0) > 0 ||
        (prestigeUpgrades['cos_autoprestige'] || 0) > 0) && (
        <div className="wood-panel rounded-2xl p-2.5 flex flex-wrap items-center gap-2">
          {(prestigeUpgrades['dim_autobuyer'] || 0) > 0 && (
            <CartoonButton
              variant={autoBuyerEnabled ? 'emerald' : 'coral'}
              size="xs"
              onClick={toggleAutoBuyer}
            >
              🤖 Auto-Compra: {autoBuyerEnabled ? 'ON' : 'OFF'}
            </CartoonButton>
          )}
          {(prestigeUpgrades['cos_autoprestige'] || 0) > 0 && (
            <CartoonButton
              variant={autoPrestigeEnabled ? 'amethyst' : 'coral'}
              size="xs"
              onClick={toggleAutoPrestige}
            >
              🌀 Auto-Prestígio: {autoPrestigeEnabled ? 'ON' : 'OFF'}
            </CartoonButton>
          )}
        </div>
      )}

      {/* 4 Infinite Prestige Layers */}
      <div className="space-y-2">
        {layers.map((l) => (
          <div
            key={l.layer}
            className={`rounded-2xl p-2.5 border-[2.5px] border-[#2B1810] bg-gradient-to-br ${l.color} shadow-md flex items-center justify-between gap-2`}
          >
            <div className="min-w-0">
              <div className="font-cartoon text-xs text-[#FFE055] cartoon-stroke-sm">
                {l.icon} {l.title}
              </div>
              <div className="text-[11px] font-extrabold text-white mt-0.5">
                Atual: <span className="text-[#44CEFF]">{formatBig(l.owned)}</span> {l.currencyName}
              </div>
              <div className="text-[10px] font-bold text-[#FAF0D7]/75">
                {l.pending.gt(0)
                  ? `Ascender agora concede +${formatBig(l.pending)} ${l.icon}`
                  : l.reqText}
              </div>
            </div>

            <CartoonButton
              variant={l.btnVariant}
              sheen={l.pending.gt(0)}
              size="sm"
              disabled={l.pending.lte(0)}
              onClick={() => performPrestigeLayer(l.layer)}
              className="shrink-0"
            >
              ASCENDER +{formatBig(l.pending)}
            </CartoonButton>
          </div>
        ))}
      </div>

      {/* Permanent Upgrade Tree */}
      <div className="font-cartoon text-xs text-[#FAF0D7] cartoon-stroke-sm px-1 pt-1">
        ÁRVORE PERMANENTE DE RECEITAS & CONSTELAÇÕES
      </div>

      <div className="space-y-2">
        {PRESTIGE_UPGRADES.map((up) => {
          const lv = prestigeUpgrades[up.id] || 0;
          const isMaxed = up.maxLevel > 0 && lv >= up.maxLevel;
          const cost = up.baseCost.mul(Decimal.pow(up.growth, lv)).floor();
          const { bal, icon } = getLayerBalance(up.layer);
          const canBuy = !isMaxed && bal.gte(cost);

          return (
            <div
              key={up.id}
              className="parchment-card rounded-2xl p-2.5 flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#25304D] border-2 border-[#2B1810] flex items-center justify-center text-xl shrink-0">
                  {up.icon}
                </div>
                <div className="min-w-0">
                  <div className="font-cartoon text-xs text-[#3A2010] truncate">
                    {up.name}{' '}
                    <span className="text-[#7C2AE8]">
                      (Nv.{lv}
                      {up.maxLevel > 0 ? `/${up.maxLevel}` : '/∞'})
                    </span>
                  </div>
                  <div className="text-[10px] font-extrabold text-[#6B3B1C] leading-snug">
                    {up.desc}
                  </div>
                </div>
              </div>

              <CartoonButton
                variant={up.layer === 1 ? 'sapphire' : up.layer === 2 ? 'amethyst' : 'amber'}
                size="xs"
                disabled={!canBuy}
                onClick={() => buyPrestigeUpgrade(up.id)}
                className="min-w-[74px] shrink-0"
              >
                {isMaxed ? 'MÁXIMO' : `${icon} ${formatBig(cost)}`}
              </CartoonButton>
            </div>
          );
        })}
      </div>
    </div>
  );
};
