// RoomSystem.js — управление комнатами и триггерами событий
import Phaser from "phaser";

export class RoomSystem {
  constructor(scene, rooms) {
    this.scene = scene;
    this.rooms = rooms;
  }

  checkRoomTriggers(player) {
    this.rooms.forEach(room => {
      if (room.triggered) return;
      const dist = Phaser.Math.Distance.Between(
        player.x / this.scene.T,
        player.y / this.scene.T,
        room.center.x,
        room.center.y
      );
      if (dist < 5) {
        room.triggered = true;
        this.spawnRoomEnemies(room);
      }
    });
  }

  spawnRoomEnemies(room) {
    switch (room.type) {
      case "spawn1":
        this.scene.enemySystem.spawnWave(room.center, 5);
        break;
      case "spawn2":
        this.scene.enemySystem.spawnWave(room.center, 10);
        break;
      case "boss":
        this.scene.enemySystem.spawnBoss(room.center);
        break;
    }
  }
}
