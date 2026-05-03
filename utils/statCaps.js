// Hard caps — prevent any single stat from making the player unkillable
export function applyStatCaps(s) {
  // Damage: cap at 4× base
  s.damageMult   = Math.min(s.damageMult,   4.0);
  // Attack speed: can't go below 30% cooldown (3.3× speed)
  s.cooldownMult = Math.max(s.cooldownMult, 0.30);
  // Lifesteal: hard cap 25 HP/hit
  s.lifesteal    = Math.min(s.lifesteal,    25);
  // Crit: 80% max chance, 3.5× max mult
  s.critChance   = Math.min(s.critChance,   0.80);
  s.critMult     = Math.min(s.critMult,     3.5);
  // Armor: 70% reduction max (was 90%)
  s.armor        = Math.min(s.armor,        70);
  // Move speed cap
  s.moveSpeed    = Math.min(s.moveSpeed,    320);
  // Multishot cap
  s.multishot    = Math.min(s.multishot,    4);
  // HP regen cap
  s.hpRegen      = Math.min(s.hpRegen,     20);
  // Stamina/Mana regen
  s.staminaRegen = Math.min(s.staminaRegen, 40);
  s.manaRegen    = Math.min(s.manaRegen,    30);
}
