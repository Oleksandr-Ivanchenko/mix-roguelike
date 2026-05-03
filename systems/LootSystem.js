import { ITEM_LIST } from "../config/items.js";

// Per context: dropChance per slot, how many slots, multipliers by rarity
const CTX = {
  normal: { dropChance: 0.50, rolls: 2, currency: 1.0, common: 1.0, rare: 0.8,  epic: 0.3,  legendary: 0.1 },
  elite:  { dropChance: 0.85, rolls: 3, currency: 0.5, common: 1.2, rare: 2.5,  epic: 3.0,  legendary: 1.5 },
  boss:   { dropChance: 1.0,  rolls: 6, currency: 0.3, common: 0.8, rare: 3.0,  epic: 5.0,  legendary: 8.0 },
};

export class LootSystem {
  rollLoot(context = "normal") {
    const ctx = CTX[context] ?? CTX.normal;
    const results = [];
    for (let i = 0; i < ctx.rolls; i++) {
      if (Math.random() > ctx.dropChance) continue;
      const item = this._pick(ctx);
      if (item) results.push(item);
    }
    return results;
  }

  _pick(ctx) {
    const pool = ITEM_LIST.map(item => {
      const mult = item.type === "currency"
        ? ctx.currency
        : ctx[item.rarity] ?? 1.0;
      return { item, w: item.weight * mult };
    }).filter(e => e.w > 0);

    const total = pool.reduce((s, e) => s + e.w, 0);
    let r = Math.random() * total;
    for (const { item, w } of pool) {
      r -= w;
      if (r <= 0) return item;
    }
    return pool.at(-1)?.item ?? null;
  }
}
