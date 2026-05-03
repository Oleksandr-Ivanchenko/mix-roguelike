// Hard caps — prevent any single stat from making the player unkillable
export function applyStatCaps(s) {
  // Damage: cap at 4× base
  s.damageMult   = Math.min(s.damageMult,   3.5);
  s.cooldownMult = Math.max(s.cooldownMult, 0.35);
  s.lifesteal    = Math.min(s.lifesteal,    20);
  s.critChance   = Math.min(s.critChance,   0.75);
  s.critMult     = Math.min(s.critMult,     3.0);
  s.armor        = Math.min(s.armor,        65);
  s.moveSpeed    = Math.min(s.moveSpeed,    290);
  s.multishot    = Math.min(s.multishot,    4);
  // HP regen cap
  s.hpRegen      = Math.min(s.hpRegen,     20);
  // Stamina/Mana regen
  s.staminaRegen = Math.min(s.staminaRegen, 40);
  s.manaRegen    = Math.min(s.manaRegen,    30);
}
