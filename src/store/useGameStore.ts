import { create } from 'zustand';
import Decimal from 'break_eternity.js';
import {
  D,
  ZERO,
  ONE,
  getStationBulkCost,
  getMaxAffordableCount,
  getMilestoneMultiplier,
  calculateArcaneStarsGain,
  calculateDimensionalEssenceGain,
  calculateCosmicShardsGain,
  calculateOmegaSeedsGain,
} from '../economy/bigNumber';
import {
  STATIONS,
  HEROES,
  PRESTIGE_UPGRADES,
  getBiomeForFloor,
  BATTLE_PASS_TIERS,
  BARON_BOSSES,
  type HeroDef,
  type Rarity,
} from '../lore/gameData';
import { soundEngine } from '../audio/soundEngine';

const SAVE_KEY = 'taverna_infinita_save_v3';

export type BuyMode = 1 | 10 | 25 | 'MAX';
export type TabId = 'stations' | 'heroes' | 'prestige' | 'pass' | 'shop';

export interface ChestResult {
  chestType: 'epic' | 'celestial';
  hero: HeroDef;
  rarity: Rarity;
  bonusGems: number;
  isNew: boolean;
  newStars: number;
}

export interface OfflinePopupData {
  secondsAway: number;
  goldEarned: Decimal;
  cappedHours: number;
}

export interface GameState {
  // Core currencies (break_eternity Decimals)
  gold: Decimal;
  runGold: Decimal;
  totalGold: Decimal;
  arcaneStars: Decimal;
  dimensionalEssence: Decimal;
  cosmicShards: Decimal;
  omegaSeeds: Decimal;
  gems: number;
  chestKeys: number;

  // Progression
  floor: number;
  highestFloor: number;
  omegaCycleCount: number;
  stationLevels: Record<string, number>;
  heroStars: Record<string, number>;
  prestigeUpgrades: Record<string, number>;
  autoBuyerEnabled: boolean;
  autoPrestigeEnabled: boolean;

  // Fever & Active Buffs
  feverCharge: number; // 0 to 100
  feverEndsAt: number;
  adBoostEndsAt: number;

  // Raid against Barão Malakor
  bossStage: number;
  raidCooldownEndsAt: number;

  // Quests & Battle Pass
  passXp: number;
  claimedFreeTiers: number[];
  claimedGoldTiers: number[];
  tapsCount: number;
  upgradesCount: number;
  raidsWon: number;
  questClaimedLevel: Record<'taps' | 'upgrades' | 'floors' | 'raids', number>;

  // Monetization Entitlements (Sandbox RevenueCat-ready)
  noAds: boolean;
  starterPackBought: boolean;
  permanentX2: boolean;
  vipClub: boolean;
  goldenPass: boolean;
  vipLastDailyClaim: number;
  pityEpic: number;
  pityCelestial: number;

  // UI & UX
  activeTab: TabId;
  buyMode: BuyMode;
  soundEnabled: boolean;
  tutorialStep: number;
  toastMessage: string | null;
  chestModal: ChestResult | null;
  offlinePopup: OfflinePopupData | null;
  lastSavedAt: number;

  // Computed getters (ALWAYS select function ref, never call inside selector!)
  getGlobalMultiplier: () => Decimal;
  getStationGps: (stationId: string) => Decimal;
  getTotalGps: () => Decimal;
  getTapPower: () => Decimal;
  getFloorUpgradeCost: () => Decimal;
  getTimeWarpGold: (seconds: number) => Decimal;

  // Actions
  setActiveTab: (tab: TabId) => void;
  setBuyMode: (mode: BuyMode) => void;
  toggleSound: () => void;
  advanceTutorial: () => void;
  skipTutorial: () => void;
  showToast: (msg: string) => void;
  closeChestModal: () => void;
  claimOfflinePopup: (doubled: boolean) => void;

  // Gameplay Actions
  tapTavern: () => { gained: Decimal; isCrit: boolean };
  activateFever: () => void;
  buyStation: (stationId: string) => boolean;
  expandFloor: () => boolean;
  hireOrUpgradeHero: (heroId: string) => boolean;
  fightBaronRaid: () => boolean;
  buyPrestigeUpgrade: (upgradeId: string) => boolean;
  performPrestigeLayer: (layer: 1 | 2 | 3 | 4) => boolean;
  toggleAutoBuyer: () => void;
  toggleAutoPrestige: () => void;
  claimQuest: (type: 'taps' | 'upgrades' | 'floors' | 'raids') => void;
  claimPassReward: (level: number, track: 'free' | 'gold') => void;

  // Shop / Monetization Actions
  triggerAdBoost: () => void;
  triggerAdGems: () => void;
  buyStarterPack: () => void;
  buyNoAds: () => void;
  buyGoldenPass: () => void;
  buyVipClub: () => void;
  claimVipDailyGems: () => void;
  buyPermanentX2: () => void;
  buyTimeWarp: (seconds: number, gemCost: number) => boolean;
  buyGemPackSandbox: (gemsAmount: number, label: string) => void;
  openChest: (type: 'epic' | 'celestial', useKey: boolean) => boolean;
  restorePurchasesSandbox: () => void;

  // Simulation Loop & Persistence
  tick: (dtSeconds: number) => void;
  saveGame: () => void;
  loadGame: () => void;
  resetGame: () => void;
}

const initialStationLevels = (): Record<string, number> => ({
  ale_bar: 0,
  cauldron: 0,
  grill: 0,
  forge: 0,
  quests_board: 0,
  vip_lounge: 0,
});

const initialHeroStars = (): Record<string, number> => ({
  barnabe: 0,
  lyra: 0,
  zephyr: 0,
  cedric: 0,
  ignis: 0,
  aurelius_echo: 0,
  solaris_titan: 0,
});

let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const useGameStore = create<GameState>((set, get) => ({
  gold: new Decimal(0),
  runGold: new Decimal(0),
  totalGold: new Decimal(0),
  arcaneStars: ZERO,
  dimensionalEssence: ZERO,
  cosmicShards: ZERO,
  omegaSeeds: ZERO,
  gems: 30,
  chestKeys: 0,

  floor: 1,
  highestFloor: 1,
  omegaCycleCount: 0,
  stationLevels: initialStationLevels(),
  heroStars: initialHeroStars(),
  prestigeUpgrades: {},
  autoBuyerEnabled: true,
  autoPrestigeEnabled: true,

  feverCharge: 0,
  feverEndsAt: 0,
  adBoostEndsAt: 0,

  bossStage: 1,
  raidCooldownEndsAt: 0,

  passXp: 0,
  claimedFreeTiers: [],
  claimedGoldTiers: [],
  tapsCount: 0,
  upgradesCount: 0,
  raidsWon: 0,
  questClaimedLevel: { taps: 0, upgrades: 0, floors: 0, raids: 0 },

  noAds: false,
  starterPackBought: false,
  permanentX2: false,
  vipClub: false,
  goldenPass: false,
  vipLastDailyClaim: 0,
  pityEpic: 0,
  pityCelestial: 0,

  activeTab: 'stations',
  buyMode: 1,
  soundEnabled: true,
  tutorialStep: 0,
  toastMessage: null,
  chestModal: null,
  offlinePopup: null,
  lastSavedAt: Date.now(),

  getGlobalMultiplier: () => {
    const s = get();
    const now = Date.now();
    const biome = getBiomeForFloor(s.floor);

    // Classic steady floor bonus (+15% additive per floor * Biome multiplier)
    let mult = biome.profitMultiplier.mul(1 + 0.15 * (s.floor - 1));

    // Prestige Currencies Passive Multipliers (authentic incremental curve)
    if (s.arcaneStars.gt(0)) {
      mult = mult.mul(ONE.add(s.arcaneStars.mul(0.05)));
    }
    if (s.dimensionalEssence.gt(0)) {
      mult = mult.mul(ONE.add(s.dimensionalEssence.mul(0.35)));
    }
    if (s.cosmicShards.gt(0)) {
      mult = mult.mul(ONE.add(s.cosmicShards.mul(1.5)));
    }
    if (s.omegaSeeds.gt(0)) {
      mult = mult.mul(Decimal.pow(3, s.omegaSeeds.min(400)).mul(ONE.add(s.omegaSeeds)));
    }

    // Prestige Upgrades
    const starRecipeLv = s.prestigeUpgrades['star_recipe'] || 0;
    if (starRecipeLv > 0) mult = mult.mul(Decimal.pow(1.5, starRecipeLv));

    const dimBoostLv = s.prestigeUpgrades['dim_star_boost'] || 0;
    if (dimBoostLv > 0) mult = mult.mul(Decimal.pow(2, dimBoostLv));

    const cosMegaLv = s.prestigeUpgrades['cos_mega'] || 0;
    if (cosMegaLv > 0) mult = mult.mul(Decimal.pow(3, cosMegaLv));

    const omegaLv = s.prestigeUpgrades['omega_eternity'] || 0;
    if (omegaLv > 0) mult = mult.mul(Decimal.pow(5, omegaLv));

    // Heroes: additive sum across roster so early game NEVER explodes!
    let heroBonusSum = 0;
    for (const h of HEROES) {
      const stars = s.heroStars[h.id] || 0;
      if (stars > 0) {
        heroBonusSum += h.bonusPerStar * stars;
      }
    }
    if (heroBonusSum > 0) {
      mult = mult.mul(1 + heroBonusSum);
    }

    // Permanent & Active Buffs
    if (s.permanentX2) mult = mult.mul(2);
    if (s.vipClub) mult = mult.mul(1.35);
    if (s.goldenPass) mult = mult.mul(1.2);
    if (now < s.adBoostEndsAt) mult = mult.mul(2);
    if (now < s.feverEndsAt) {
      const ignisBonus = (s.heroStars['ignis'] || 0) > 0 ? 3.5 : 3;
      mult = mult.mul(ignisBonus);
    }

    return mult;
  },

  getStationGps: (stationId: string) => {
    const s = get();
    const def = STATIONS.find((st) => st.id === stationId);
    if (!def) return ZERO;
    const lv = s.stationLevels[stationId] || 0;
    if (lv <= 0) return ZERO;

    const milestone = getMilestoneMultiplier(lv);
    const managerStars = s.heroStars[def.managerHeroId] || 0;
    const managerBonus = 1 + 0.2 * managerStars;

    return def.baseGps.mul(lv).mul(milestone).mul(managerBonus).mul(s.getGlobalMultiplier());
  },

  getTotalGps: () => {
    const s = get();
    let total = ZERO;
    for (const st of STATIONS) {
      total = total.add(s.getStationGps(st.id));
    }
    return total;
  },

  getTapPower: () => {
    const s = get();
    const gps = s.getTotalGps();
    const tapUpgradeLv = s.prestigeUpgrades['star_tap'] || 0;
    const barnabeStars = s.heroStars['barnabe'] || 0;
    const gpsShare = 0.025 + tapUpgradeLv * 0.01 + barnabeStars * 0.005;
    const baseTap = ONE.mul(s.getGlobalMultiplier());
    return Decimal.max(baseTap, gps.mul(gpsShare)).floor();
  },

  getFloorUpgradeCost: () => {
    const s = get();
    // Classic tower progression: Floor 2 = 10K, Floor 3 = 80K, Floor 4 = 640K, Floor 5 = 5.1M...
    const base = new Decimal(10000);
    return base.mul(Decimal.pow(8, s.floor - 1)).floor();
  },

  getTimeWarpGold: (seconds: number) => {
    const s = get();
    const gps = Decimal.max(s.getTotalGps(), ONE.mul(s.getGlobalMultiplier()));
    return gps.mul(seconds).floor();
  },

  setActiveTab: (tab) => {
    soundEngine.playClick();
    set({ activeTab: tab });
  },

  setBuyMode: (mode) => {
    soundEngine.playClick();
    set({ buyMode: mode });
  },

  toggleSound: () => {
    const next = !get().soundEnabled;
    soundEngine.enabled = next;
    if (next) soundEngine.playClick();
    set({ soundEnabled: next });
  },

  advanceTutorial: () => {
    soundEngine.playClick();
    const curr = get().tutorialStep;
    if (curr >= 2) {
      set({ tutorialStep: -1 });
    } else {
      set({ tutorialStep: curr + 1 });
    }
  },

  skipTutorial: () => {
    soundEngine.playClick();
    set({ tutorialStep: -1 });
  },

  showToast: (msg) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ toastMessage: msg });
    toastTimer = setTimeout(() => {
      set({ toastMessage: null });
    }, 2600);
  },

  closeChestModal: () => {
    soundEngine.playClick();
    set({ chestModal: null });
  },

  claimOfflinePopup: (doubled) => {
    const popup = get().offlinePopup;
    if (!popup) return;
    soundEngine.playUpgrade();
    soundEngine.triggerHaptic(20);
    const amount = doubled ? popup.goldEarned.mul(2) : popup.goldEarned;
    set((s) => ({
      gold: s.gold.add(amount),
      runGold: s.runGold.add(amount),
      totalGold: s.totalGold.add(amount),
      offlinePopup: null,
    }));
    get().showToast(doubled ? 'Lucro Offline DOBRADO! ✨' : 'Lucro Offline coletado! 🍺');
  },

  tapTavern: () => {
    const s = get();
    const now = Date.now();
    const lyraOwned = (s.heroStars['lyra'] || 0) > 0;
    const critChance = lyraOwned ? 0.1 : 0.05;
    const isCrit = Math.random() < critChance;
    const critMult = 5 + (s.prestigeUpgrades['star_crit'] || 0) * 2;
    const gained = isCrit ? s.getTapPower().mul(critMult) : s.getTapPower();

    const inFever = now < s.feverEndsAt;
    const nextCharge = inFever ? s.feverCharge : Math.min(100, s.feverCharge + (isCrit ? 3.5 : 1.6));

    soundEngine.playCoin(isCrit ? 12 : s.tapsCount % 10);
    soundEngine.triggerHaptic(isCrit ? 18 : 8);

    set({
      gold: s.gold.add(gained),
      runGold: s.runGold.add(gained),
      totalGold: s.totalGold.add(gained),
      tapsCount: s.tapsCount + 1,
      feverCharge: nextCharge,
      passXp: s.passXp + (s.tapsCount % 10 === 0 ? 1 : 0),
    });

    return { gained, isCrit };
  },

  activateFever: () => {
    const s = get();
    if (s.feverCharge < 100) return;
    const durationMs = ((s.heroStars['ignis'] || 0) > 0 ? 28 : 20) * 1000;
    soundEngine.playFever();
    soundEngine.triggerHaptic(35);
    set({
      feverCharge: 0,
      feverEndsAt: Date.now() + durationMs,
      passXp: s.passXp + 6,
    });
    s.showToast('🔥 FEBRE DOURADA ATIVA! Lucro multiplicado!');
  },

  buyStation: (stationId) => {
    const s = get();
    const def = STATIONS.find((st) => st.id === stationId);
    if (!def) return false;
    const lv = s.stationLevels[stationId] || 0;
    const floorScale = Decimal.pow(1.06, s.floor - 1);

    let count = 1;
    let cost = ZERO;

    if (s.buyMode === 'MAX') {
      const res = getMaxAffordableCount(s.gold, def.baseCost, def.growthRate, lv, floorScale);
      if (res.count <= 0) return false;
      count = res.count;
      cost = res.totalCost;
    } else {
      count = s.buyMode;
      cost = getStationBulkCost(def.baseCost, def.growthRate, lv, count, floorScale);
      if (s.gold.lt(cost)) return false;
    }

    const oldMilestone = Math.floor(lv / 25);
    const newLevel = lv + count;
    const newMilestone = Math.floor(newLevel / 25);

    soundEngine.playUpgrade();
    soundEngine.triggerHaptic(14);

    set({
      gold: s.gold.sub(cost),
      stationLevels: { ...s.stationLevels, [stationId]: newLevel },
      upgradesCount: s.upgradesCount + count,
      passXp: s.passXp + Math.min(count, 10),
    });

    if (newMilestone > oldMilestone) {
      get().showToast(`🎉 Marco Nv.${newMilestone * 25} em ${def.name}! Produção ×2!`);
    }
    return true;
  },

  expandFloor: () => {
    const s = get();
    const cost = s.getFloorUpgradeCost();
    if (s.gold.lt(cost)) return false;

    const prevBiome = getBiomeForFloor(s.floor);
    const nextFloor = s.floor + 1;
    const nextBiome = getBiomeForFloor(nextFloor);
    const isNewRecord = nextFloor > s.highestFloor;

    soundEngine.playPrestige();
    soundEngine.triggerHaptic(25);

    const biomeUnlocked = nextBiome.id !== prevBiome.id && isNewRecord;

    set({
      gold: s.gold.sub(cost),
      floor: nextFloor,
      highestFloor: Math.max(s.highestFloor, nextFloor),
      gems: s.gems + (biomeUnlocked ? 35 : isNewRecord ? 3 : 0),
      passXp: s.passXp + (biomeUnlocked ? 35 : isNewRecord ? 10 : 2),
    });

    if (biomeUnlocked) {
      get().showToast(`✨ NOVO REINO DESBLOQUEADO: ${nextBiome.name}! (+35 Gemas)`);
    } else {
      get().showToast(`🏰 Andar ${nextFloor} construído! (+15% lucro global)`);
    }
    return true;
  },

  hireOrUpgradeHero: (heroId) => {
    const s = get();
    const hero = HEROES.find((h) => h.id === heroId);
    if (!hero || hero.hireGoldCost.lte(0)) return false;
    const stars = s.heroStars[heroId] || 0;
    // Steep classic idle hero fusion cost (×40 per star)
    const cost = hero.hireGoldCost.mul(Decimal.pow(40, stars)).floor();
    if (s.gold.lt(cost)) return false;

    soundEngine.playChestOpen();
    soundEngine.triggerHaptic(22);

    set({
      gold: s.gold.sub(cost),
      heroStars: { ...s.heroStars, [heroId]: stars + 1 },
      passXp: s.passXp + 12,
    });

    get().showToast(
      stars === 0
        ? `⚔️ ${hero.name} entrou para a Taverna!`
        : `⭐ ${hero.name} evoluiu para ${stars + 1} Estrelas!`
    );
    return true;
  },

  fightBaronRaid: () => {
    const s = get();
    const now = Date.now();
    if (now < s.raidCooldownEndsAt) return false;

    const boss = BARON_BOSSES[(s.bossStage - 1) % BARON_BOSSES.length];
    const cedricBonus = (s.heroStars['cedric'] || 0) > 0 ? 1.4 : 1;
    const gemsReward = Math.round((boss.rewardGems + Math.floor(s.bossStage * 0.5)) * cedricBonus);
    const goldReward = s.getTimeWarpGold(180); // 3 min bonus loot (balanced!)

    soundEngine.playChestOpen();
    soundEngine.triggerHaptic(30);

    set({
      bossStage: s.bossStage + 1,
      raidsWon: s.raidsWon + 1,
      raidCooldownEndsAt: now + 300_000, // 5 min authentic idle event cooldown
      gems: s.gems + gemsReward,
      chestKeys: s.chestKeys + (s.bossStage % 3 === 0 ? 1 : 0),
      gold: s.gold.add(goldReward),
      runGold: s.runGold.add(goldReward),
      totalGold: s.totalGold.add(goldReward),
      passXp: s.passXp + 20,
    });

    get().showToast(`🏆 ${boss.name} derrotado! +${gemsReward} Gemas & Saque 3min!`);
    return true;
  },

  buyPrestigeUpgrade: (upgradeId) => {
    const s = get();
    const up = PRESTIGE_UPGRADES.find((u) => u.id === upgradeId);
    if (!up) return false;
    const lv = s.prestigeUpgrades[upgradeId] || 0;
    if (up.maxLevel > 0 && lv >= up.maxLevel) return false;

    const cost = up.baseCost.mul(Decimal.pow(up.growth, lv)).floor();

    if (up.layer === 1) {
      if (s.arcaneStars.lt(cost)) return false;
      set({
        arcaneStars: s.arcaneStars.sub(cost),
        prestigeUpgrades: { ...s.prestigeUpgrades, [upgradeId]: lv + 1 },
      });
    } else if (up.layer === 2) {
      if (s.dimensionalEssence.lt(cost)) return false;
      set({
        dimensionalEssence: s.dimensionalEssence.sub(cost),
        prestigeUpgrades: { ...s.prestigeUpgrades, [upgradeId]: lv + 1 },
      });
    } else if (up.layer === 3) {
      if (s.cosmicShards.lt(cost)) return false;
      set({
        cosmicShards: s.cosmicShards.sub(cost),
        prestigeUpgrades: { ...s.prestigeUpgrades, [upgradeId]: lv + 1 },
      });
    } else {
      if (s.omegaSeeds.lt(cost)) return false;
      set({
        omegaSeeds: s.omegaSeeds.sub(cost),
        prestigeUpgrades: { ...s.prestigeUpgrades, [upgradeId]: lv + 1 },
      });
    }

    soundEngine.playUpgrade();
    soundEngine.triggerHaptic(18);
    get().showToast(`✨ ${up.name} Nv.${lv + 1} ativado!`);
    return true;
  },

  performPrestigeLayer: (layer) => {
    const s = get();
    const dimStarMult = Decimal.pow(2, s.prestigeUpgrades['dim_star_boost'] || 0);
    const echoMult = 1 + 0.25 * (s.heroStars['aurelius_echo'] || 0);

    if (layer === 1) {
      const gain = calculateArcaneStarsGain(s.runGold).mul(dimStarMult).mul(echoMult).floor();
      if (gain.lte(0)) return false;
      soundEngine.playPrestige();
      soundEngine.triggerHaptic(35);
      set({
        arcaneStars: s.arcaneStars.add(gain),
        gold: ZERO,
        runGold: ZERO,
        floor: 1,
        stationLevels: initialStationLevels(),
        passXp: s.passXp + 30,
      });
      get().showToast(`⭐ Renomeação concluída! +${gain.toString()} Estrelas Arcanas!`);
      return true;
    }

    if (layer === 2) {
      const gain = calculateDimensionalEssenceGain(s.arcaneStars);
      if (gain.lte(0)) return false;
      soundEngine.playPrestige();
      soundEngine.triggerHaptic(40);
      set({
        dimensionalEssence: s.dimensionalEssence.add(gain),
        arcaneStars: ZERO,
        gold: ZERO,
        runGold: ZERO,
        floor: 1,
        stationLevels: initialStationLevels(),
        passXp: s.passXp + 55,
      });
      get().showToast(`🌌 Ascensão de Reino! +${gain.toString()} Essência Dimensional!`);
      return true;
    }

    if (layer === 3) {
      const gain = calculateCosmicShardsGain(s.dimensionalEssence);
      if (gain.lte(0)) return false;
      soundEngine.playPrestige();
      soundEngine.triggerHaptic(45);
      set({
        cosmicShards: s.cosmicShards.add(gain),
        dimensionalEssence: ZERO,
        arcaneStars: ZERO,
        gold: ZERO,
        runGold: ZERO,
        floor: 1,
        stationLevels: initialStationLevels(),
        passXp: s.passXp + 85,
      });
      get().showToast(`🪐 Fusão do Caldeirão! +${gain.toString()} Fragmentos Cósmicos!`);
      return true;
    }

    const gain = calculateOmegaSeedsGain(s.cosmicShards);
    if (gain.lte(0)) return false;
    soundEngine.playPrestige();
    soundEngine.triggerHaptic(50);
    set({
      omegaSeeds: s.omegaSeeds.add(gain),
      omegaCycleCount: s.omegaCycleCount + 1,
      cosmicShards: ZERO,
      dimensionalEssence: ZERO,
      arcaneStars: ZERO,
      gold: ZERO,
      runGold: ZERO,
      floor: 1,
      stationLevels: initialStationLevels(),
      gems: s.gems + 80,
      passXp: s.passXp + 140,
    });
    get().showToast(`♾️ CICLO ÔMEGA #${s.omegaCycleCount + 1} INICIADO! (+80 Gemas)`);
    return true;
  },

  toggleAutoBuyer: () => {
    soundEngine.playClick();
    set((s) => ({ autoBuyerEnabled: !s.autoBuyerEnabled }));
  },

  toggleAutoPrestige: () => {
    soundEngine.playClick();
    set((s) => ({ autoPrestigeEnabled: !s.autoPrestigeEnabled }));
  },

  claimQuest: (type) => {
    const s = get();
    const lv = s.questClaimedLevel[type];
    const targets = {
      taps: (lv + 1) * 40,
      upgrades: (lv + 1) * 20,
      floors: (lv + 1) * 3,
      raids: (lv + 1) * 2,
    };
    const currents = {
      taps: s.tapsCount,
      upgrades: s.upgradesCount,
      floors: s.highestFloor,
      raids: s.raidsWon,
    };
    if (currents[type] < targets[type]) return;

    const gemReward = 10 + lv * 4;
    soundEngine.playUpgrade();
    soundEngine.triggerHaptic(18);
    set({
      gems: s.gems + gemReward,
      passXp: s.passXp + 18,
      questClaimedLevel: { ...s.questClaimedLevel, [type]: lv + 1 },
    });
    get().showToast(`🎯 Missão concluída! +${gemReward} Gemas & +18 XP do Passe!`);
  },

  claimPassReward: (level, track) => {
    const s = get();
    const tier = BATTLE_PASS_TIERS.find((t) => t.level === level);
    if (!tier || s.passXp < tier.xpRequired) return;
    if (track === 'gold' && !s.goldenPass) {
      s.showToast('Ative o Passe do Caldeirão na Loja para resgatar a trilha dourada!');
      return;
    }

    const claimedList = track === 'free' ? s.claimedFreeTiers : s.claimedGoldTiers;
    if (claimedList.includes(level)) return;

    const rType = track === 'free' ? tier.freeType : tier.goldType;
    const rAmt = track === 'free' ? tier.freeAmount : tier.goldAmount;

    let addGems = 0;
    let addKeys = 0;
    let addGold = ZERO;
    if (rType === 'gems') addGems = rAmt;
    if (rType === 'keys') addKeys = rAmt;
    if (rType === 'warp') addGold = s.getTimeWarpGold(rAmt);

    soundEngine.playChestOpen();
    soundEngine.triggerHaptic(22);

    set({
      gems: s.gems + addGems,
      chestKeys: s.chestKeys + addKeys,
      gold: s.gold.add(addGold),
      runGold: s.runGold.add(addGold),
      totalGold: s.totalGold.add(addGold),
      claimedFreeTiers: track === 'free' ? [...s.claimedFreeTiers, level] : s.claimedFreeTiers,
      claimedGoldTiers: track === 'gold' ? [...s.claimedGoldTiers, level] : s.claimedGoldTiers,
    });

    get().showToast(`🎁 Recompensa do Passe Nv.${level} resgatada!`);
  },

  triggerAdBoost: () => {
    const s = get();
    const twoHours = 2 * 3600 * 1000;
    const base = Math.max(Date.now(), s.adBoostEndsAt);
    soundEngine.playFever();
    soundEngine.triggerHaptic(20);
    set({ adBoostEndsAt: base + twoHours });
    get().showToast(
      s.noAds
        ? '⚡ Sem Anúncios: Boost ×2 de 2h ativado instantaneamente!'
        : '📺 Recompensa recebida: Boost ×2 de Ouro por 2 horas!'
    );
  },

  triggerAdGems: () => {
    soundEngine.playCoin(10);
    soundEngine.triggerHaptic(16);
    set((s) => ({ gems: s.gems + 15 }));
    get().showToast('💎 +15 Gemas Ametista do Mercador Errante!');
  },

  buyStarterPack: () => {
    const s = get();
    if (s.starterPackBought) return;
    const warpGold = s.getTimeWarpGold(4 * 3600);
    soundEngine.playChestOpen();
    soundEngine.triggerHaptic(35);
    set({
      starterPackBought: true,
      gems: s.gems + 250,
      heroStars: { ...s.heroStars, ignis: Math.max(1, (s.heroStars['ignis'] || 0) + 1) },
      gold: s.gold.add(warpGold),
      runGold: s.runGold.add(warpGold),
      totalGold: s.totalGold.add(warpGold),
    });
    get().showToast('🐉 Pacote do Aprendiz ativado! Ignis + 250 Gemas + Warp 4h!');
  },

  buyNoAds: () => {
    if (get().noAds) return;
    soundEngine.playPrestige();
    soundEngine.triggerHaptic(30);
    set((s) => ({ noAds: true, gems: s.gems + 100 }));
    get().showToast('🛡️ Passe Sem Anúncios Vitalício ativado! Todos os buffs são instantâneos!');
  },

  buyGoldenPass: () => {
    if (get().goldenPass) return;
    soundEngine.playPrestige();
    soundEngine.triggerHaptic(30);
    set((s) => ({ goldenPass: true, passXp: s.passXp + 50 }));
    get().showToast('👑 Passe do Caldeirão (Trilha Dourada) desbloqueado!');
  },

  buyVipClub: () => {
    if (get().vipClub) return;
    soundEngine.playPrestige();
    soundEngine.triggerHaptic(30);
    set((s) => ({ vipClub: true, gems: s.gems + 100, vipLastDailyClaim: Date.now() }));
    get().showToast('💜 Clube VIP ativo! +100 Gemas/dia, +35% lucro e 24h Offline!');
  },

  claimVipDailyGems: () => {
    const s = get();
    if (!s.vipClub) return;
    const elapsed = Date.now() - s.vipLastDailyClaim;
    if (elapsed < 60_000) {
      s.showToast('Gemas VIP já coletadas recentemente!');
      return;
    }
    soundEngine.playCoin(12);
    set({ gems: s.gems + 100, vipLastDailyClaim: Date.now() });
    get().showToast('💜 +100 Gemas Diárias do Clube VIP coletadas!');
  },

  buyPermanentX2: () => {
    if (get().permanentX2) return;
    soundEngine.playPrestige();
    soundEngine.triggerHaptic(35);
    set({ permanentX2: true });
    get().showToast('🏆 Caldeirão de Ouro ×2 Permanente ativado em todas as dimensões!');
  },

  buyTimeWarp: (seconds, gemCost) => {
    const s = get();
    if (s.gems < gemCost) {
      s.showToast('Gemas insuficientes! Visite os pacotes acima ou derrote o Barão.');
      return false;
    }
    const gained = s.getTimeWarpGold(seconds);
    soundEngine.playFever();
    soundEngine.triggerHaptic(25);
    set({
      gems: s.gems - gemCost,
      gold: s.gold.add(gained),
      runGold: s.runGold.add(gained),
      totalGold: s.totalGold.add(gained),
    });
    get().showToast('⏳ Cápsula Temporal aberta! Ouro escalado adicionado!');
    return true;
  },

  buyGemPackSandbox: (gemsAmount, label) => {
    soundEngine.playChestOpen();
    soundEngine.triggerHaptic(25);
    set((s) => ({ gems: s.gems + gemsAmount }));
    get().showToast(`💎 [Sandbox] ${label}: +${gemsAmount} Gemas adicionadas!`);
  },

  openChest: (type, useKey) => {
    const s = get();
    const gemCost = type === 'epic' ? 80 : 250;

    if (useKey) {
      if (s.chestKeys < 1) return false;
    } else if (s.gems < gemCost) {
      s.showToast('Gemas insuficientes para este baú!');
      return false;
    }

    const nextPityEpic = type === 'epic' ? s.pityEpic + 1 : s.pityEpic;
    const nextPityCel = type === 'celestial' ? s.pityCelestial + 1 : s.pityCelestial;

    let selectedHero: HeroDef;
    let resetPityEpic = nextPityEpic;
    let resetPityCel = nextPityCel;

    if (type === 'celestial') {
      const roll = Math.random();
      if (nextPityCel >= 10 || roll < 0.12) {
        selectedHero = HEROES.find((h) => h.id === 'solaris_titan')!;
        resetPityCel = 0;
      } else if (roll < 0.38) {
        selectedHero = HEROES.find((h) => h.id === 'aurelius_echo')!;
      } else if (roll < 0.72) {
        selectedHero = HEROES.find((h) => h.id === 'ignis')!;
      } else {
        selectedHero = HEROES.find((h) => h.id === 'cedric')!;
      }
    } else {
      const roll = Math.random();
      if (nextPityEpic >= 5 || roll < 0.2) {
        selectedHero = HEROES.find((h) => h.id === 'cedric')!;
        resetPityEpic = 0;
      } else if (roll < 0.55) {
        selectedHero = HEROES.find((h) => h.id === 'lyra')!;
      } else if (roll < 0.85) {
        selectedHero = HEROES.find((h) => h.id === 'zephyr')!;
      } else {
        selectedHero = HEROES.find((h) => h.id === 'barnabe')!;
      }
    }

    const prevStars = s.heroStars[selectedHero.id] || 0;
    const newStars = prevStars + 1;
    const bonusGems = type === 'celestial' ? 25 : 8;

    soundEngine.playChestOpen();
    soundEngine.triggerHaptic(32);

    set({
      gems: s.gems - (useKey ? 0 : gemCost) + bonusGems,
      chestKeys: s.chestKeys - (useKey ? 1 : 0),
      heroStars: { ...s.heroStars, [selectedHero.id]: newStars },
      pityEpic: resetPityEpic,
      pityCelestial: resetPityCel,
      passXp: s.passXp + (type === 'celestial' ? 35 : 15),
      chestModal: {
        chestType: type,
        hero: selectedHero,
        rarity: selectedHero.rarity,
        bonusGems,
        isNew: prevStars === 0,
        newStars,
      },
    });
    return true;
  },

  restorePurchasesSandbox: () => {
    soundEngine.playClick();
    get().showToast('✅ Compras verificadas e sincronizadas (RevenueCat Sandbox OK).');
  },

  tick: (dtSeconds) => {
    const s = get();
    const gps = s.getTotalGps();
    const earned = gps.mul(dtSeconds);

    let nextGold = s.gold.add(earned);
    let nextRunGold = s.runGold.add(earned);
    let nextTotalGold = s.totalGold.add(earned);
    let nextStars = s.arcaneStars;
    let nextStations = s.stationLevels;
    let changedStations = false;

    // Auto-Prestige (Layer 3 Upgrade)
    if ((s.prestigeUpgrades['cos_autoprestige'] || 0) > 0 && s.autoPrestigeEnabled) {
      const pending = calculateArcaneStarsGain(nextRunGold);
      if (pending.gt(0)) {
        nextStars = nextStars.add(pending.mul(0.02 * dtSeconds));
      }
    }

    // Auto-Buyer (Layer 2 Upgrade)
    if ((s.prestigeUpgrades['dim_autobuyer'] || 0) > 0 && s.autoBuyerEnabled) {
      const floorScale = Decimal.pow(1.06, s.floor - 1);
      for (const st of STATIONS) {
        const lv = nextStations[st.id] || 0;
        const cost = getStationBulkCost(st.baseCost, st.growthRate, lv, 1, floorScale);
        if (nextGold.gte(cost.mul(2))) {
          nextGold = nextGold.sub(cost);
          if (!changedStations) {
            nextStations = { ...nextStations };
            changedStations = true;
          }
          nextStations[st.id] = lv + 1;
        }
      }
    }

    const inFever = Date.now() < s.feverEndsAt;
    const passiveCharge =
      inFever || gps.lte(0) ? s.feverCharge : Math.min(100, s.feverCharge + dtSeconds * 0.45);

    set({
      gold: nextGold,
      runGold: nextRunGold,
      totalGold: nextTotalGold,
      arcaneStars: nextStars,
      feverCharge: passiveCharge,
      ...(changedStations ? { stationLevels: nextStations } : {}),
    });
  },

  saveGame: () => {
    const s = get();
    const payload = {
      gold: s.gold.toString(),
      runGold: s.runGold.toString(),
      totalGold: s.totalGold.toString(),
      arcaneStars: s.arcaneStars.toString(),
      dimensionalEssence: s.dimensionalEssence.toString(),
      cosmicShards: s.cosmicShards.toString(),
      omegaSeeds: s.omegaSeeds.toString(),
      gems: s.gems,
      chestKeys: s.chestKeys,
      floor: s.floor,
      highestFloor: s.highestFloor,
      omegaCycleCount: s.omegaCycleCount,
      stationLevels: s.stationLevels,
      heroStars: s.heroStars,
      prestigeUpgrades: s.prestigeUpgrades,
      autoBuyerEnabled: s.autoBuyerEnabled,
      autoPrestigeEnabled: s.autoPrestigeEnabled,
      feverCharge: s.feverCharge,
      feverEndsAt: s.feverEndsAt,
      adBoostEndsAt: s.adBoostEndsAt,
      bossStage: s.bossStage,
      passXp: s.passXp,
      claimedFreeTiers: s.claimedFreeTiers,
      claimedGoldTiers: s.claimedGoldTiers,
      tapsCount: s.tapsCount,
      upgradesCount: s.upgradesCount,
      raidsWon: s.raidsWon,
      questClaimedLevel: s.questClaimedLevel,
      noAds: s.noAds,
      starterPackBought: s.starterPackBought,
      permanentX2: s.permanentX2,
      vipClub: s.vipClub,
      goldenPass: s.goldenPass,
      vipLastDailyClaim: s.vipLastDailyClaim,
      pityEpic: s.pityEpic,
      pityCelestial: s.pityCelestial,
      soundEnabled: s.soundEnabled,
      tutorialStep: s.tutorialStep,
      lastSavedAt: Date.now(),
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      set({ lastSavedAt: payload.lastSavedAt });
    } catch {
      // Ignore storage quota errors
    }
  },

  loadGame: () => {
    try {
      localStorage.removeItem('taverna_infinita_save_v1');
      localStorage.removeItem('taverna_infinita_save_v2');
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return;
      const p = JSON.parse(raw);
      soundEngine.enabled = p.soundEnabled ?? true;

      set({
        gold: D(p.gold),
        runGold: D(p.runGold),
        totalGold: D(p.totalGold),
        arcaneStars: D(p.arcaneStars),
        dimensionalEssence: D(p.dimensionalEssence),
        cosmicShards: D(p.cosmicShards),
        omegaSeeds: D(p.omegaSeeds),
        gems: Number(p.gems) || 0,
        chestKeys: Number(p.chestKeys) || 0,
        floor: Math.max(1, Number(p.floor) || 1),
        highestFloor: Math.max(1, Number(p.highestFloor) || Number(p.floor) || 1),
        omegaCycleCount: Number(p.omegaCycleCount) || 0,
        stationLevels: { ...initialStationLevels(), ...(p.stationLevels || {}) },
        heroStars: { ...initialHeroStars(), ...(p.heroStars || {}) },
        prestigeUpgrades: p.prestigeUpgrades || {},
        autoBuyerEnabled: p.autoBuyerEnabled ?? true,
        autoPrestigeEnabled: p.autoPrestigeEnabled ?? true,
        feverCharge: Number(p.feverCharge) || 0,
        feverEndsAt: Number(p.feverEndsAt) || 0,
        adBoostEndsAt: Number(p.adBoostEndsAt) || 0,
        bossStage: Math.max(1, Number(p.bossStage) || 1),
        passXp: Number(p.passXp) || 0,
        claimedFreeTiers: Array.isArray(p.claimedFreeTiers) ? p.claimedFreeTiers : [],
        claimedGoldTiers: Array.isArray(p.claimedGoldTiers) ? p.claimedGoldTiers : [],
        tapsCount: Number(p.tapsCount) || 0,
        upgradesCount: Number(p.upgradesCount) || 0,
        raidsWon: Number(p.raidsWon) || 0,
        questClaimedLevel: {
          taps: 0,
          upgrades: 0,
          floors: 0,
          raids: 0,
          ...(p.questClaimedLevel || {}),
        },
        noAds: Boolean(p.noAds),
        starterPackBought: Boolean(p.starterPackBought),
        permanentX2: Boolean(p.permanentX2),
        vipClub: Boolean(p.vipClub),
        goldenPass: Boolean(p.goldenPass),
        vipLastDailyClaim: Number(p.vipLastDailyClaim) || 0,
        pityEpic: Number(p.pityEpic) || 0,
        pityCelestial: Number(p.pityCelestial) || 0,
        soundEnabled: p.soundEnabled ?? true,
        tutorialStep: typeof p.tutorialStep === 'number' ? p.tutorialStep : -1,
        lastSavedAt: Number(p.lastSavedAt) || Date.now(),
      });

      const now = Date.now();
      const elapsedSec = Math.floor((now - (Number(p.lastSavedAt) || now)) / 1000);
      if (elapsedSec >= 30 && elapsedSec < 60 * 60 * 24 * 365) {
        const capHours = p.vipClub ? 24 : 8;
        const effectiveSec = Math.min(elapsedSec, capHours * 3600);
        const gps = get().getTotalGps();
        const earned = gps.mul(effectiveSec).mul(0.8).floor();
        if (earned.gt(5)) {
          set({
            offlinePopup: {
              secondsAway: effectiveSec,
              goldEarned: earned,
              cappedHours: capHours,
            },
          });
        }
      }
    } catch {
      // Ignore corrupt save
    }
  },

  resetGame: () => {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  },
}));
