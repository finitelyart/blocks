import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // Show loading progress
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.cameras.main.width / 2 - 160, this.cameras.main.height / 2 - 25, 320, 50);

        const loadingText = this.make.text({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2 - 50,
            text: 'Loading...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        }).setOrigin(0.5, 0.5);

        this.load.on('progress', (value) => {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(this.cameras.main.width / 2 - 150, this.cameras.main.height / 2 - 15, 300 * value, 30);
        });

        // Asset Manifest from Spec
        // Images
        this.load.image('game_bg', 'assets/images/game_bg.png');
        this.load.image('grid_bg', 'assets/images/grid_bg.png');
        this.load.image('block_blue', 'assets/images/block_blue.png');
        this.load.image('block_green', 'assets/images/block_green.png');
        this.load.image('block_red', 'assets/images/block_red.png');
        this.load.image('block_yellow', 'assets/images/block_yellow.png');
        this.load.image('block_purple', 'assets/images/block_purple.png');
        this.load.image('block_cyan', 'assets/images/block_cyan.png');
        this.load.image('block_magenta', 'assets/images/block_magenta.png');
        this.load.image('block_orange', 'assets/images/block_orange.png');
        this.load.image('block_pink', 'assets/images/block_pink.png');
        this.load.image('button_restart', 'assets/images/button_restart.png');
        this.load.image('button_restart_hover', 'assets/images/button_restart_hover.png');
        this.load.image('icon_heart', 'assets/images/icon_heart.png');

        // Audio
        this.load.audio('sfx_place', 'assets/audio/sfx_place.wav');
        this.load.audio('sfx_clear_line', 'assets/audio/sfx_clear_line.wav');
        this.load.audio('sfx_clear_combo', 'assets/audio/sfx_clear_combo.wav');
        this.load.audio('sfx_game_over', 'assets/audio/sfx_game_over.wav');
        this.load.audio('sfx_click', 'assets/audio/sfx_click.wav');
    }

    create() {
        // Start the main game scenes
        this.scene.start('GameScene');
        this.scene.start('UIScene');
        this.scene.stop();
    }
}

export default PreloadScene;