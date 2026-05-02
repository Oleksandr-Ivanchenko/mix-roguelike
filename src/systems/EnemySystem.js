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
    const timeSec = Math.max(0, (s.time.now - s.gameStartTime) / 1000);
    return 1 + timeSec * 0.015;
  }

  _pickType() {
    const s = this.scene;
    const roll = Math.random();
    if      (s.level >= 7 && roll < 0.05) return "boss";
    else if (s.level >= 4 && roll < 0.15) return "shooter";
    else if (s.level >= 3 && roll < 0.25) return "tank";
    else if (s.level >= 2 && roll < 0.35) return "fast";
    return "basic";
  }

  _edgePos() {
    const s = this.scene;
    const side = Phaser.Math.Between(0, 3);
    let ex, ey;
    switch (side) {
      case 0: ex = Phaser.Math.Between(1, s.mapW - 2); ey = 1;           break;
      case 1: ex = Phaser.Math.Between(1, s.mapW - 2); ey = s.mapH - 2; break;
      case 2: ex = 1;           ey = Phaser.Math.Between(1, s.mapH - 2); break;
      default: ex = s.mapW - 2; ey = Phaser.Math.Between(1, s.mapH - 2); break;
    }
    return { ex, ey };
  }

  spawn(forceType) {
    const s    = this.scene;
    const diff = this._getDiff();
    const { ex, ey } = this._edgePos();

    if (s.map[ey][ex] === 0) return;
    if (s.player && Phaser.Math.Distance.Between(
      ex * s.T + s.T / 2, ey * s.T + s.T / 2,
      s.player.x, s.player.y) < 180) return;

    this._createEnemy(ex, ey, forceType || this._pickType(), [], diff);
  }

  spawnEliteWave() {
    const s    = this.scene;
    const diff = this._getDiff();
    const count = 6 + Math.floor(diff * 0.5);
    for (let i = 0; i < count; i++) {
      const { ex, ey } = this._edgePos();
      if (s.map[ey]?.[ex] !== 0) {
        this._createEnemy(ex, ey, this._pickType(), ["elite"], diff);
      }
    }
  }

  spawnMiniBoss() {
    const s    = this.scene;
    const diff = this._getDiff();
    const roll  = Math.random();
    const mutations = roll < 0.5 ? ["elite", "armored"] : ["elite", "speedy"];
    const { ex, ey } = this._edgePos();
    if (s.map[ey]?.[ex] !== 0) {
      this._createEnemy(ex, ey, "boss", mutations, diff);
    }
  }

  _createEnemy(ex, ey, typeName, mutations, diff) {
    const s      = this.scene;
    const etype  = ENEMY_TYPES[typeName];
    if (!etype) return;

    let hpMult  = diff;
    let dmgMult = diff * 0.7;
    let spdMult = 1 + diff * 0.05;
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

      if (e.etype.ranged) {
        if (dist > 180) {
          s.physics.moveToObject(e, s.player, spd);
        } else if (dist < 100) {
          const angle = Phaser.Math.Angle.Between(s.player.x, s.player.y, e.x, e.y);
          e.body.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
        } else {
          e.body.setVelocity(0, 0);
        }
        if (now - e.lastShot > e.etype.shootCooldown) {
          e.lastShot = now;
          this.shootFrom(e);
        }
      } else {
        s.physics.moveToObject(e, s.player, spd);
      }

      const barW = e.etype.isBoss ? 80 : 28;
      if (e.hpBg)      e.hpBg.setPosition(e.x, e.y - 22);
      if (e.hpBar)     e.hpBar.setPosition(e.x - barW / 2, e.y - 22);
      if (e.bossLabel) e.bossLabel.setPosition(e.x, e.y - 34);
    });
  }
}
