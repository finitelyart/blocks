import './style.css';
import Phaser from 'phaser';

// Import scenes
import PreloadScene from './src/scenes/PreloadScene.js';
import GameScene from './src/scenes/GameScene.js';
import UIScene from './src/scenes/UIScene.js';
import GameOverScene from './src/scenes/GameOverScene.js';

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 960,
    parent: 'app',
    backgroundColor: '#1a1a1a',
    scene: [
        PreloadScene,
        GameScene,
        UIScene,
        GameOverScene
    ],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

// Create a new game instance
const game = new Phaser.Game(config);