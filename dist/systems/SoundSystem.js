import Phaser from "phaser";

const MAGIC_WEAPONS  = new Set(["fire", "ice", "plasma", "earth", "magicStaff", "necroStaff"]);
const BULLET_WEAPONS = new Set(["bullet"]);

export class SoundSystem {
  constructor(scene) {
    this.scene   = scene;
    this._stepAt = 0;

    const add = (key, vol) => scene.sound.add(key, { volume: vol });

    this._s = {
      arrow:     add("sfx_arrow",     0.38),
      magic:     add("sfx_magic",     0.40),
      bullet:    add("sfx_bullet",    0.45),
      explode:   add("sfx_explode",   0.48),
      crit:      add("sfx_crit",      0.55),
      drop:      add("sfx_drop",      0.28),
      monAtk:    add("sfx_monAtk",   0.48),
      bossAtk:   add("sfx_bossAtk",  0.60),
      die1:      add("sfx_die1",      0.42),
      die2:      add("sfx_die2",      0.42),
      playerDie: add("sfx_playerDie", 0.70),
      step:      add("sfx_step",      0.20),
    };
  }

  _p(snd, cfg = {}) {
    snd.play({ detune: Phaser.Math.Between(-60, 60), ...cfg });
  }

  playShot(weaponKey) {
    if (BULLET_WEAPONS.has(weaponKey)) { this._p(this._s.bullet); return; }
    this._p(MAGIC_WEAPONS.has(weaponKey) ? this._s.magic : this._s.arrow);
  }

  playCrit()              { this._p(this._s.crit); }
  playExplode(vol = 0.48) { this._p(this._s.explode, { volume: vol }); }
  playDrop()              { this._p(this._s.drop); }

  playEnemyHit(isBoss)   { this._p(isBoss ? this._s.bossAtk : this._s.monAtk); }

  playEnemyDeath(isBoss) {
    this._p(isBoss ? this._s.explode : (Math.random() < 0.5 ? this._s.die1 : this._s.die2),
            isBoss ? { volume: 0.65 } : {});
  }

  playPlayerDeath() { this._p(this._s.playerDie); }

  playStep(now, moving) {
    if (!moving || now - this._stepAt < 340) return;
    this._stepAt = now;
    this._p(this._s.step);
  }
}
