// Weapon upgrade tiers.
// totalDmg:    cumulative additive bonus to s.damageMult at this tier
// totalCdFact: cumulative multiplier on s.cooldownMult at this tier (< 1 = faster)
// cost:        gold to upgrade FROM previous tier TO this tier

export const WEAPON_UPGRADES = {
  archer: [
    { label: "Сломанный лук",   iconKey: "Brokenbow",        cost: 0    },
    { label: "Деревянный лук",  iconKey: "wup_blow1",        cost: 50,   totalDmg: 0.10, totalCdFact: 0.95 },
    { label: "Охотничий лук",   iconKey: "wup_blow2",        cost: 130,  totalDmg: 0.22, totalCdFact: 0.90 },
    { label: "Боевой лук",      iconKey: "wup_blow3",        cost: 270,  totalDmg: 0.37, totalCdFact: 0.84 },
    { label: "Длинный лук",     iconKey: "wup_blow4",        cost: 480,  totalDmg: 0.55, totalCdFact: 0.78 },
    { label: "Золотой лук",     iconKey: "wup_blowgold",     cost: 750,  totalDmg: 0.75, totalCdFact: 0.72 },
    { label: "Эпический лук",   iconKey: "wup_blowepic",     cost: 1100, totalDmg: 0.98, totalCdFact: 0.66 },
    { label: "Легендарный лук", iconKey: "wup_blowLegend",   cost: 1600, totalDmg: 1.25, totalCdFact: 0.58 },
  ],
  warrior: [
    { label: "Меч воина",       iconKey: "swordWarrior",     cost: 0    },
    { label: "Короткий меч",    iconKey: "wup_sworld",       cost: 50,   totalDmg: 0.10, totalCdFact: 0.95 },
    { label: "Длинный меч",     iconKey: "wup_sworld1",      cost: 130,  totalDmg: 0.22, totalCdFact: 0.90 },
    { label: "Рыцарский меч",   iconKey: "wup_sworld2",      cost: 270,  totalDmg: 0.37, totalCdFact: 0.84 },
    { label: "Меч чемпиона",    iconKey: "wup_sworld3",      cost: 480,  totalDmg: 0.55, totalCdFact: 0.78 },
    { label: "Эпический меч",   iconKey: "wup_sworldEpic",   cost: 750,  totalDmg: 0.75, totalCdFact: 0.72 },
    { label: "Легендарный меч", iconKey: "wup_sworldLegend", cost: 1100, totalDmg: 0.98, totalCdFact: 0.64 },
  ],
};

export const CLASS_UPGRADE_TRACK = {
  warrior:    "warrior", rogue: "warrior", paladin: "warrior",
  archer:     "archer",  mage:  "archer",  necromancer: "archer",
  summoner:   "archer",  hunter: "archer",
};
