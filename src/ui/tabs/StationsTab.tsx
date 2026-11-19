import React from 'react';
import Decimal from 'break_eternity.js';
import { useGameStore, type BuyMode } from '../../store/useGameStore';
import { STATIONS, getBiomeForFloor, getStationVisualTier } from '../../lore/gameData';
import {
  formatBig,
  getStationBulkCost,
  getMaxAffordableCount,
  getNextMilestone,
} from '../../economy/bigNumber';
import { CartoonButton } from '../CartoonButton';
import type { ExtractedSprites } from '../../engine/spriteExtractor';

const BUY_MODES: BuyMode[] = [1, 10, 25, 'MAX'];

interface StationsTabProps {
  sprites: ExtractedSprites | null;
}

export const StationsTab: React.FC<StationsTabProps> = ({ sprites }) => {
  const gold = useGameStore((s) => s.gold);
  const floor = useGameStore((s) => s.floor);
  const buyMode = useGameStore((s) => s.buyMode);
  const stationLevels = useGameStore((s) => s.stationLevels);
  const setBuyMode = useGameStore((s) => s.setBuyMode);
  const buyStation = useGameStore((s) => s.buyStation);
  const expandFloor = useGameStore((s) => s.expandFloor);
  const getStationGps = useGameStore((s) => s.getStationGps);
  const getFloorUpgradeCost = useGameStore((s) => s.getFloorUpgradeCost);
  const floorCost = getFloorUpgradeCost();

  const currentBiome = getBiomeForFloor(floor);
  const nextFloorBiome = getBiomeForFloor(floor + 1);
  const isBiomeJump = nextFloorBiome.id !== currentBiome.id;
  const canExpand = gold.gte(floorCost);
  const biomeCostScale = Decimal.pow(1.06, floor - 1);

  return (
    <div className="space-y-2.5 pb-4">
      {/* Top Bar: Floor Expansion Banner + Buy Multiplier */}
      <div className="wood-panel rounded-2xl p-2.5 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="font-cartoon text-sm text-[#FFE055] cartoon-stroke-sm flex items-center gap-1.5">
            <span>🏰 Andar {floor}</span>
            <span className="text-[10px] bg-[#2B1810]/70 px-1.5 py-0.5 rounded-md text-[#34F075]">
              ×{formatBig(currentBiome.profitMultiplier.mul(1 + 0.15 * (floor - 1)))}
            </span>
          </div>
          <div className="text-[11px] font-extrabold text-[#FAF0D7]/90 truncate">
            {isBiomeJump
              ? `✨ Próximo: NOVO REINO ${nextFloorBiome.name}!`
              : `Construa até o Andar ${currentBiome.floorEnd + 1} p/ novo Bioma`}
          </div>
        </div>
        <CartoonButton
          variant={isBiomeJump ? 'amethyst' : 'amber'}
          sheen={canExpand}
          size="sm"
          disabled={!canExpand}
          onClick={expandFloor}
          className="shrink-0"
        >
          <div className="text-center leading-tight">
            <div className="text-[11px]">{isBiomeJump ? 'NOVO BIOMA!' : 'SUBIR ANDAR'}</div>
            <div className="text-[10px] text-[#FFF7C2]">🪙 {formatBig(floorCost)}</div>
          </div>
        </CartoonButton>
      </div>

      {/* Buy Mode Selector */}
      <div className="flex items-center justify-between px-1">
        <span className="font-cartoon text-xs text-[#FAF0D7] cartoon-stroke-sm tracking-wide">
          ESTAÇÕES DA TAVERNA
        </span>
        <div className="flex items-center gap-1 bg-[#151C2E] p-1 rounded-xl border-2 border-[#2B1810]">
          {BUY_MODES.map((mode) => (
            <button
              key={String(mode)}
              type="button"
              onClick={() => setBuyMode(mode)}
              className={`px-2 py-0.5 rounded-lg font-cartoon text-[11px] transition-all ${
                buyMode === mode
                  ? 'bg-[#FFE055] text-[#2B1810] shadow-sm'
                  : 'text-[#FAF0D7]/75 hover:text-white'
              }`}
            >
              {mode === 'MAX' ? 'MAX' : `×${mode}`}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Stations List */}
      <div className="space-y-2">
        {STATIONS.map((st) => {
          const lv = stationLevels[st.id] || 0;
          const gps = getStationGps(st.id);
          const tier = getStationVisualTier(lv);
          const nextMs = getNextMilestone(lv);
          const prevMs = nextMs - 25;
          const progressPct = lv === 0 ? 0 : Math.min(100, ((lv - prevMs) / 25) * 100);

          let buyCount = 1;
          let cost = getStationBulkCost(st.baseCost, st.growthRate, lv, 1, biomeCostScale);

          if (buyMode === 'MAX') {
            const maxInfo = getMaxAffordableCount(
              gold,
              st.baseCost,
              st.growthRate,
              lv,
              biomeCostScale
            );
            if (maxInfo.count > 0) {
              buyCount = maxInfo.count;
              cost = maxInfo.totalCost;
            }
          } else {
            buyCount = buyMode;
            cost = getStationBulkCost(st.baseCost, st.growthRate, lv, buyCount, biomeCostScale);
          }

          const canBuy = gold.gte(cost);
          const iconSrc = sprites?.icons[st.iconKey];

          return (
            <div
              key={st.id}
              className="parchment-card rounded-2xl p-2.5 flex items-center gap-2.5"
            >
              {/* Icon Badge */}
              <div className="relative w-12 h-12 rounded-xl bg-[#25304D] border-2 border-[#2B1810] flex items-center justify-center shrink-0 shadow-inner">
                {iconSrc ? (
                  <img src={iconSrc} alt={st.name} className="w-9 h-9 object-contain" />
                ) : (
                  <span className="text-2xl">{st.emoji}</span>
                )}
                <span className="absolute -bottom-1.5 -right-1.5 bg-[#2B1810] text-[#FFE055] font-cartoon text-[10px] px-1.5 py-0.5 rounded-md border border-[#FFE055]/60">
                  Nv.{lv}
                </span>
              </div>

              {/* Station Details & Milestone Bar */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-cartoon text-[14px] text-[#3A2010] truncate">{st.name}</h3>
                  {lv > 0 && (
                    <span
                      className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full text-white shrink-0 border border-[#2B1810]"
                      style={{ backgroundColor: tier.color }}
                    >
                      {tier.label}
                    </span>
                  )}
                </div>

                <div className="text-[11px] font-extrabold text-[#6B3B1C] flex items-center justify-between mt-0.5">
                  <span>{lv > 0 ? `+${formatBig(gps)}/s` : st.desc}</span>
                </div>

                {/* Next Milestone Progress */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <div className="flex-1 h-2 bg-[#3A2010]/25 rounded-full overflow-hidden border border-[#3A2010]/40">
                    <div
                      className="h-full bg-gradient-to-r from-[#18C254] to-[#34F075] transition-all duration-200"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                  <span className="text-[9px] font-black text-[#6B3B1C] shrink-0">
                    Marco {nextMs} (×2)
                  </span>
                </div>
              </div>

              {/* Glossy Emerald Buy Button */}
              <CartoonButton
                variant="emerald"
                size="sm"
                disabled={!canBuy}
                onClick={() => buyStation(st.id)}
                className="min-w-[84px] shrink-0"
              >
                <div className="text-center leading-tight">
                  <div className="text-[11px]">
                    {lv === 0 ? 'DESBLOQ.' : `EVOLUIR +${buyCount}`}
                  </div>
                  <div className="text-[10px] text-[#FFF7C2]">🪙 {formatBig(cost)}</div>
                </div>
              </CartoonButton>
            </div>
          );
        })}
      </div>
    </div>
  );
};
