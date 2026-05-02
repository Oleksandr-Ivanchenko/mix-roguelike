export class ResourceSystem {
  constructor(scene) {
    this.scene          = scene;
    this.lastCombatTime = -9999;
    this.lastActionTime = -9999;
    this.lastArcherShot = -9999;
  }

  update(delta, now) {
    const s   = this.scene;
    const cls = s.playerClass?.id ?? "warrior";
    const dt  = delta / 1000;

    this._updateStamina(dt, now, cls);
    this._updateMana(dt, now, cls);
  }

  _updateStamina(dt, now, cls) {
    const s = this.scene;

    let rate = s.staminaRegen; // base per second

    const inCombat   = now - this.lastCombatTime < 3000;
    const afterAction = now - this.lastActionTime < 500;

    if (inCombat)    rate *= 0.6;
    if (afterAction) rate *= 0.5;

    const body      = s.player?.body;
    const isMoving  = body && (Math.abs(body.velocity.x) > 1 || Math.abs(body.velocity.y) > 1);

    if (cls === "warrior") {
      if (!isMoving)    rate *= 1.2;  // +20% standing still
      if (s.isBlocking) rate *= 1.1;  // +10% while blocking
    } else if (cls === "archer") {
      if (isMoving)                            rate *= 1.3;  // +30% while moving
      if (now - this.lastArcherShot > 1000)   rate *= 1.5;  // burst after 1s no-shoot
    }

    // Sprint drain
    if (s.isSprinting && isMoving) {
      const drain = cls === "warrior" ? 15 : 10;
      s.stamina = Math.max(0, s.stamina - drain * dt);
    }

    s.stamina = Math.min(s.maxStamina, Math.max(0, s.stamina + rate * dt));

    // Exhaust: enter at 0, exit at 20%
    if (s.stamina <= 0 && !s.isExhausted) {
      s.isExhausted = true;
    } else if (s.stamina >= s.maxStamina * 0.2 && s.isExhausted) {
      s.isExhausted = false;
    }

    s.hud?.refreshStamina?.(s.stamina, s.maxStamina);
  }

  _updateMana(dt, now, cls) {
    const s = this.scene;

    const inCombat = now - this.lastCombatTime < 3000;
    let rate = inCombat ? 5 * 0.6 : 5 * 1.2; // 3/sec in, 6/sec out

    s.mana = Math.min(s.maxMana, s.mana + rate * dt);
    s.hud?.refreshMana?.(s.mana, s.maxMana);
  }

  // ── Event hooks (called from CombatSystem / GameScene) ──────────────────────

  onAttack() {
    const s   = this.scene;
    const now = s.time.now;
    this.lastCombatTime = now;
    this.lastActionTime = now;

    const cls  = s.playerClass?.id ?? "warrior";
    const cost = cls === "warrior" ? 5 : 3;
    this._spendStamina(cost);

    if (cls === "archer") this.lastArcherShot = now;
  }

  onHit(dmg) {
    const s   = this.scene;
    this.lastCombatTime = s.time.now;
    if (s.playerClass?.id === "warrior") {
      s.mana = Math.min(s.maxMana, s.mana + 8);
    }
  }

  onKill() {
    const s = this.scene;
    this.lastCombatTime = s.time.now;
    if (s.playerClass?.id === "warrior") {
      s.mana = Math.min(s.maxMana, s.mana + 12);
    }
  }

  onCrit(distance) {
    const s = this.scene;
    if (s.playerClass?.id === "archer") {
      const bonus = (distance ?? 0) > 200 ? 10 : 5;
      s.mana = Math.min(s.maxMana, s.mana + bonus);
    }
  }

  onAccurateHit() {
    const s = this.scene;
    if (s.playerClass?.id === "archer") {
      s.mana = Math.min(s.maxMana, s.mana + 3);
    }
  }

  // Returns false if exhausted / not enough stamina
  onDodge() {
    const s   = this.scene;
    const cls = s.playerClass?.id ?? "warrior";
    const cost = cls === "warrior" ? 25 : 20;
    if (s.isExhausted || s.stamina < cost) return false;
    this._spendStamina(cost);
    this.lastActionTime = s.time.now;
    return true;
  }

  onBlock(dt) {
    const s = this.scene;
    this._spendStamina(10 * dt);
    s.mana = Math.min(s.maxMana, s.mana + 3 * dt);
  }

  onPerfectBlock() {
    const s = this.scene;
    s.stamina = Math.min(s.maxStamina, s.stamina + 15);
    s.mana    = Math.min(s.maxMana,    s.mana    + 15);
  }

  _spendStamina(amount) {
    const s = this.scene;
    if (s.isExhausted) return false;
    s.stamina = Math.max(0, s.stamina - amount);
    return true;
  }
}
