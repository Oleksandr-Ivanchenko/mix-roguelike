export class DifficultySystem {
  constructor(scene) {
    this.scene    = scene;
    this.lastWave = -1;
  }

  getDifficulty(timeSec) {
    return 1 + timeSec * 0.015;
  }

  getWave(timeSec) {
    return Math.floor(timeSec / 60);
  }

  update(timeSec) {
    const wave = this.getWave(timeSec);
    if (wave === this.lastWave) return;
    this.lastWave = wave;
    if (wave < 2) return; // no events in first 2 minutes

    if (wave >= 8 && wave % 8 === 0) {
      this.scene.enemySystem.spawnMiniBoss();
      this._notify(`☠ МИНИ-БОСС!`, "#ff2244", 0x330000, 0xff2244);
    } else if (wave >= 5 && wave % 5 === 0) {
      this.scene.enemySystem.spawnEliteWave();
      this._notify(`★ ЭЛИТНАЯ ВОЛНА`, "#ffdd00", 0x1a1400, 0x996600);
    } else if (wave >= 3) {
      this._notify(`🌊 Волна ${wave}`, "#66aaff", 0x00001a, 0x224488);
    }
  }

  _notify(label, color, bgInt, borderInt) {
    const s   = this.scene;
    const W   = s.cameras.main.width;
    const H   = s.cameras.main.height;
    const bg  = s.add.rectangle(W / 2, H * 0.22, 380, 46, bgInt, 0.92)
      .setStrokeStyle(1, borderInt)
      .setScrollFactor(0).setDepth(59).setAlpha(0);
    const txt = s.add.text(W / 2, H * 0.22, label, {
      fontSize: "20px", color, fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(60).setAlpha(0);

    s.tweens.add({
      targets: [bg, txt],
      alpha: { from: 0, to: 1 },
      duration: 250,
      yoyo: true,
      hold: 1600,
      onComplete: () => { bg.destroy(); txt.destroy(); }
    });
  }
}
