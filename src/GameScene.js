import Phaser from "phaser";
import { WEAPON_LIST, WEAPONS } from "./config/weapons.js";
import { xpForLevel } from "./config/progression.js";
import { MapBuilder } from "./map/MapBuilder.js";
import { EffectsSystem } from "./systems/EffectsSystem.js";
import { XpOrbSystem } from "./systems/XpOrbSystem.js";
import { CombatSystem } from "./systems/CombatSystem.js";
import { EnemySystem } from "./systems/EnemySystem.js";
import { ProgressionSystem } from "./systems/ProgressionSystem.js";
import { DifficultySystem } from "./systems/DifficultySystem.js";
import { HUD } from "./ui/HUD.js";
import { WeaponPanel } from "./ui/WeaponPanel.js";
import { LevelUpMenu } from "./ui/LevelUpMenu.js";
import { OreShopMenu } from "./ui/OreShopMenu.js";
import { SkillForgeMenu } from "./ui/SkillForgeMenu.js";
import { OreDropSystem } from "./systems/OreDropSystem.js";
import { ResourceSystem } from "./systems/ResourceSystem.js";
import { CLASSES } from "./config/classes.js";
import { ORE_KEYS } from "./config/items.js";
import { SKILL_ASSET_MAP } from "./config/craftedSkills.js";

export default class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }

  preload() {
    this.load.image("player",       "assets/player.png");
    this.load.image("hero_archer",  "assets/Heroes/archer.png");
    this.load.image("hero_warrior", "assets/Heroes/warrior.png");
    this.load.image("enemy",        "assets/enemy.png");
    this.load.image("skeleton",     "assets/Monsters/skeleton.png");
    this.load.image("cultist",      "assets/Monsters/cultist.png");
    this.load.image("gargonaBoss",  "assets/Monsters/gargonaBoss.png");
    this.load.image("wall",   "assets/wall.png");
    this.load.image("floor",  "assets/floor.png");
    this.load.image("arrow",        "assets/skills/arrow.png");
    this.load.image("BrokenArrow", "assets/weapon/BrokenArrow.png");
    this.load.image("Brokenbow",   "assets/weapon/Brokenbow.png");
    this.load.image("fire",        "assets/skills/fire.png");
    this.load.image("ice",         "assets/skills/ice.png");
    this.load.image("plasma",      "assets/skills/plasma.png");
    this.load.image("earth",       "assets/skills/earth.png");
    this.load.image("sword",        "assets/skills/sword.png");
    this.load.image("swordWarrior", "assets/weapon/sworldWarior.png");
    this.load.image("bullet",      "assets/skills/bullet.png");
    ORE_KEYS.forEach(key => this.load.image(key, `assets/Coins/${key}.png`));
    SKILL_ASSET_MAP.forEach(([key, path]) => this.load.image(key, path));
  }

  create() {
    this.playerClass = this.registry.get("playerClass");

    if (!this.playerClass) {
      this.scene.start("ClassSelectScene");
      return;
    }

    const cls  = this.playerClass;
    const base = cls.baseStats;

    this.T    = 32;
    this.mapW = 52;
    this.mapH = 30;
    this.map  = MapBuilder.build(this.mapW, this.mapH);

    // ── COIN TEXTURES (generate once) ──────
    [["coin_small", 10, 0xffdd44], ["coin_large", 14, 0xffaa00]].forEach(([key, r, fill]) => {
      if (this.textures.exists(key)) return;
      const g = this.add.graphics();
      g.fillStyle(fill); g.fillCircle(r, r, r);
      g.lineStyle(1.5, 0xffffff, 0.5); g.strokeCircle(r, r, r);
      g.generateTexture(key, r * 2, r * 2);
      g.destroy();
    });

    // ── ORE INVENTORY ──────────────────────
    this.ores = Object.fromEntries(ORE_KEYS.map(k => [k, 0]));
    this.shopOpen  = false;
    this.forgeOpen = false;

    // ── MANA / STAMINA ─────────────────────
    this.mana         = 100;
    this.maxMana      = 100;
    this.manaRegen    = 8;
    this.stamina      = 100;
    this.maxStamina   = 100;
    this.staminaRegen = 15;
    this.isExhausted  = false;
    this.isBlocking   = false;
    this.isSprinting  = false;

    // ── CRAFTED SKILLS / STATS ─────────────
    this.craftedSkills    = new Set();
    this.activeSkillSlots = [null, null];
    this.skillCooldowns   = {};
    this.isDashing        = false;
    this.statPoints       = 0;
    this.stats            = { str: 0, dex: 0, vit: 0, int: 0 };
    this.lastSkillHud     = 0;

    // ── CORE ───────────────────────────────
    this.score    = 0;
    this.xp       = 0;
    this.level    = 1;
    this.xpNeeded = xpForLevel(this.level);

    // ── STATS ──────────────────────────────
    this.moveSpeed    = base.moveSpeed;
    this.damageMult   = base.damageMult;
    this.critChance   = base.critChance;
    this.critMult     = base.critMult;
    this.cooldownMult = 1.0;
    this.armor        = base.armor || 0; // % снижения урона (0–90)

    // ── PROGRESSION FLAGS ──────────────────
    this.lifesteal = 0;
    this.multishot = 0;
    this.aoeDeath  = false;
    this.pierce    = false;
    this.hpRegen   = 0;
    this.xpMult    = 1.0;
    this.lastRegen = 0;

    this.wave           = 1;
    this.enemiesKilled  = 0;
    this.gold           = 0;
    this.gameStartTime  = 0;
    this.activeSkills   = new Set(); // id взятых навыков
    this.activeSynergies = new Set(); // id сработавших синергий

    // ── MAP ────────────────────────────────
    this.wallGroup = this.physics.add.staticGroup();

    for (let y = 0; y < this.mapH; y++) {
      for (let x = 0; x < this.mapW; x++) {
        const wx = x * this.T + this.T / 2;
        const wy = y * this.T + this.T / 2;
        if (this.map[y][x] === 0) {
          this.wallGroup.create(wx, wy, "wall")
            .setDisplaySize(this.T, this.T).refreshBody();
        } else {
          this.add.image(wx, wy, "floor")
            .setDisplaySize(this.T, this.T).setDepth(0);
        }
      }
    }

    // ── PLAYER ─────────────────────────────
    const start = MapBuilder.findFreeCell(this.map, this.mapW, this.mapH);
    const heroKey = cls.heroKey || "player";
    this.player = this.physics.add.sprite(
      start.x * this.T + this.T / 2,
      start.y * this.T + this.T / 2,
      heroKey
    );
    this.player.setDisplaySize(this.T - 2, this.T - 2).setDepth(3);
    this.player.body.setSize(22, 22);
    this.player.body.setCollideWorldBounds(true);

    this.playerHP    = 100;
    this.playerMaxHP = 100;
    this.lastHitTime = 0;

    // ── CAMERA ─────────────────────────────
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, this.mapW * this.T, this.mapH * this.T);
    this.physics.world.setBounds(0, 0, this.mapW * this.T, this.mapH * this.T);

    // ── GROUPS ─────────────────────────────
    this.enemies      = this.physics.add.group();
    this.projectiles  = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    this.xpOrbs       = this.physics.add.group();
    this.lootGroup    = this.physics.add.group();

    // ── SYSTEMS (сначала системы, потом overlap) ──
    const fx              = new EffectsSystem(this);
    this.effectsSystem    = fx;
    this.orbSystem        = new XpOrbSystem(this);
    this.combat           = new CombatSystem(this, fx, this.orbSystem);
    this.enemySystem      = new EnemySystem(this);
    this.progression      = new ProgressionSystem(this);
    this.difficultySystem = new DifficultySystem(this);
    this.oreDropSystem    = new OreDropSystem(this);
    this.resourceSystem   = new ResourceSystem(this);

    // ── COLLIDERS ──────────────────────────
    this.physics.add.collider(this.player,       this.wallGroup);
    this.physics.add.collider(this.enemies,      this.wallGroup);
    this.physics.add.collider(this.enemyBullets, this.wallGroup, (b) => b.destroy());
    this.physics.add.collider(this.projectiles,  this.wallGroup, (proj) => proj.destroy());

    // ── OVERLAPS ───────────────────────────
    this.physics.add.overlap(this.projectiles, this.enemies, (proj, enemy) => {
      this.combat.hitEnemy(proj, enemy);
    });
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      this.combat.hitPlayer(enemy);
    });
    this.physics.add.overlap(this.player, this.enemyBullets, (player, bullet) => {
      this.combat.hitPlayerBullet(bullet);
    });
    this.physics.add.overlap(this.player, this.lootGroup, (player, item) => {
      if (!item.active) return;
      item.destroy();
      const data = item.itemData;
      if (!data) return;
      if (data.type === "currency") {
        this.gold += Math.round((data.value ?? 1) * (this.goldMult || 1));
        this.hud.refreshGold(this.gold);
      } else {
        this.ores[data.key] = (this.ores[data.key] || 0) + 1;
        this.hud.refreshOres(this.ores);
      }
    });

    // ── UI ─────────────────────────────────
    this.hud         = new HUD(this);
    this.weaponPanel = new WeaponPanel(this);
    this.levelUpMenu = new LevelUpMenu(this);
    this.oreShopMenu    = new OreShopMenu(this);
    this.skillForgeMenu = new SkillForgeMenu(this);
    this.levelUpOpen    = false;

    this.hud.build();
    this.gameStartTime = this.time.now;

    // ── INPUT ──────────────────────────────
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = {
      up:    this.input.keyboard.addKey("W"),
      down:  this.input.keyboard.addKey("S"),
      left:  this.input.keyboard.addKey("A"),
      right: this.input.keyboard.addKey("D"),
    };

    const allowed = cls.allowedWeapons;
    this.availableWeapons = WEAPON_LIST.filter(w => allowed.includes(w));
    this.selectedWeapon   = allowed.includes(cls.weapon) ? cls.weapon : this.availableWeapons[0];
    this.lastShot         = 0;

    // ── WEAPON DISPLAY (после установки selectedWeapon) ──
    this._weaponSprite = null;
    this._initWeaponSprite();

    // Отслеживаем позицию курсора в мировых координатах
    this.mouseWorldX = 0;
    this.mouseWorldY = 0;
    this.input.on("pointermove", (p) => {
      this.mouseWorldX = p.worldX;
      this.mouseWorldY = p.worldY;
    });
    this.input.on("pointerdown", (p) => {
      if (this.levelUpOpen) return;
      this.mouseWorldX = p.worldX;
      this.mouseWorldY = p.worldY;
    });

    this.input.keyboard.addKey("E").on("down", () => {
      if (this.levelUpOpen || this.forgeOpen) return;
      this.oreShopMenu.toggle();
    });
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB).on("down", () => {
      if (this.levelUpOpen || this.shopOpen) return;
      this.skillForgeMenu.toggle();
    });
    this.input.keyboard.addKey("Q").on("down", () => this._useSkill(0));
    this.input.keyboard.addKey("F").on("down", () => this._useSkill(1));
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("down", () => this._doDodge());
    this._shiftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this._ctrlKey  = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);

    this.availableWeapons.forEach((w, i) => {
      this.input.keyboard.addKey(String(i + 1)).on("down", () => {
        this.selectedWeapon = w;
        this.weaponPanel.refresh(cls, w);
      });
    });

    this.weaponPanel.build(
      cls,
      this.selectedWeapon,
      (w) => {
        this.selectedWeapon = w;
        this.weaponPanel.refresh(cls, w);
      }
    );

    // ── SPAWN ──────────────────────────────
    for (let i = 0; i < 3; i++) this.enemySystem.spawn();

    this.spawnTimer = this.time.addEvent({
      delay: 2500,
      loop: true,
      callback: () => this.enemySystem.spawn()
    });
  }

  gameOver() {
    this.physics.pause();

    // Сохранить рекорд
    const elapsed   = Math.floor((this.time.now - this.gameStartTime) / 1000);
    const mm        = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const ss        = String(elapsed % 60).padStart(2, "0");
    const timeStr   = `${mm}:${ss}`;
    const prevBest  = parseInt(localStorage.getItem("bestScore") || "0");
    const isNewBest = this.score > prevBest;
    if (isNewBest) {
      localStorage.setItem("bestScore", this.score);
      localStorage.setItem("bestTime",  timeStr);
    }

    const W = this.cameras.main.width;
    const H = this.cameras.main.height;

    this.add.rectangle(W / 2, H / 2, 460, 300, 0x000000, 0.94)
      .setScrollFactor(0).setDepth(30).setOrigin(0.5);

    this.add.text(W / 2, H / 2 - 110, "GAME OVER", {
      fontSize: "44px", color: "#ff2244", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    if (isNewBest) {
      this.add.text(W / 2, H / 2 - 64, "★ НОВЫЙ РЕКОРД! ★", {
        fontSize: "15px", color: "#ffdd44", fontFamily: "monospace", fontStyle: "bold"
      }).setOrigin(0.5).setScrollFactor(0).setDepth(31);
    }

    this.add.text(W / 2, H / 2 - 38, `Очки: ${this.score}   Время: ${timeStr}`, {
      fontSize: "18px", color: "#ffdd44", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    this.add.text(W / 2, H / 2 - 8, `Уровень: ${this.level}   Убийств: ${this.enemiesKilled}   Золото: ${this.gold}`, {
      fontSize: "13px", color: "#aaaaaa", fontFamily: "monospace"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(31);

    // Кнопка — В МЕНЮ
    const btnBg = this.add.rectangle(W / 2, H / 2 + 60, 220, 46, 0x222266, 1)
      .setStrokeStyle(2, 0x5555ff).setScrollFactor(0).setDepth(31)
      .setInteractive({ useHandCursor: true });
    const btnTxt = this.add.text(W / 2, H / 2 + 60, "В ГЛАВНОЕ МЕНЮ", {
      fontSize: "16px", color: "#aaaaff", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(32);

    btnBg.on("pointerover",  () => { btnBg.setFillStyle(0x3333aa); btnTxt.setStyle({ color: "#ffffff" }); });
    btnBg.on("pointerout",   () => { btnBg.setFillStyle(0x222266); btnTxt.setStyle({ color: "#aaaaff" }); });
    btnBg.on("pointerdown",  () => this.scene.start("MainMenuScene"));

    // Кнопка — ИГРАТЬ СНОВА
    const btn2Bg = this.add.rectangle(W / 2, H / 2 + 114, 220, 46, 0x226622, 1)
      .setStrokeStyle(2, 0x44ff44).setScrollFactor(0).setDepth(31)
      .setInteractive({ useHandCursor: true });
    const btn2Txt = this.add.text(W / 2, H / 2 + 114, "ИГРАТЬ СНОВА", {
      fontSize: "16px", color: "#aaffaa", fontFamily: "monospace", fontStyle: "bold"
    }).setOrigin(0.5).setScrollFactor(0).setDepth(32);

    btn2Bg.on("pointerover",  () => { btn2Bg.setFillStyle(0x338833); btn2Txt.setStyle({ color: "#ffffff" }); });
    btn2Bg.on("pointerout",   () => { btn2Bg.setFillStyle(0x226622); btn2Txt.setStyle({ color: "#aaffaa" }); });
    btn2Bg.on("pointerdown",  () => this.scene.restart());
  }

  _initWeaponSprite() {
    const cfg = WEAPONS[this.selectedWeapon];
    if (!cfg || !cfg.iconKey) return;

    this._weaponSprite = this.add.image(this.player.x, this.player.y, cfg.iconKey)
      .setDisplaySize(26, 26)
      .setDepth(3.5)
      .setOrigin(0.5, 0.5);
  }

  _useSkill(slot) {
    if (this.levelUpOpen || this.shopOpen || this.forgeOpen) return;
    const sk = this.activeSkillSlots?.[slot];
    if (!sk) return;
    const now = this.time.now;
    if (now - (this.skillCooldowns[sk.id] ?? 0) < sk.cooldown) return;
    if (sk.resource === "mana"    && this.mana    < sk.cost) return;
    if (sk.resource === "stamina" && this.stamina < sk.cost) return;
    if (sk.resource === "mana")    { this.mana    -= sk.cost; this.hud.refreshMana(this.mana, this.maxMana); }
    if (sk.resource === "stamina") { this.stamina -= sk.cost; this.hud.refreshStamina(this.stamina, this.maxStamina); }
    this.skillCooldowns[sk.id] = now;
    sk.apply(this);
    this.hud.refreshSkillSlots(this.activeSkillSlots, this.skillCooldowns, now);
  }

  _doDodge() {
    if (this.levelUpOpen || this.shopOpen || this.forgeOpen) return;
    if (this.isDashing) return;
    if (!this.resourceSystem.onDodge()) return;

    const L  = this.cursors.left.isDown  || this.wasd.left.isDown;
    const R  = this.cursors.right.isDown || this.wasd.right.isDown;
    const U  = this.cursors.up.isDown    || this.wasd.up.isDown;
    const D  = this.cursors.down.isDown  || this.wasd.down.isDown;
    const vx = (R ? 1 : L ? -1 : 0) * 520;
    const vy = (D ? 1 : U ? -1 : 0) * 520;
    if (vx === 0 && vy === 0) return;

    this.isDashing = true;
    this.player.body.setVelocity(vx, vy);
    // Brief invincibility frames
    const savedHitTime = this.lastHitTime;
    this.lastHitTime   = this.time.now + 450;
    this.time.delayedCall(300, () => {
      this.isDashing  = false;
      if (this.lastHitTime > this.time.now) return;
      this.lastHitTime = savedHitTime;
    });
  }

  update(time, delta) {
    if (this.levelUpOpen || this.shopOpen || this.forgeOpen) return;

    const body = this.player.body;
    if (!body) return;

    const now = this.time.now;

    // ── Sprint & Block state ─────────────
    const cls = this.playerClass?.id ?? "warrior";
    const L = this.cursors.left.isDown  || this.wasd.left.isDown;
    const R = this.cursors.right.isDown || this.wasd.right.isDown;
    const U = this.cursors.up.isDown    || this.wasd.up.isDown;
    const D = this.cursors.down.isDown  || this.wasd.down.isDown;
    const isMoving = L || R || U || D;

    this.isSprinting = this._shiftKey?.isDown && isMoving && !this.isExhausted;
    this.isBlocking  = cls === "warrior" && this._ctrlKey?.isDown && !this.isExhausted;
    if (this.isBlocking) this.resourceSystem.onBlock(delta / 1000);

    // ── Движение ─────────────────────────
    if (!this.isDashing) body.setVelocity(0);
    const sprintMult = this.isSprinting ? (cls === "warrior" ? 1.4 : 1.35) : 1;
    const exhaustMult = this.isExhausted ? 0.7 : 1;
    const effectiveSpeed = this.moveSpeed * sprintMult * exhaustMult;

    if (!this.isDashing) {
      if (L) body.setVelocityX(-effectiveSpeed);
      if (R) body.setVelocityX(effectiveSpeed);
      if (U) body.setVelocityY(-effectiveSpeed);
      if (D) body.setVelocityY(effectiveSpeed);
    }

    // ── Авто-атака: только если враг в радиусе оружия ───────────────────────
    const weaponRange = (WEAPONS[this.selectedWeapon]?.range ?? 300) * (this.rangeBonus || 1);
    const nearest = this.enemies.getChildren()
      .filter(e => e.active)
      .sort((a, b) =>
        Phaser.Math.Distance.Between(a.x, a.y, this.player.x, this.player.y) -
        Phaser.Math.Distance.Between(b.x, b.y, this.player.x, this.player.y)
      )[0];

    const nearestDist = nearest
      ? Phaser.Math.Distance.Between(nearest.x, nearest.y, this.player.x, this.player.y)
      : Infinity;

    const inRange = nearest && nearestDist <= weaponRange;
    if (inRange) {
      this.combat.shoot(nearest.x, nearest.y);
    }

    // ── Лук/оружие рядом с игроком ───────────────────────────────────────
    const aimX = nearest ? nearest.x : this.mouseWorldX;
    const aimY = nearest ? nearest.y : this.mouseWorldY;
    if (this._weaponSprite && this._weaponSprite.active) {
      const angle  = Phaser.Math.Angle.Between(this.player.x, this.player.y, aimX, aimY);
      const offset = 18;
      this._weaponSprite.setPosition(
        this.player.x + Math.cos(angle) * offset,
        this.player.y + Math.sin(angle) * offset
      );
      this._weaponSprite.rotation = angle + Math.PI / 4;
      // Зеркалим если лук смотрит влево
      this._weaponSprite.setFlipY(Math.cos(angle) < 0);
    }

    // ── Таймер выживания ─────────────────
    const elapsed = Math.floor((now - this.gameStartTime) / 1000);
    this.hud.refreshTimer(elapsed);
    this.difficultySystem.update(elapsed);

    // ── Реген HP ──────────────────────────
    if (this.hpRegen > 0 && now - this.lastRegen > 1000) {
      this.lastRegen = now;
      this.playerHP  = Math.min(this.playerMaxHP, this.playerHP + this.hpRegen);
      this.hud.refreshHP(this.playerHP, this.playerMaxHP);
    }

    // ── Mana + Stamina (ResourceSystem) ──
    this.resourceSystem.update(delta, now);

    // ── Обновить иконки скиллов ───────────
    if (now - this.lastSkillHud >= 250) {
      this.lastSkillHud = now;
      this.hud.refreshSkillSlots(this.activeSkillSlots, this.skillCooldowns, now);
    }

    // ── Системы ───────────────────────────
    this.enemySystem.update(now);
    this.orbSystem.update();
  }
}