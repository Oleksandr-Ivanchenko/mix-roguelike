import Phaser from "phaser";
import { SKILL_POOL, SYNERGIES, RARITY } from "../config/skills.js";
import { xpForLevel } from "../config/progression.js";

export class ProgressionSystem {
  constructor(scene) {
    this.scene = scene;
  }

  gainXP(amount) {
    const s = this.scene;
    s.xp += Math.floor(amount * s.xpMult);
    while (s.xp >= s.xpNeeded) {
      s.xp -= s.xpNeeded;
      s.level++;
      s.xpNeeded = xpForLevel(s.level);
      this._levelUp();
    }
    s.hud.refreshXP(s.xp, s.xpNeeded, s.level);
  }

  _levelUp() {
    const s = this.scene;
    s.physics.pause();
    s.levelUpOpen = true;

    s.statPoints = (s.statPoints || 0) + 1;
    s.hud?.refreshStatPoints?.(s.statPoints);

    const choices = this._pickSkills(3);
    s.levelUpMenu.show(s.level, choices, (skill) => {
      skill.apply(s);
      s.activeSkills.add(skill.id);
      s.levelUpOpen = false;
      s.physics.resume();
      this._checkSynergies();
      this._upgradeWave();
    });
  }

  // Взвешенный выбор с учётом редкости и уровня
  _pickSkills(count) {
    const s = this.scene;

    // Map new classes to the nearest skill category
    const SKILL_CATEGORY = {
      warrior: "warrior", rogue: "warrior", paladin: "warrior",
      archer: "archer",   mage: "archer",   necromancer: "archer",
      summoner: "archer", hunter: "archer",
    };
    const cls = SKILL_CATEGORY[s.playerClass?.id] ?? null;
    const available = SKILL_POOL.filter(sk => {
      if (sk.unique && s.activeSkills.has(sk.id)) return false;
      if (sk.rarity === "epic"      && s.level < 4) return false;
      if (sk.rarity === "legendary" && s.level < 7) return false;
      if (sk.class && sk.class !== cls) return false;
      return true;
    });
    // Luck reduces level requirement for epics/legendaries
    if ((s.luck || 0) >= 3 && s.level >= 2) {
      available.push(...SKILL_POOL.filter(sk =>
        sk.rarity === "epic" && !s.activeSkills.has(sk.id) &&
        (!sk.class || sk.class === cls) && !available.includes(sk)
      ));
    }

    const result = [];
    const used   = new Set();

    while (result.length < count) {
      const pool = available.filter(sk => !used.has(sk.id));
      if (pool.length === 0) break;
      const pick = this._weightedPick(pool);
      result.push(pick);
      used.add(pick.id);
    }

    return result;
  }

  _weightedPick(pool) {
    const luck = this.scene.luck || 0;
    const luckMult = { common: 1, rare: 1 + luck * 0.2, epic: 1 + luck * 0.4, legendary: 1 + luck * 0.8 };
    const weight = sk => (RARITY[sk.rarity]?.weight ?? 60) * (luckMult[sk.rarity] || 1);
    const total = pool.reduce((sum, sk) => sum + weight(sk), 0);
    let r = Math.random() * total;
    for (const sk of pool) {
      r -= weight(sk);
      if (r <= 0) return sk;
    }
    return pool[pool.length - 1];
  }

  _checkSynergies() {
    const s = this.scene;
    for (const syn of SYNERGIES) {
      if (s.activeSynergies.has(syn.id)) continue;
      if (syn.requires.every(id => s.activeSkills.has(id))) {
        s.activeSynergies.add(syn.id);
        syn.apply(s);
        this._showSynergyNotification(syn);
      }
    }
  }

  _showSynergyNotification(syn) {
    const s = this.scene;
    const W = s.cameras.main.width;
    const H = s.cameras.main.height;

    const bg = s.add.rectangle(W / 2, H / 2 + 160, 440, 72, 0x1a0a00, 0.96)
      .setStrokeStyle(2, 0xffaa00).setScrollFactor(0).setDepth(60);
    const labelTxt = s.add.text(W / 2, H / 2 + 147, syn.label, {
      fontSize: "18px", color: "#ffaa00", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);
    const descTxt = s.add.text(W / 2, H / 2 + 170, `⚡ СИНЕРГИЯ: ${syn.desc}`, {
      fontSize: "12px", color: "#ffddaa", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(61);

    s.time.delayedCall(2400, () => {
      s.tweens.add({
        targets: [bg, labelTxt, descTxt],
        alpha: 0, duration: 400,
        onComplete: () => { bg.destroy(); labelTxt.destroy(); descTxt.destroy(); }
      });
    });
  }

  _upgradeWave() {
    const s        = this.scene;
    s.wave         = s.level;
    const newDelay = Math.max(1000, 3200 - s.level * 130);
    if (newDelay !== s.spawnTimer.delay) {
      s.spawnTimer.remove();
      s.spawnTimer = s.time.addEvent({
        delay: newDelay, loop: true, callback: () => s.enemySystem.spawn()
      });
    }
  }
}
