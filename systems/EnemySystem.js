import Phaser from "phaser";
import { ENEMY_TYPES } from "../config/enemies.js";

const MUTATIONS = {
  elite:   { label: "★",  tint: 0xffdd00, hpMult: 1.6,  dmgMult: 1.3,  speedMult: 1.0  },
  armored: { label: "🛡", tint: 0x8888cc, hpMult: 2.0,  dmgMult: 1.0,  speedMult: 0.85 },
  speedy:  { label: "⚡", tint: 0x00ddff, hpMult: 0.85, dmgMult: 1.1,  speedMult: 1.7  },
  regen:   { label: "♻", tint: 0x44ff88, hpMult: 1.3,  dmgMult: 1.0,  speedMult: 1.0  },
};

export class EnemySystem {
  constructor(scene) {
    this.scene = scene;
  }

  _getDiff() {
    const s = this.scene;
    const timeSec   = Math.max(0, (s.time.now - s.gameStartTime) / 1000);
    const waveBonus = 1 + ((s.waveNumber || 1) - 1) * 0.22;

    // Gentle early ramp (caps at +50% after ~2.5min), then hard ramp after 5 min
    const earlyRamp = Math.min(timeSec * 0.003, 0.5);
    const lateRamp  = Math.max(0, timeSec - 300) * 0.013;
    return (1 + earlyRamp + lateRamp) * waveBonus;
  }

  _pickType() {
    const s    = this.scene;
    const roll = Math.random();
    const wave = s.waveNumber || 1;
    const t    = Math.max(0, (s.time.now - s.gameStartTime) / 1000);

    // Time gates: harder enemies only after enough time has passed
    if (s.level >= 8  && t >= 420 && roll < 0.05) return "boss";
    if (s.level >= 7  && t >= 360 && roll < 0.10) return "abomination";
    if (s.level >= 6  && t >= 270 && roll < 0.16) return "harvester";
    if (s.level >= 5  && t >= 210 && roll < 0.23) return "knight";
    if (s.level >= 5  && t >= 180 && roll < 0.30) return "flanker";
    if (s.level >= 4  && t >= 150 && roll < 0.38) return "shooter";
    if (s.level >= 4  && t >= 150 && roll < 0.46) return "sentinel";
    if (s.level >= 3  && t >= 120 && roll < 0.55) return "tank";
    if (s.level >= 3  && t >=  90 && roll < 0.63) return "marauder";
    if (s.level >= 2  &&             roll < 0.74) return "fast";
    if (wave  >= 2    &&             roll < 0.82) return "flanker";
    return "basic";
  }

  _spawnPos() {
    const s  = this.scene;
    const px = s.player?.x ?? 0, py = s.player?.y ?? 0;

    // Pass 1: open floor tile (no wall neighbors) far from player
    for (let tries = 0; tries < 80; tries++) {
      const ex = 1 + Math.floor(Math.random() * (s.mapW - 2));
      const ey = 1 + Math.floor(Math.random() * (s.mapH - 2));
      if (s.map[ey]?.[ex] !== 1) continue;
      const hasWallNeighbor =
        s.map[ey - 1]?.[ex] === 0 || s.map[ey + 1]?.[ex] === 0 ||
        s.map[ey]?.[ex - 1] === 0 || s.map[ey]?.[ex + 1] === 0;
      if (hasWallNeighbor) continue;
      const wx = ex * s.T + s.T / 2, wy = ey * s.T + s.T / 2;
      if (Phaser.Math.Distance.Between(wx, wy, px, py) < 180) continue;
      return { ex, ey };
    }

    // Pass 2: any floor tile far from player
    for (let tries = 0; tries < 120; tries++) {
      const ex = 1 + Math.floor(Math.random() * (s.mapW - 2));
      const ey = 1 + Math.floor(Math.random() * (s.mapH - 2));
      if (s.map[ey]?.[ex] !== 1) continue;
      const wx = ex * s.T + s.T / 2, wy = ey * s.T + s.T / 2;
      if (Phaser.Math.Distance.Between(wx, wy, px, py) < 180) continue;
      return { ex, ey };
    }

    return null;
  }

  spawn(forceType) {
    const s    = this.scene;
    const diff = this._getDiff();
    const pos  = this._spawnPos();
    if (!pos) return;
    this._createEnemy(pos.ex, pos.ey, forceType || this._pickType(), [], diff);
  }

  spawnEliteWave() {
    const s    = this.scene;
    const diff = this._getDiff();
    const count = 6 + Math.floor(diff * 0.5);
    for (let i = 0; i < count; i++) {
      const pos = this._spawnPos();
      if (pos) this._createEnemy(pos.ex, pos.ey, this._pickType(), ["elite"], diff);
    }
  }

  spawnWaveBoss() {
    const s    = this.scene;
    const diff = this._getDiff();
    const pos  = this._spawnPos();
    if (!pos) return;

    // Wave boss: heavily buffed boss with all mutations
    const boss = this._createEnemy(pos.ex, pos.ey, "boss", ["elite", "armored"], diff * 3);
    if (!boss) return;
    boss._isWaveBoss = true;
    boss.setTint(0xffaa00);
    const sz = boss.displayWidth * 1.6;
    boss.setDisplaySize(sz, sz);
    if (boss.bossLabel) {
      boss.bossLabel.setText("☠ ВОЛНОВОЙ БОСС");
      boss.bossLabel.setStyle({ fontSize: "13px", color: "#ffaa00", fontFamily: "monospace", fontStyle: "bold" });
    }
  }

  spawnMiniBoss() {
    const s    = this.scene;
    const diff = this._getDiff();
    const roll  = Math.random();
    const mutations = roll < 0.5 ? ["elite", "armored"] : ["elite", "speedy"];
    const pos = this._spawnPos();
    if (pos) this._createEnemy(pos.ex, pos.ey, "boss", mutations, diff);
  }

  _createEnemy(ex, ey, typeName, mutations, diff) {
    const s      = this.scene;
    const etype  = ENEMY_TYPES[typeName];
    if (!etype) return;

    let hpMult  = diff;
    let dmgMult = diff * 0.9;   // damage scales faster
    let spdMult = 1 + diff * 0.04;
    let tint    = etype.tint;

    for (const mKey of mutations) {
      const m = MUTATIONS[mKey];
      if (!m) continue;
      hpMult  *= m.hpMult;
      dmgMult *= m.dmgMult;
      spdMult *= m.speedMult;
      tint = m.tint;
    }

    const e = s.physics.add.sprite(
      ex * s.T + s.T / 2,
      ey * s.T + s.T / 2,
      etype.key
    );
    const sz = Math.floor((s.T - 2) * etype.scale);
    e.setDisplaySize(sz, sz).setDepth(2);
    e.body.setSize(Math.min(22, sz - 4), Math.min(22, sz - 4));
    e.setTint(tint);
    e.hp       = Math.floor(etype.hp * hpMult);
    e.maxHp    = e.hp;
    e.mutations = new Set(mutations);
    e.etype    = {
      ...etype,
      damage: Math.floor(etype.damage * dmgMult),
      speed:  etype.speed * spdMult,
    };
    e.lastShot  = 0;
    e.lastRegen = 0;

    const barW = etype.isBoss ? 80 : 28;
    e.hpBg  = s.add.rectangle(e.x, e.y - 22, barW + 2, 5, 0x222222).setDepth(5);
    const barColor = mutations.includes("regen") ? 0x44ff88
                   : mutations.includes("armored") ? 0x8888cc
                   : etype.isBoss ? 0xff0055 : 0xff2222;
    e.hpBar = s.add.rectangle(e.x - barW / 2, e.y - 22, barW, 3, barColor)
      .setDepth(6).setOrigin(0, 0.5);

    if (etype.isBoss || mutations.length > 0) {
      const bossLabel = etype.isBoss ? "☠ БОСС" : "";
      const mutLabels = mutations.map(m => MUTATIONS[m]?.label ?? "").join(" ");
      const labelStr  = [bossLabel, mutLabels].filter(Boolean).join(" ");
      if (labelStr) {
        e.bossLabel = s.add.text(e.x, e.y - 34, labelStr, {
          fontSize: "10px",
          color: mutations.includes("elite") ? "#ffdd00" : "#ff0055",
          fontFamily: "monospace", fontStyle: "bold"
        }).setOrigin(0.5).setDepth(7);
      }
    }

    s.enemies.add(e);
    return e;
  }

  shootFrom(e) {
    const s = this.scene;
    const b = s.add.circle(e.x, e.y, 5, 0x00ddff).setDepth(4);
    s.physics.add.existing(b);
    b.body.setCircle(5);
    b.dmg = e.etype.damage;
    s.enemyBullets.add(b);
    const a = Phaser.Math.Angle.Between(e.x, e.y, s.player.x, s.player.y);
    b.body.setVelocity(
      Math.cos(a) * e.etype.bulletSpeed,
      Math.sin(a) * e.etype.bulletSpeed
    );
    s.time.delayedCall(3000, () => { if (b.active) b.destroy(); });
  }

  update(now) {
    const s = this.scene;
    s.enemies.getChildren().forEach(e => {
      if (!e.active) return;

      // Regen mutation
      if (e.mutations?.has("regen") && now - e.lastRegen > 1000) {
        e.lastRegen = now;
        e.hp = Math.min(e.maxHp, e.hp + Math.ceil(e.maxHp * 0.02));
      }

      const dist = Phaser.Math.Distance.Between(e.x, e.y, s.player.x, s.player.y);
      const spd = e.frozen ? e.etype.speed * 0.3
                : s.timeWarp ? e.etype.speed * 0.5
                : e.etype.speed;

      const behavior = e.etype.behavior || "chase";

      if (behavior === "kite" || e.etype.ranged) {
        // Кайт: держать дистанцию 160–280px, стрелять
        if (dist > 280) {
          s.physics.moveToObject(e, s.player, spd);
        } else if (dist < 160) {
          const angle = Phaser.Math.Angle.Between(s.player.x, s.player.y, e.x, e.y);
          e.body.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
        } else {
          // Двигаться перпендикулярно — уклонение
          const angle = Phaser.Math.Angle.Between(s.player.x, s.player.y, e.x, e.y);
          const perp  = angle + (e._perpDir || Math.PI / 2);
          e.body.setVelocity(Math.cos(perp) * spd * 0.6, Math.sin(perp) * spd * 0.6);
          if (!e._perpTimer || now > e._perpTimer) {
            e._perpDir   = (Math.random() > 0.5 ? 1 : -1) * Math.PI / 2;
            e._perpTimer = now + 1200 + Math.random() * 800;
          }
        }
        if (now - e.lastShot > e.etype.shootCooldown) {
          e.lastShot = now;
          this.shootFrom(e);
        }

      } else if (behavior === "flank") {
        // Фланк: подходить под углом 60–90° от прямого направления
        if (!e._flankAngle || now > e._flankTimer) {
          const base     = Phaser.Math.Angle.Between(e.x, e.y, s.player.x, s.player.y);
          const offset   = (Math.random() > 0.5 ? 1 : -1) * (Math.PI / 4 + Math.random() * Math.PI / 4);
          e._flankAngle  = base + offset;
          e._flankTimer  = now + 800 + Math.random() * 600;
        }
        // Корректируем флэнк-угол если враг уже близко
        if (dist < 80) {
          s.physics.moveToObject(e, s.player, spd);
        } else {
          e.body.setVelocity(Math.cos(e._flankAngle) * spd, Math.sin(e._flankAngle) * spd);
        }

      } else {
        // Chase: прямое преследование
        s.physics.moveToObject(e, s.player, spd);
      }

      const barW = e.etype.isBoss ? 80 : 28;
      if (e.hpBg)      e.hpBg.setPosition(e.x, e.y - 22);
      if (e.hpBar)     e.hpBar.setPosition(e.x - barW / 2, e.y - 22);
      if (e.bossLabel) e.bossLabel.setPosition(e.x, e.y - 34);
    });
  }
}
