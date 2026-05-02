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
    unlockSkills: [
      "multishot",
      "pierce",
      "atk_speed",
      "dmg_up",
      "explosive_arrow"
    ],
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
    unlockSkills: [
      "whirlwind",
      "shield_bash",
      "berserk",
      "charge",
      "cleave"
    ],
    allowedWeapons: ["sword", "axe", "hammer"]
  },

  mage: {
    id: "mage",
    name: "Маг",
    weapon: "staff",
    baseStats: {
      moveSpeed: 150,
      damageMult: 1.25,
      critChance: 0.15,
      critMult: 2.2,
      manaRegen: 1.4
    },
    unlockSkills: [
      "fireball",
      "frost_nova",
      "arcane_missile",
      "teleport",
      "meteor"
    ],
    allowedWeapons: ["staff", "wand"]
  },

  rogue: {
    id: "rogue",
    name: "Разбойник",
    weapon: "dagger",
    baseStats: {
      moveSpeed: 195,
      damageMult: 0.95,
      critChance: 0.22,
      critMult: 2.5
    },
    unlockSkills: [
      "backstab",
      "shadow_step",
      "poison_dagger",
      "blade_fury",
      "smoke_bomb"
    ],
    allowedWeapons: ["dagger", "short_sword"]
  },

  paladin: {
    id: "paladin",
    name: "Паладин",
    weapon: "mace",
    baseStats: {
      moveSpeed: 165,
      damageMult: 1.05,
      critChance: 0.10,
      critMult: 1.9,
      armor: 30,
      healingMult: 1.3
    },
    unlockSkills: [
      "holy_smite",
      "divine_shield",
      "judgment",
      "consecration",
      "lay_on_hands"
    ],
    allowedWeapons: ["mace", "sword", "hammer"]
  },

  summoner: {
    id: "summoner",
    name: "Призыватель",
    weapon: "tome",
    baseStats: {
      moveSpeed: 155,
      damageMult: 0.85,
      critChance: 0.09,
      critMult: 1.7,
      summonCount: 3
    },
    unlockSkills: [
      "skeleton_army",
      "demon_pack",
      "spirit_wolves",
      "exploding_minions",
      "summon_golem"
    ],
    allowedWeapons: ["tome", "staff"]
  },

  hunter: {
    id: "hunter",
    name: "Охотник",
    weapon: "crossbow",
    baseStats: {
      moveSpeed: 175,
      damageMult: 1.1,
      critChance: 0.14,
      critMult: 2.1
    },
    unlockSkills: [
      "trap_net",
      "beast_companion",
      "aimed_shot",
      "camouflage",
      "explosive_trap"
    ],
    allowedWeapons: ["crossbow", "bow"]
  },

  necromancer: {
    id: "necromancer",
    name: "Некромант",
    weapon: "skull",
    baseStats: {
      moveSpeed: 148,
      damageMult: 1.12,
      critChance: 0.11,
      critMult: 2.0,
      lifeSteal: 0.08
    },
    unlockSkills: [
      "raise_dead",
      "bone_spear",
      "life_drain",
      "corpse_explosion",
      "death_aura"
    ],
    allowedWeapons: ["skull", "staff"]
  }
};