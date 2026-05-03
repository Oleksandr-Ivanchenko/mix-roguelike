import Phaser from "phaser";
import { WEAPONS } from "../config/weapons.js";

export class CombatSystem {
  constructor(scene, fx, orbSystem) {
    this.scene     = scene;
    this.fx        = fx;
    this.orbSystem = orbSystem;
  }

  shoot(tx, ty) {
    const s = this.scene;
    if (s.playerClass && s.playerClass.attackType === "melee") {
      return this._meleeAttack(tx, ty);
    }

    const now = s.time.now;
    const cfg = WEAPONS[s.selectedWeapon];
    const cd  = cfg.cooldown * s.cooldownMult;
    if (now - s.lastShot < cd) return;
    s.lastShot = now;

    const angle = Phaser.Math.Angle.Between(s.player.x, s.player.y, tx, ty);
    const total = 1 + s.multishot; // 1, 2, 3, ...

    s.resourceSystem?.onAttack();

    // Первый снаряд — немедленно
    this._spawnProjectile(cfg, angle);

    // Остальные — один за другим с задержкой 80мс
    for (let i = 1; i < total; i++) {
      s.time.delayedCall(i * 80, () => {
        if (s.player && s.player.active) {
          this._spawnProjectile(cfg, angle);
        }
      });
    }
  }

  _spawnProjectile(cfg, baseAngle) {
    const s = this.scene;
    s.sfx?.playShot(s.selectedWeapon);

    // ── Accuracy / spread ────────────────────────────────────────────────────
    const { angle, isPrecise } = this._applySpread(baseAngle, cfg);

    const proj = s.physics.add.sprite(s.player.x, s.player.y, cfg.key);
    proj.setDisplaySize(s.T * cfg.scale, s.T * cfg.scale).setDepth(4);
    proj.setTint(cfg.tint);
    proj.damage = Math.floor(cfg.damage * s.damageMult);

    const baseCrit = Math.random() < s.critChance;
    // Precision bonus: perfect aim grants an extra 35% crit chance
    const precisionCrit = isPrecise && !baseCrit && Math.random() < 0.35;
    if (baseCrit || precisionCrit) {
      proj.damage = Math.floor(proj.damage * s.critMult);
      proj.isCrit = true;
    }

    proj.wTint    = cfg.tint;
    proj.isPierce = s.pierce;
    proj._rotOff  = cfg.rotationOffset || 0;
    proj.bounces  = s.ricochetBounces  || 0;
    if (proj.bounces > 0) proj._hitEnemies = new Set();
    s.projectiles.add(proj);
    const spd = cfg.speed * (s.projectileSpeedMult || 1);
    proj.body.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
    proj.rotation = angle + proj._rotOff;
    s.time.delayedCall(2500, () => { if (proj.active) proj.destroy(); });
  }

  // Returns { angle, isPrecise }
  // isPrecise = deviation ≤ 2° → triggers precision-crit bonus
  _applySpread(baseAngle, cfg) {
    const s        = this.scene;
    const accuracy = Math.max(0.30, (s.accuracy ?? 0.90) - (s._isMoving ? 0.20 : 0));
    const isPrecise = Math.random() < accuracy;

    // Per-weapon spread caps (degrees); fallback defaults
    const hitDeg  = cfg.hitSpread  ?? 3;
    const missDeg = cfg.missSpread ?? 15;
    const maxDeg  = isPrecise ? hitDeg : missDeg;

    const offset = (Math.random() * 2 - 1) * Phaser.Math.DegToRad(maxDeg);
    const isTinyDeviation = Math.abs(offset) <= Phaser.Math.DegToRad(2);

    return { angle: baseAngle + offset, isPrecise: isPrecise && isTinyDeviation };
  }

  hitEnemy(proj, enemy) {
    if (!proj.active || !enemy.active) return;
    // Ricochet: skip enemies already struck by this projectile
    if (proj._hitEnemies?.has(enemy)) return;
    proj._hitEnemies?.add(enemy);

    const s = this.scene;

    if (proj.isCrit) {
      this.fx.crit(proj.x, proj.y, proj.damage);
      s.sfx?.playCrit();
      const dist = Phaser.Math.Distance.Between(s.player.x, s.player.y, enemy.x, enemy.y);
      s.resourceSystem?.onCrit(dist);
    } else {
      this.fx.hit(proj.x, proj.y, proj.wTint);
      s.resourceSystem?.onAccurateHit?.();
    }

    this._applyHit(enemy, proj.damage, proj.x, proj.y);

    if (s.lifesteal > 0) {
      s.playerHP = Math.min(s.playerMaxHP, s.playerHP + s.lifesteal);
      s.hud.refreshHP(s.playerHP, s.playerMaxHP);
    }

    // ── Взрывные стрелы ──────────────────────────────────────────────────────
    if (s.explosiveArrows) {
      this.fx.explosion(enemy.x, enemy.y);
      s.sfx?.playExplode(0.45);
      const aoeRadius = s.explosionRadius || 70;
      s.enemies.getChildren().forEach(e => {
        if (!e.active || e === enemy) return;
        if (Phaser.Math.Distance.Between(e.x, e.y, enemy.x, enemy.y) < aoeRadius) {
          this._applyHit(e, Math.floor(proj.damage * 0.5), e.x, e.y);
        }
      });
    }

    // ── Цепная молния ─────────────────────────────────────────────────────────
    if (s.chainLightning && !proj._chained) {
      const chainTargets = s.enemies.getChildren()
        .filter(e => e.active && e !== enemy)
        .sort((a, b) =>
          Phaser.Math.Distance.Between(a.x, a.y, enemy.x, enemy.y) -
          Phaser.Math.Distance.Between(b.x, b.y, enemy.x, enemy.y)
        ).slice(0, 2);
      chainTargets.forEach(e => {
        if (Phaser.Math.Distance.Between(e.x, e.y, enemy.x, enemy.y) > 250) return;
        this.fx.chainArc(enemy.x, enemy.y, e.x, e.y);
        this._applyHit(e, Math.floor(proj.damage * 0.65), e.x, e.y);
      });
    }

    // ── Расщепление ───────────────────────────────────────────────────────────
    if (s.arrowSplit && !proj._isSplit && (s.cascadeRicochet || !proj._isBounce)) {
      const ba = Math.atan2(proj.body.velocity.y, proj.body.velocity.x);
      [0.63, -0.63].forEach(off => {
        const sp = this._spawnSplitProjectile(proj, ba + off, enemy.x, enemy.y);
        sp.damage = Math.floor(proj.damage * 0.45);
      });
    }

    // ── Рикошет ───────────────────────────────────────────────────────────────
    if ((proj.bounces ?? 0) > 0) {
      const next = this._findBounceTarget(enemy, proj._hitEnemies);
      if (next) {
        proj.bounces--;
        proj.damage  = Math.floor(proj.damage * 0.80);
        proj._isBounce = true;
        const ang = Phaser.Math.Angle.Between(enemy.x, enemy.y, next.x, next.y);
        const spd = Math.hypot(proj.body.velocity.x, proj.body.velocity.y) || 260;
        proj.body.setVelocity(Math.cos(ang) * spd, Math.sin(ang) * spd);
        proj.rotation = ang + proj._rotOff;
        proj.setTint(0x44eeff);
        return; // keep alive — don't destroy
      }
    }

    if (!proj.isPierce) proj.destroy();
  }

  _findBounceTarget(fromEnemy, hitSet) {
    let best = null, bestDist = 220;
    for (const e of this.scene.enemies.getChildren()) {
      if (!e.active || hitSet?.has(e)) continue;
      const d = Phaser.Math.Distance.Between(fromEnemy.x, fromEnemy.y, e.x, e.y);
      if (d < bestDist) { bestDist = d; best = e; }
    }
    return best;
  }

  _spawnSplitProjectile(parent, angle, x, y) {
    const s   = this.scene;
    const cfg = WEAPONS[s.selectedWeapon];
    const sp  = s.physics.add.sprite(x, y, cfg.key);
    sp.setDisplaySize(s.T * cfg.scale * 0.75, s.T * cfg.scale * 0.75).setDepth(4);
    sp.setTint(0x88ddff);
    sp._isSplit   = true;
    sp._rotOff    = cfg.rotationOffset || 0;
    sp.isPierce   = parent.isPierce;
    sp.isCrit     = false;
    sp.wTint      = cfg.tint;
    sp._hitEnemies = parent._hitEnemies ? new Set(parent._hitEnemies) : undefined;
    s.projectiles.add(sp);
    const spd = cfg.speed * (s.projectileSpeedMult || 1) * 0.82;
    sp.body.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
    sp.rotation = angle + sp._rotOff;
    s.time.delayedCall(2000, () => { if (sp.active) sp.destroy(); });
    return sp;
  }
  // ── Melee: three-phase attack (windup → swing → recovery) ─────────────────
  _meleeAttack(tx, ty) {
    const s   = this.scene;
    const now = s.time.now;
    const cfg = WEAPONS[s.selectedWeapon];
    const cd  = cfg.cooldown * s.cooldownMult;

    if (s._meleeSwinging) return;          // state lock — no interrupting mid-swing
    if (now - s.lastShot < cd) return;
    s.lastShot       = now;
    s._meleeSwinging = true;

    const ph       = cfg.phases ?? { windup: 80, swing: 80, recovery: 120, arcHalf: Math.PI / 3, luneSpeed: 160, knockback: 220 };
    const arcHalf  = ph.arcHalf  ?? Math.PI / 3;
    const luneSpd  = ph.luneSpeed ?? 160;
    const kbForce  = ph.knockback ?? 220;

    const angle = Phaser.Math.Angle.Between(s.player.x, s.player.y, tx, ty);
    const sx = s.player.x, sy = s.player.y;   // snapshot position at attack start

    s.resourceSystem?.onAttack();

    // ── PHASE 1: WINDUP — blade pulls back ─────────────────────────────────
    const sword = s.add.image(sx, sy, cfg.iconKey || cfg.key)
      .setDisplaySize(s.T * 1.1, s.T * 0.18)
      .setOrigin(0.08, 0.5)
      .setDepth(10)
      .setAlpha(0.75);
    sword.rotation = angle - arcHalf;         // pulled back behind attack direction

    s.tweens.add({ targets: sword, alpha: 0.95, duration: ph.windup, ease: "Linear" });

    // ── PHASE 2: SWING — blade sweeps forward ─────────────────────────────
    s.time.delayedCall(ph.windup, () => {
      if (!s.player?.active) { this._endMeleeSwing(sword); return; }

      s._meleeLunging = true;
      s.player.body.setVelocity(Math.cos(angle) * luneSpd, Math.sin(angle) * luneSpd);

      s.tweens.add({
        targets:  sword,
        rotation: angle + arcHalf,
        x: sx + Math.cos(angle) * 18,
        y: sy + Math.sin(angle) * 18,
        duration: ph.swing,
        ease:     "Cubic.easeOut",
      });

      this._drawSlashArc(sx, sy, angle, arcHalf, cfg.tint, ph.swing + 80);

      // Hit detection fires at 45% into the swing (peak of arc)
      s.time.delayedCall(Math.floor(ph.swing * 0.45), () => {
        this._doMeleeHit(angle, arcHalf, cfg, kbForce);
      });

      // ── PHASE 3: RECOVERY — brake + fade ──────────────────────────────
      s.time.delayedCall(ph.swing, () => {
        s._meleeLunging = false;
        if (s.player?.active) s.player.body.setVelocity(0, 0);

        s.tweens.add({
          targets:  sword,
          alpha:    0,
          rotation: angle + arcHalf + 0.3,
          duration: ph.recovery * 0.6,
          ease:     "Cubic.easeIn",
          onComplete: () => sword.destroy(),
        });

        s.time.delayedCall(ph.recovery, () => { s._meleeSwinging = false; });
      });
    });
  }

  _drawSlashArc(cx, cy, angle, arcHalf, tint, duration) {
    const s   = this.scene;
    const gfx = s.add.graphics().setDepth(9);
    gfx.fillStyle(tint, 0.4);
    gfx.lineStyle(1.5, tint, 0.75);
    gfx.beginPath();
    gfx.moveTo(cx, cy);
    gfx.arc(cx, cy, 54, angle - arcHalf, angle + arcHalf, false);
    gfx.closePath();
    gfx.fillPath();
    gfx.strokePath();
    s.tweens.add({
      targets: gfx, alpha: 0, duration,
      ease: "Cubic.easeOut",
      onComplete: () => gfx.destroy(),
    });
  }

  _doMeleeHit(angle, arcHalf, cfg, kbForce) {
    const s     = this.scene;
    const range = s.playerClass.meleeRange ?? 72;
    let firstHit = true;

    s.enemies.getChildren().forEach(enemy => {
      if (!enemy.active) return;
      const dist = Phaser.Math.Distance.Between(s.player.x, s.player.y, enemy.x, enemy.y);
      if (dist > range) return;
      const ea = Phaser.Math.Angle.Between(s.player.x, s.player.y, enemy.x, enemy.y);
      if (Math.abs(Phaser.Math.Angle.Wrap(ea - angle)) > arcHalf + 0.1) return;

      const isCrit = Math.random() < s.critChance;
      let dmg = Math.floor(cfg.damage * s.damageMult);
      if (isCrit) {
        dmg = Math.floor(dmg * s.critMult);
        this.fx.crit(enemy.x, enemy.y, dmg);
        s.sfx?.playCrit();
        s.resourceSystem?.onCrit(0);
      } else {
        this.fx.hit(enemy.x, enemy.y, cfg.tint);
      }

      if (s.lifesteal > 0) {
        s.playerHP = Math.min(s.playerMaxHP, s.playerHP + s.lifesteal);
        s.hud.refreshHP(s.playerHP, s.playerMaxHP);
      }

      // Classify enemy size for differentiated reactions
      const isBig = (enemy.etype?.hp ?? 0) >= 150 || enemy.etype?.isBoss;

      // Hit pause: freeze enemy for 65ms before knockback lands
      if (enemy.body) enemy.body.setVelocity(0, 0);

      s.time.delayedCall(65, () => {
        if (!enemy.active) return;
        const force = isBig ? kbForce * 0.4 : kbForce;   // big enemies barely stagger
        this._applyHit(enemy, dmg, enemy.x, enemy.y, { angle, knockback: force });
      });

      // Screen shake only on first hit per swing (avoid double-shake)
      if (firstHit) {
        s.cameras.main.shake(isBig ? 85 : 50, isBig ? 0.011 : 0.007);
        firstHit = false;
      }
    });
  }

  _endMeleeSwing(sword) {
    const s = this.scene;
    s._meleeSwinging = false;
    s._meleeLunging  = false;
    sword.destroy();
  }

  // ── Применить урон к врагу + эффекты состояния ─────────────────────────────
  // opts.angle / opts.knockback override the default ranged knockback values
  _applyHit(enemy, dmg, hitX, hitY, opts = {}) {
    if (!enemy.active) return;
    const s = this.scene;
    enemy.hp -= dmg;

    // Отбрасывание — melee always knocks back; ranged requires s.knockback skill
    if ((s.knockback || opts.knockback) && enemy.body) {
      const kbAngle = opts.angle ?? Phaser.Math.Angle.Between(s.player.x, s.player.y, enemy.x, enemy.y);
      const kbForce = opts.knockback ?? 220;
      enemy.body.setVelocity(Math.cos(kbAngle) * kbForce, Math.sin(kbAngle) * kbForce);
      s.time.delayedCall(180, () => { if (enemy.active) enemy.body?.setVelocity(0, 0); });
    }

    // Заморозка
    if (s.freezeChance && !enemy.frozen && Math.random() < s.freezeChance) {
      enemy.frozen = true;
      enemy.setTint(0x88ddff);
      this.fx.freeze(hitX, hitY);
      s.time.delayedCall(1500, () => {
        if (enemy.active) { enemy.frozen = false; enemy.clearTint(); }
      });
    }

    // Поджог
    if (s.burnChance && !enemy.burning && Math.random() < s.burnChance) {
      enemy.burning = true;
      let ticks = 6;
      const burnDmg = Math.max(5, Math.floor(8 * s.damageMult));
      const burnTick = () => {
        if (!enemy.active || ticks <= 0) { if (enemy.active) enemy.burning = false; return; }
        enemy.hp -= burnDmg;
        this.fx.burn(enemy.x, enemy.y);
        if (enemy.hp <= 0) { this.killEnemy(enemy); return; }
        ticks--;
        s.time.delayedCall(500, burnTick);
      };
      s.time.delayedCall(500, burnTick);
    }

    if (enemy.hp <= 0) this.killEnemy(enemy);
    else this._refreshHpBar(enemy);
  }

  _refreshHpBar(enemy) {
    const barScale = enemy.etype.isBoss ? 3 : 1;
    if (enemy.hpBar) enemy.hpBar.displayWidth = 26 * Math.max(0, enemy.hp / enemy.maxHp) * barScale;
    if (!enemy.frozen) {
      enemy.setTint(0xffffff);
      this.scene.time.delayedCall(100, () => { if (enemy.active && !enemy.frozen) enemy.clearTint(); });
    }
  }

  hitPlayer(enemy) {
    const s   = this.scene;
    const now = s.time.now;
    if (now - s.lastHitTime < 600) return;
    s.lastHitTime = now;
    s.sfx?.playEnemyHit(enemy.etype?.isBoss);
    const dmg = enemy.etype ? enemy.etype.damage : 10;
    this._takeDamage(dmg);
  }

  _takeDamage(rawDmg) {
    const s = this.scene;
    if (s.shieldActive) { this.fx.shield(s.player.x, s.player.y); return; }
    if (s.dodgeChance && Math.random() < s.dodgeChance) {
      this.fx.hit(s.player.x, s.player.y, 0xffffff);
      return;
    }
    const dmg = Math.max(1, Math.floor(rawDmg * (1 - Math.min(s.armor, 90) / 100)));
    s.playerHP = Math.max(0, s.playerHP - dmg);
    s.resourceSystem?.onHit(dmg);
    s.hud.refreshHP(s.playerHP, s.playerMaxHP);
    s.cameras.main.shake(100, 0.007);
    s.player.setTint(0xff3333);
    s.time.delayedCall(180, () => { if (s.player.active) s.player.clearTint(); });
    if (s.playerHP <= 0) { s.sfx?.playPlayerDeath(); s.gameOver(); }
  }

  hitPlayerBullet(bullet) {
    const s   = this.scene;
    const now = s.time.now;
    if (!bullet.active) return;
    bullet.destroy();
    if (now - s.lastHitTime < 200) return;
    s.lastHitTime = now;
    s.sfx?.playEnemyHit(false);
    this._takeDamage(bullet.dmg || 10);
  }

  killEnemy(enemy) {
  if (!enemy.active) return;
  const s = this.scene;

  enemy.setActive(false);
  s.sfx?.playEnemyDeath(enemy.etype?.isBoss);

  this.fx.death(enemy.x, enemy.y);

  // Взрыв при смерти (aoeOnDeath)
  if (s.aoeOnDeath) {
    s.enemies.getChildren().forEach(e => {
      if (!e.active) return;
      const d = Phaser.Math.Distance.Between(e.x, e.y, enemy.x, enemy.y);
      if (d < 80) {
        e.hp -= Math.floor(40 * s.damageMult);
        this.fx.hit(e.x, e.y, 0xff6600);
        if (e.hp <= 0) this.killEnemy(e);
      }
    });
    this.fx.explosion(enemy.x, enemy.y);
    s.sfx?.playExplode(0.55);
  }

  // Аура вампира
  if (s.vampireAura) {
    s.playerHP = Math.min(s.playerMaxHP, s.playerHP + 8);
    s.hud.refreshHP(s.playerHP, s.playerMaxHP);
  }

  // Кровожажда (bloodlust + berserk → двойной вампиризм)
  if (s.bloodlust && s.berserkMode && s.lifesteal > 0) {
    s.playerHP = Math.min(s.playerMaxHP, s.playerHP + s.lifesteal);
    s.hud.refreshHP(s.playerHP, s.playerMaxHP);
  }

  this.orbSystem.spawn(enemy.x, enemy.y, enemy.etype.xp);
  if (s.oreDropSystem) s.oreDropSystem.drop(enemy);
  s.resourceSystem?.onKill();

  if (enemy.hpBg)      enemy.hpBg.destroy();
  if (enemy.hpBar)     enemy.hpBar.destroy();
  if (enemy.bossLabel) enemy.bossLabel.destroy();
  enemy.destroy();

  s.score += enemy.etype.xp;
  s.enemiesKilled++;
  s.waveKills = (s.waveKills || 0) + 1;
  s.hud.refreshScore(s.score);
  s.hud.refreshWave?.(s.waveKills, s.killTarget);

  if (s.enemiesKilled % 7 === 0) {
    s.time.delayedCall(500, () => s.enemySystem.spawn("boss"));
  }

  if (s.waveKills >= s.killTarget) {
    s._showWaveComplete();
  }
}
}
