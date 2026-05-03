export const ENEMY_TYPES = {
  basic: {
    key: "AshenHollowling",
    hp: 55, damage: 10, speed: 75, xp: 10,
    scale: 1.0, tint: 0xffffff,
    label: "Иссушённый Мертвец",
    behavior: "chase"
  },
  fast: {
    key: "VeilboundStalker",
    hp: 28, damage: 9, speed: 130, xp: 15,
    scale: 0.75, tint: 0xffffff,
    label: "Охотник Завесы",
    behavior: "flank"
  },
  tank: {
    key: "IronjawBrute",
    hp: 200, damage: 18, speed: 45, xp: 28,
    scale: 1.35, tint: 0xffffff,
    label: "Железночелюстной Громила",
    behavior: "chase"
  },
  shooter: {
    key: "RiftscarCultist",
    hp: 48, damage: 14, speed: 50, xp: 22,
    scale: 0.9, tint: 0xffffff,
    label: "Культист Разлома",
    ranged: true, shootCooldown: 2200, bulletSpeed: 180,
    behavior: "kite"
  },
  flanker: {
    key: "WitchmarkedReaver",
    hp: 42, damage: 12, speed: 115, xp: 18,
    scale: 0.85, tint: 0xffffff,
    label: "Меченый Налётчик",
    behavior: "flank"
  },
  marauder: {
    key: "GravebornMarauder",
    hp: 80, damage: 16, speed: 90, xp: 20,
    scale: 1.0, tint: 0xffffff,
    label: "Мародёр Могильников",
    behavior: "chase"
  },
  harvester: {
    key: "NightveilHarvester",
    hp: 38, damage: 17, speed: 45, xp: 25,
    scale: 0.95, tint: 0xffffff,
    label: "Жнец Ночи",
    ranged: true, shootCooldown: 1800, bulletSpeed: 200,
    behavior: "kite"
  },
  sentinel: {
    key: "BonecladSentinel",
    hp: 170, damage: 18, speed: 38, xp: 26,
    scale: 1.2, tint: 0xffffff,
    label: "Костяной Страж",
    behavior: "chase"
  },
  knight: {
    key: "SunderedKnight",
    hp: 120, damage: 22, speed: 65, xp: 24,
    scale: 1.1, tint: 0xffffff,
    label: "Сломленный Рыцарь",
    behavior: "flank"
  },
  abomination: {
    key: "FleshwarpAbomination",
    hp: 320, damage: 24, speed: 35, xp: 50,
    scale: 1.6, tint: 0xffffff,
    label: "Плотяная Мерзость",
    behavior: "chase"
  },
  boss: {
    key: "boss",
    hp: 550, damage: 26, speed: 55, xp: 120,
    scale: 2.0, tint: 0xffffff,
    label: "БОСС",
    isBoss: true,
    behavior: "chase"
  }
};
