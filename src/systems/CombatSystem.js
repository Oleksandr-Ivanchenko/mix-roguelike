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

  _spawnProjectile(cfg, angle) {
    const s    = this.scene;
    const proj = s.physics.add.sprite(s.player.x, s.player.y, cfg.key);
    proj.setDisplaySize(s.T * cfg.scale, s.T * cfg.scale).setDepth(4);
    proj.setTint(cfg.tint);
    proj.damage = Math.floor(cfg.damage * s.damageMult);
    if (Math.random() < s.critChance) {
      proj.damage = Math.floor(proj.damage * s.critMult);
      proj.isCrit = true;
    }
    proj.wTint    = cfg.tint;
    proj.isPierce = s.pierce;
    s.projectiles.add(proj);
    const spd = cfg.speed * (s.projectileSpeedMult || 1);
    proj.body.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
    proj.rotation = angle + (cfg.rotationOffset || 0);
    s.time.delayedCall(2500, () => { if (proj.active) proj.destroy(); });
  }

  hitEnemy(proj, enemy) {
    if (!proj.active || !enemy.active) return;
    const s = this.scene;

    if (proj.isCrit) {
      this.fx.crit(proj.x, proj.y, proj.damage);
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

    if (!proj.isPierce) proj.destroy();

    // ── Взрывные стрелы ──────────────────────────────────────────────────────
    if (s.explosiveArrows) {
      this.fx.explosion(enemy.x, enemy.y);
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

  }
  _meleeAttack(tx, ty) {
    const s   = this.scene;
    const now = s.time.now;
    const cfg = WEAPONS[s.selectedWeapon];
    const cd  = cfg.cooldown * s.cooldownMult;
    if (now - s.lastShot < cd) return;
    s.lastShot = now;

    s.resourceSystem?.onAttack();

    const range = s.playerClass.meleeRange || 72;
    const angle = Phaser.Math.Angle.Between(s.player.x, s.player.y, tx, ty);

    // ── Колющий удар ────────────────────────────────────────────────────────
    const bladeLen  = s.T * 1.1;  // длина клинка
    const bladeH    = s.T * 0.18; // толщина
    const thrustDst = 44;         // дистанция выпада

    const swingKey = cfg.iconKey || cfg.key;
    const sword = s.add.image(s.player.x, s.player.y, swingKey)
      .setDisplaySize(bladeLen, bladeH)
      .setOrigin(0.1, 0.5)
      .setDepth(10)
      .setTint(0xddeeff)
      .setAlpha(0.0);

    sword.rotation = angle;

    // замах назад (мгновенно)
    const retreatX = s.player.x - Math.cos(angle) * 10;
    const retreatY = s.player.y - Math.sin(angle) * 10;
    sword.setPosition(retreatX, retreatY);

    // выпад вперёд
    s.tweens.add({
      targets: sword,
      x: s.player.x + Math.cos(angle) * thrustDst,
      y: s.player.y + Math.sin(angle) * thrustDst,
      alpha: 0.95,
      scaleX: 1.05,
      duration: 65,
      ease: "Cubic.easeOut",
      onComplete: () => {
        // отдача назад
        s.tweens.add({
          targets: sword,
          x: s.player.x,
          y: s.player.y,
          alpha: 0,
          scaleX: 0.85,
          duration: 130,
          ease: "Cubic.easeIn",
          onComplete: () => sword.destroy()
        });
      }
    });

    // Хит на пике выпада (65ms)
    s.time.delayedCall(65, () => {
      s.enemies.getChildren().forEach(enemy => {
        if (!enemy.active) return;
        const d = Phaser.Math.Distance.Between(s.player.x, s.player.y, enemy.x, enemy.y);
        if (d > range) return;

        const enemyAngle = Phaser.Math.Angle.Between(s.player.x, s.player.y, enemy.x, enemy.y);
        if (Math.abs(Phaser.Math.Angle.Wrap(enemyAngle - angle)) > Math.PI / 3) return;

        const isCrit = Math.random() < s.critChance;
        let dmg = Math.floor(cfg.damage * s.damageMult);
        if (isCrit) { dmg = Math.floor(dmg * s.critMult); this.fx.crit(enemy.x, enemy.y, dmg); }
        else        this.fx.hit(enemy.x, enemy.y, cfg.tint);

        if (s.lifesteal > 0) {
          s.playerHP = Math.min(s.playerMaxHP, s.playerHP + s.lifesteal);
          s.hud.refreshHP(s.playerHP, s.playerMaxHP);
        }
        if (isCrit) s.resourceSystem?.onCrit(0);

        this._applyHit(enemy, dmg, enemy.x, enemy.y);
      });
    });
  }

  // ── Применить урон к врагу + эффекты состояния ─────────────────────────────
  _applyHit(enemy, dmg, hitX, hitY) {
    if (!enemy.active) return;
    const s = this.scene;
    enemy.hp -= dmg;

    // Отбрасывание
    if (s.knockback && enemy.body) {
      const angle = Phaser.Math.Angle.Between(s.player.x, s.player.y, enemy.x, enemy.y);
      enemy.body.setVelocity(Math.cos(angle) * 220, Math.sin(angle) * 220);
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
    if (s.playerHP <= 0) s.gameOver();
  }

  hitPlayerBullet(bullet) {
    const s   = this.scene;
    const now = s.time.now;
    if (!bullet.active) return;
    bullet.destroy();
    if (now - s.lastHitTime < 200) return;
    s.lastHitTime = now;
    this._takeDamage(bullet.dmg || 10);
  }

  killEnemy(enemy) {
  if (!enemy.active) return;
  const s = this.scene;

  enemy.setActive(false);

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
  s.hud.refreshScore(s.score);

  if (s.enemiesKilled % 7 === 0) {
    s.time.delayedCall(500, () => s.enemySystem.spawn("boss"));
  }
}
}
