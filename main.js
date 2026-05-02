import Phaser from "phaser";
import MainMenuScene from "./src/MainMenuScene.js";
import ClassSelectScene from "./src/ClassSelectScene.js";
import GameScene from "./src/GameScene.js";

const config = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: "#111",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 4,
  },
  physics: {
    default: "arcade",
    arcade: { debug: false }
  },
  scene: [MainMenuScene, ClassSelectScene, GameScene]
};

new Phaser.Game(config);