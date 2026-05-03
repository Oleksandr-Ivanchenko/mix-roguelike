export const ENEMY_TYPES = {
  basic: {
    key: "AshenHollowling",
    hp: 60, damage: 12, speed: 90, xp: 10,
    scale: 1.0, tint: 0xffffff,
    label: "Иссушённый Мертвец",
    behavior: "chase"
  },
  fast: {
    key: "VeilboundStalker",
    hp: 30, damage: 10, speed: 160, xp: 15,
    scale: 0.75, tint: 0xffffff,
    label: "Охотник Завесы",
    behavior: "flank"
  },
  tank: {
    key: "IronjawBrute",
    hp: 220, damage: 22, speed: 55, xp: 28,
    scale: 1.35, tint: 0xffffff,
    label: "Железночелюстной Громила",
    behavior: "chase"
  },
  shooter: {
    key: "RiftscarCultist",
    hp: 50, damage: 16, speed: 60, xp: 22,
    scale: 0.9, tint: 0xffffff,
    label: "Культист Разлома",
    ranged: true, shootCooldown: 1800, bulletSpeed: 220,
    behavior: "kite"
  },
  flanker: {
    key: "WitchmarkedReaver",
    hp: 45, damage: 14, speed: 140, xp: 18,
    scale: 0.85, tint: 0xffffff,
    label: "Меченый Налётчик",
    behavior: "flank"
  },
  marauder: {
    key: "GravebornMarauder",
    hp: 85, damage: 18, speed: 110, xp: 20,
    scale: 1.0, tint: 0xffffff,
    label: "Мародёр Могильников",
    behavior: "chase"
  },
  harvester: {
    key: "NightveilHarvester",
    hp: 40, damage: 20, speed: 55, xp: 25,
    scale: 0.95, tint: 0xffffff,
    label: "Жнец Ночи",
    ranged: true, shootCooldown: 1400, bulletSpeed: 250,
    behavior: "kite"
  },
  sentinel: {
    key: "BonecladSentinel",
    hp: 180, damage: 20, speed: 45, xp: 26,
    scale: 1.2, tint: 0xffffff,
    label: "Костяной Страж",
    behavior: "chase"
  },
  knight: {
    key: "SunderedKnight",
    hp: 130, damage: 25, speed: 80, xp: 24,
    scale: 1.1, tint: 0xffffff,
    label: "Сломленный Рыцарь",
    behavior: "flank"
  },
  abomination: {
    key: "FleshwarpAbomination",
    hp: 350, damage: 28, speed: 42, xp: 50,
    scale: 1.6, tint: 0xffffff,
    label: "Плотяная Мерзость",
    behavior: "chase"
  },
  boss: {
    key: "boss",
    hp: 600, damage: 30, speed: 65, xp: 120,
    scale: 2.0, tint: 0xffffff,
    label: "БОСС",
    isBoss: true,
    behavior: "chase"
  }
};
