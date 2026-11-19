import Decimal from 'break_eternity.js';

export type DecimalInput = Decimal | string | number | undefined | null;

export const ZERO = new Decimal(0);
export const ONE = new Decimal(1);

export function D(value: DecimalInput): Decimal {
  if (value instanceof Decimal) {
    return value.isNan() ? ZERO : value;
  }
  if (value === undefined || value === null || value === '') {
    return ZERO;
  }
  try {
    const parsed = new Decimal(value);
    return parsed.isNan() ? ZERO : parsed;
  } catch {
    return ZERO;
  }
}

const STANDARD_SUFFIXES = [
  '',
  'K',
  'M',
  'B',
  'T',
  'Qa',
  'Qi',
  'Sx',
  'Sp',
  'Oc',
  'No',
  'Dc',
  'Ud',
  'Dd',
  'Td',
  'Qad',
  'Qid',
];

function getAlphaSuffix(tier: number): string {
  const first = Math.floor(tier / 26);
  const second = tier % 26;
  if (first >= 26) return '';
  return String.fromCharCode(97 + first) + String.fromCharCode(97 + second);
}

/**
 * Formats arbitrarily massive break_eternity.js Decimals cleanly for mobile HUDs.
 */
export function formatBig(raw: DecimalInput, decimals = 2): string {
  const val = D(raw);
  if (val.lte(0)) return '0';
  if (val.lt(1000)) {
    return val.lt(10) && !val.eq(val.floor())
      ? val.toNumber().toFixed(1)
      : Math.floor(val.toNumber()).toString();
  }

  if (val.layer >= 2) {
    return `ee${val.slog(10).toFixed(2)}`;
  }

  const exp = Math.floor(val.log10().toNumber());
  if (exp >= 2000) {
    const mantissa = val.div(Decimal.pow(10, exp)).toNumber();
    return `${mantissa.toFixed(2)}e${exp}`;
  }

  const group = Math.floor(exp / 3);
  const scaled = val.div(Decimal.pow(10, group * 3)).toNumber();
  const formattedNum =
    scaled >= 100
      ? scaled.toFixed(0)
      : scaled >= 10
        ? scaled.toFixed(Math.min(1, decimals))
        : scaled.toFixed(decimals);

  if (group < STANDARD_SUFFIXES.length) {
    return `${formattedNum}${STANDARD_SUFFIXES[group]}`;
  }

  const alphaTier = group - STANDARD_SUFFIXES.length;
  const alpha = getAlphaSuffix(alphaTier);
  if (alpha) {
    return `${formattedNum}${alpha}`;
  }

  const mantissa = val.div(Decimal.pow(10, exp)).toNumber();
  return `${mantissa.toFixed(2)}e${exp}`;
}

/**
 * Classic Idle Tycoon Station Cost Formula:
 * C(n) = C0 * floorScale * r^n * (1 + 0.12 * floor(n / 25))
 */
export function getStationSingleCost(
  baseCost: Decimal,
  growthRate: number,
  level: number,
  floorScale: Decimal
): Decimal {
  const stepFactor = 1 + 0.12 * Math.floor(level / 25);
  return baseCost
    .mul(floorScale)
    .mul(Decimal.pow(growthRate, level))
    .mul(stepFactor)
    .floor();
}

export function getStationBulkCost(
  baseCost: Decimal,
  growthRate: number,
  currentLevel: number,
  count: number,
  floorScale: Decimal
): Decimal {
  if (count <= 0) return ZERO;
  if (count === 1) {
    return getStationSingleCost(baseCost, growthRate, currentLevel, floorScale);
  }
  if (count <= 100) {
    let total = ZERO;
    for (let i = 0; i < count; i++) {
      total = total.add(getStationSingleCost(baseCost, growthRate, currentLevel + i, floorScale));
    }
    return total;
  }
  const first = getStationSingleCost(baseCost, growthRate, currentLevel, floorScale);
  const r = new Decimal(growthRate);
  return first.mul(Decimal.pow(r, count).sub(1)).div(r.sub(1)).floor();
}

export function getMaxAffordableCount(
  gold: Decimal,
  baseCost: Decimal,
  growthRate: number,
  currentLevel: number,
  floorScale: Decimal,
  cap = 200
): { count: number; totalCost: Decimal } {
  let count = 0;
  let totalCost = ZERO;
  let remaining = gold;

  while (count < cap) {
    const nextCost = getStationSingleCost(
      baseCost,
      growthRate,
      currentLevel + count,
      floorScale
    );
    if (remaining.lt(nextCost)) break;
    remaining = remaining.sub(nextCost);
    totalCost = totalCost.add(nextCost);
    count++;
  }

  return { count, totalCost };
}

/**
 * Authentic Idle Milestone Burst Multiplier:
 * x2 every 25 levels, x3 every 100 levels (makes saving for Lv 25/50/100 super rewarding!)
 */
export function getMilestoneMultiplier(level: number): Decimal {
  if (level <= 0) return ONE;
  const m25 = Math.floor(level / 25);
  const m100 = Math.floor(level / 100);
  return Decimal.pow(2, m25).mul(Decimal.pow(3, m100));
}

export function getNextMilestone(level: number): number {
  return (Math.floor(level / 25) + 1) * 25;
}

/**
 * Layer 1 Prestige (Estrelas Arcanas) — authentic ~25-45 min first prestige threshold (1M gold).
 * E = floor(10 * (runGold / 1e6)^0.33)
 */
export function calculateArcaneStarsGain(runGold: Decimal): Decimal {
  const threshold = new Decimal(1_000_000);
  if (runGold.lt(threshold)) return ZERO;
  return runGold.div(threshold).pow(0.33).mul(10).floor();
}

/**
 * Layer 2 Prestige (Essência Dimensional) — requires 500 Arcane Stars.
 */
export function calculateDimensionalEssenceGain(arcaneStars: Decimal): Decimal {
  if (arcaneStars.lt(500)) return ZERO;
  return arcaneStars.div(500).pow(0.4).mul(5).floor();
}

/**
 * Layer 3 Prestige (Fragmentos Cósmicos) — requires 250 Dimensional Essence.
 */
export function calculateCosmicShardsGain(essence: Decimal): Decimal {
  if (essence.lt(250)) return ZERO;
  return essence.div(250).pow(0.45).mul(3).floor();
}

/**
 * Layer 4 Infinite Prestige (Sementes Eternas Ômega) — requires 150 Cosmic Shards.
 */
export function calculateOmegaSeedsGain(shards: Decimal): Decimal {
  if (shards.lt(150)) return ZERO;
  return shards.div(150).pow(0.5).mul(2).floor();
}
