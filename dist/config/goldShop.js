// cls: array of class IDs that can see this item (undefined = everyone)
export const GOLD_SHOP_POOL = [
  // ── Universal ─────────────────────────────────────────────────────────────
  { label: "+60 HP",          icon: "❤️",  cost: 45,  apply: s => { s.playerHP = Math.min(s.playerMaxHP, s.playerHP + 60); s.hud.refreshHP(s.playerHP, s.playerMaxHP); } },
  { label: "+35 макс HP",     icon: "❤️",  cost: 65,  apply: s => { s.playerMaxHP += 35; s.playerHP = Math.min(s.playerHP + 35, s.playerMaxHP); s.hud.refreshHP(s.playerHP, s.playerMaxHP); } },
  { label: "+15% урон",       icon: "⚔️",  cost: 65,  apply: s => { s.damageMult += 0.15; } },
  { label: "+15% скорость",   icon: "👟",  cost: 55,  apply: s => { s.moveSpeed += 27; } },
  { label: "+10 броня",       icon: "🛡️",  cost: 60,  apply: s => { s.armor += 10; } },
  { label: "+2 HP/сек",       icon: "🌿",  cost: 55,  apply: s => { s.hpRegen += 2; } },
  { label: "+10% крит",       icon: "🎯",  cost: 70,  apply: s => { s.critChance += 0.10; } },
  { label: "+15% ск.атаки",   icon: "⚡",  cost: 70,  apply: s => { s.cooldownMult *= 0.85; } },
  { label: "+5 HP/удар",      icon: "🩸",  cost: 75,  apply: s => { s.lifesteal += 5; } },
  { label: "+20% опыта",      icon: "⭐",  cost: 50,  apply: s => { s.xpMult += 0.20; } },
  { label: "+40% крит.урон",  icon: "💥",  cost: 80,  apply: s => { s.critMult += 0.40; } },
  { label: "+12% уклонение",  icon: "🌫️",  cost: 75,  apply: s => { s.dodgeChance = Math.min((s.dodgeChance || 0) + 0.12, 0.50); } },

  // ── Melee classes ─────────────────────────────────────────────────────────
  { label: "+25 выносл.",     icon: "💪",  cost: 55,  cls: ["warrior","rogue","paladin"],
    apply: s => { s.maxStamina += 25; s.stamina = Math.min(s.stamina + 25, s.maxStamina); } },
  { label: "+20 брони",       icon: "🛡️",  cost: 80,  cls: ["warrior","paladin"],
    apply: s => { s.armor += 20; } },
  { label: "+8 шипов",        icon: "🌵",  cost: 65,  cls: ["warrior","paladin"],
    apply: s => { s.thorns = (s.thorns || 0) + 8; } },

  // ── Ranged classes ────────────────────────────────────────────────────────
  { label: "+30 маны",        icon: "💧",  cost: 55,  cls: ["archer","mage","necromancer","summoner","hunter"],
    apply: s => { s.maxMana += 30; s.mana = Math.min(s.mana + 30, s.maxMana); } },
  { label: "+1 снаряд",       icon: "🏹",  cost: 90,  cls: ["archer","hunter","mage","necromancer","summoner"],
    apply: s => { s.multishot = Math.min((s.multishot || 0) + 1, 4); } },
  { label: "+30% дальность",  icon: "🎯",  cost: 65,  cls: ["archer","hunter"],
    apply: s => { s.rangeBonus = (s.rangeBonus || 1) + 0.30; } },
  { label: "+25% скор. снар.",icon: "🚀",  cost: 60,  cls: ["archer","hunter","mage","necromancer","summoner"],
    apply: s => { s.projectileSpeedMult = (s.projectileSpeedMult || 1) + 0.25; } },
];
