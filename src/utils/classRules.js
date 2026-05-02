import { WEAPONS } from "../config/weapons.js";

export function canUseWeapon(playerClass, weaponKey) {
  if (!playerClass?.allowedWeapons) return false;
  if (!WEAPONS[weaponKey]) return false;

  return playerClass.allowedWeapons.includes(weaponKey);
}