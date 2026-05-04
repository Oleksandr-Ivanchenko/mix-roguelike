import Phaser from "phaser";

const MAGIC_WEAPONS  = new Set(["fire", "ice", "plasma", "earth", "magicStaff", "necroStaff"]);
const BULLET_WEAPONS = new Set(["bullet"]);

const BASE_VOL = {
  arrow: 0.38, magic: 0.40, bullet: 0.45, explode: 0.48, crit: 0.55,
  drop: 0.28, monAtk: 0.48, bossAtk: 0.60, die1: 0.42, die2: 0.42,
  playerDie: 0.70, step: 0.20,
};

export class SoundSystem {
  constructor(scene) {
    this.scene   = scene;
    this._stepAt = 0;

    this._musicVol   = parseFloat(localStorage.getItem("vol_music") ?? "0.45");
    this._sfxVol     = parseFloat(localStorage.getItem("vol_sfx")   ?? "1.0");
    this._musicMuted = localStorage.getItem("mute_music") === "1";
    this._sfxMuted   = localStorage.getItem("mute_sfx")   === "1";
    this._music      = null;
    this._musicKey   = null;

    const m = this._sfxMuted ? 0 : this._sfxVol;
    this._s = {
      arrow:     scene.sound.add("sfx_arrow",     { volume: BASE_VOL.arrow     * m }),
      magic:     scene.sound.add("sfx_magic",     { volume: BASE_VOL.magic     * m }),
      bullet:    scene.sound.add("sfx_bullet",    { volume: BASE_VOL.bullet    * m }),
      explode:   scene.sound.add("sfx_explode",   { volume: BASE_VOL.explode   * m }),
      crit:      scene.sound.add("sfx_crit",      { volume: BASE_VOL.crit      * m }),
      drop:      scene.sound.add("sfx_drop",      { volume: BASE_VOL.drop      * m }),
      monAtk:    scene.sound.add("sfx_monAtk",    { volume: BASE_VOL.monAtk    * m }),
      bossAtk:   scene.sound.add("sfx_bossAtk",   { volume: BASE_VOL.bossAtk   * m }),
      die1:      scene.sound.add("sfx_die1",      { volume: BASE_VOL.die1      * m }),
      die2:      scene.sound.add("sfx_die2",      { volume: BASE_VOL.die2      * m }),
      playerDie: scene.sound.add("sfx_playerDie", { volume: BASE_VOL.playerDie * m }),
      step:      scene.sound.add("sfx_step",      { volume: BASE_VOL.step      * m }),
    };
  }

  // ── Music ─────────────────────────────────────────────────────────────────
  startMusic(key) {
    if (this._musicKey === key && this._music?.isPlaying) return;
    this._music?.stop();
    this._music = this.scene.sound.add(key, {
      volume: this._musicMuted ? 0 : this._musicVol,
      loop: true,
    });
    this._music.play();
    this._musicKey = key;
  }

  stopMusic() {
    this._music?.stop();
    this._music = null;
    this._musicKey = null;
  }

  // ── Volume getters ────────────────────────────────────────────────────────
  get musicVolume() { return this._musicVol; }
  get sfxVolume()   { return this._sfxVol; }
  get musicMuted()  { return this._musicMuted; }
  get sfxMuted()    { return this._sfxMuted; }

  // ── Volume setters ────────────────────────────────────────────────────────
  setMusicVolume(v) {
    this._musicVol = Math.min(1, Math.max(0, v));
    localStorage.setItem("vol_music", this._musicVol);
    if (this._music && !this._musicMuted) this._music.setVolume(this._musicVol);
  }

  setSfxVolume(v) {
    this._sfxVol = Math.min(1, Math.max(0, v));
    localStorage.setItem("vol_sfx", this._sfxVol);
    this._applySfxVol();
  }

  toggleMusicMute() {
    this._musicMuted = !this._musicMuted;
    localStorage.setItem("mute_music", this._musicMuted ? "1" : "0");
    if (this._music) this._music.setVolume(this._musicMuted ? 0 : this._musicVol);
    return this._musicMuted;
  }

  toggleSfxMute() {
    this._sfxMuted = !this._sfxMuted;
    localStorage.setItem("mute_sfx", this._sfxMuted ? "1" : "0");
    this._applySfxVol();
    return this._sfxMuted;
  }

  _applySfxVol() {
    const m = this._sfxMuted ? 0 : this._sfxVol;
    for (const [k, snd] of Object.entries(this._s)) {
      snd.setVolume((BASE_VOL[k] ?? 0.4) * m);
    }
  }

  // ── SFX ──────────────────────────────────────────────────────────────────
  _p(snd, cfg = {}) {
    if (this._sfxMuted) return;
    snd.play({ detune: Phaser.Math.Between(-60, 60), ...cfg });
  }

  playShot(weaponKey) {
    if (BULLET_WEAPONS.has(weaponKey)) { this._p(this._s.bullet); return; }
    this._p(MAGIC_WEAPONS.has(weaponKey) ? this._s.magic : this._s.arrow);
  }

  playCrit()              { this._p(this._s.crit); }
  playExplode(vol = 0.48) { this._p(this._s.explode, { volume: vol * this._sfxVol }); }
  playDrop()              { this._p(this._s.drop); }
  playEnemyHit(isBoss)    { this._p(isBoss ? this._s.bossAtk : this._s.monAtk); }

  playEnemyDeath(isBoss) {
    this._p(isBoss ? this._s.explode : (Math.random() < 0.5 ? this._s.die1 : this._s.die2),
            isBoss ? { volume: 0.65 * this._sfxVol } : {});
  }

  playPlayerDeath() { this._p(this._s.playerDie); }

  playStep(now, moving) {
    if (!moving || now - this._stepAt < 340) return;
    this._stepAt = now;
    this._p(this._s.step);
  }
}
