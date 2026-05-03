export const CLASSES = {
  archer: {
    id: "archer",
    name: "Лучник",
    heroKey: "hero_archer",
    weapon: "brokenbow",
    baseStats: {
      moveSpeed: 180,
      damageMult: 1.0,
      critChance: 0.12,
      critMult: 2.0
    },
    allowedWeapons: ["brokenbow"]
  },

  warrior: {
    id: "warrior",
    name: "Воин",
    heroKey: "hero_warrior",
    weapon: "sword",
    attackType: "melee",
    meleeRange: 72,
    baseStats: {
      moveSpeed: 160,
      damageMult: 1.15,
      critChance: 0.08,
      critMult: 1.8,
      armor: 25
    },
    allowedWeapons: ["sword"]
  },

  rogue: {
    id: "rogue",
    name: "Разбойник",
    heroKey: "hero_rogue",
    weapon: "dagger",
    attackType: "melee",
    meleeRange: 60,
    baseStats: {
      moveSpeed: 200,
      damageMult: 0.95,
      critChance: 0.25,
      critMult: 2.5
    },
    allowedWeapons: ["dagger"]
  },

  paladin: {
    id: "paladin",
    name: "Паладин",
    heroKey: "hero_paladin",
    weapon: "paladinSword",
    attackType: "melee",
    meleeRange: 80,
    baseStats: {
      moveSpeed: 155,
      damageMult: 1.1,
      critChance: 0.10,
      critMult: 1.9,
      armor: 30
    },
    allowedWeapons: ["paladinSword"]
  },

  mage: {
    id: "mage",
    name: "Маг",
    heroKey: "hero_mage",
    weapon: "magicStaff",
    baseStats: {
      moveSpeed: 150,
      damageMult: 1.3,
      critChance: 0.15,
      critMult: 2.2
    },
    allowedWeapons: ["magicStaff"]
  },

  necromancer: {
    id: "necromancer",
    name: "Некромант",
    heroKey: "hero_necromancer",
    weapon: "necroStaff",
    baseStats: {
      moveSpeed: 148,
      damageMult: 1.2,
      critChance: 0.12,
      critMult: 2.0
    },
    allowedWeapons: ["necroStaff"]
  },

  summoner: {
    id: "summoner",
    name: "Призыватель",
    heroKey: "hero_summoner",
    weapon: "magicStaff",
    baseStats: {
      moveSpeed: 155,
      damageMult: 0.9,
      critChance: 0.09,
      critMult: 1.7
    },
    allowedWeapons: ["magicStaff"]
  },

  hunter: {
    id: "hunter",
    name: "Охотник",
    heroKey: "hero_hunter",
    weapon: "brokenbow",
    baseStats: {
      moveSpeed: 175,
      damageMult: 1.1,
      critChance: 0.14,
      critMult: 2.1
    },
    allowedWeapons: ["brokenbow"]
  },
};
