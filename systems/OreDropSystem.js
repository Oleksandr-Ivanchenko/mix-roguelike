import { LootSystem } from "./LootSystem.js";

export class OreDropSystem {
  constructor(scene) {
    this.scene      = scene;
    this.lootSystem = new LootSystem();
  }

  drop(enemy) {
    const s       = this.scene;
    const context = enemy.etype?.isBoss      ? "boss"
                  : enemy.mutations?.has("elite") ? "elite"
                  : "normal";

    const items = this.lootSystem.rollLoot(context);
    const ex = enemy.x;
    const ey = enemy.y;

    items.forEach((item, i) => {
      const offset = (i - (items.length - 1) / 2) * 22;
      this._spawnItem(item, ex + offset, ey);
    });
  }

  _spawnItem(item, x, y) {
    const s      = this.scene;
    const sprite = s.physics.add.sprite(x, y, item.key).setDisplaySize(16, 16).setDepth(1.5);
    sprite.body.setAllowGravity(false);
    sprite.body.setImmovable(true);
    sprite.itemData = item;

    s.tweens.add({
      targets: sprite,
      y: y - 5,
      duration: 650 + Math.random() * 150,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    s.lootGroup.add(sprite);

    s.time.delayedCall(12000, () => {
      if (!sprite.active) return;
      s.tweens.add({
        targets: sprite, alpha: 0, duration: 500,
        onComplete: () => { if (sprite.active) sprite.destroy(); }
      });
    });
  }
}
