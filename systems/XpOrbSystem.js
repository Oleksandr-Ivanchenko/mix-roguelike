import Phaser from "phaser";

export class XpOrbSystem {
  constructor(scene) {
    this.scene = scene;
     scene.physics.add.overlap(scene.player, scene.xpOrbs, (player, orb) => {
    if (!orb.active) return;
    orb.destroy();
    scene.progression.gainXP(orb.xpVal);
  });
  }

  spawn(x, y, val) {
    const s     = this.scene;
    const big   = val >= 25;
    const color = big ? 0xffdd00 : 0x44ff88;
    const size  = big ? 5 : 4;
    const orb   = s.add.circle(x, y, size, color).setDepth(3);
    s.physics.add.existing(orb);
    orb.body.setCircle(size);
    orb.body.setImmovable(true);
    orb.body.setAllowGravity(false);
    orb.xpVal = val;
    orb._attracting = false;
    s.xpOrbs.add(orb);
    orb.setAlpha(0);
    s.tweens.add({ targets: orb, alpha: 1, duration: 200 });
    orb.bobTween = s.tweens.add({ targets: orb, y: y - 3, duration: 600, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    s.time.delayedCall(15000, () => {
      if (orb.active) s.tweens.add({ targets: orb, alpha: 0, duration: 400, onComplete: () => orb.destroy() });
    });
  }

  update() {
    const s = this.scene;
    if (!s.player?.active) return;
    const px = s.player.x, py = s.player.y;
    for (const orb of s.xpOrbs.getChildren()) {
      if (!orb.active) continue;
      const dx = px - orb.x, dy = py - orb.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (!orb._attracting && dist < 100) {
        orb._attracting = true;
        orb.bobTween?.stop();
        orb.bobTween = null;
        orb.body.setImmovable(false);
      }
      if (orb._attracting && dist > 1) {
        orb.body.setVelocity((dx / dist) * 160, (dy / dist) * 160);
      }
    }
  }
}
