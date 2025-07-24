import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {
    constructor() {
        super('PreloadScene');
    }

    preload() {
        // No assets to load, but we can show a loading message briefly.
        this.make.text({
            x: this.cameras.main.width / 2,
            y: this.cameras.main.height / 2,
            text: 'Generating Assets...',
            style: { font: '20px monospace', fill: '#ffffff' }
        }).setOrigin(0.5, 0.5);
    }

    create() {
        this.createBlockTextures();
        this.createGridBgTexture();
        this.createGameBgTexture();
        this.createHeartTexture();

        // Start the main game scenes
        this.scene.start('GameScene');
        this.scene.start('UIScene');
        this.scene.stop();
    }

    createBlockTextures() {
        const colors = {
            blue: 0x007bff,
            green: 0x28a745,
            red: 0xdc3545,
            yellow: 0xffc107,
            purple: 0x6f42c1,
            cyan: 0x17a2b8,
            magenta: 0xe83e8c,
            orange: 0xfd7e14,
            pink: 0xff69b4,
        };
        const size = 64;
        const graphics = this.add.graphics();
        for (const colorName in colors) {
            graphics.fillStyle(colors[colorName]);
            graphics.fillRect(0, 0, size, size);
            // Add a subtle border/highlight to make blocks distinct
            graphics.lineStyle(4, 0xffffff, 0.2);
            graphics.strokeRect(2, 2, size - 4, size - 4);
            graphics.generateTexture(`block_${colorName}`, size, size);
            graphics.clear();
        }
        graphics.destroy();
    }

    createGridBgTexture() {
        const CELL_SIZE = 64;
        const GRID_WIDTH = 8;
        const GRID_HEIGHT = 8;
        const width = GRID_WIDTH * CELL_SIZE;
        const height = GRID_HEIGHT * CELL_SIZE;

        const graphics = this.add.graphics();

        // Background
        graphics.fillStyle(0x2b2b2b, 1);
        graphics.fillRect(0, 0, width, height);

        // Grid lines
        graphics.lineStyle(1, 0x000000, 0.5);
        for (let i = 0; i <= GRID_WIDTH; i++) {
            graphics.moveTo(i * CELL_SIZE, 0);
            graphics.lineTo(i * CELL_SIZE, height);
        }
        for (let j = 0; j <= GRID_HEIGHT; j++) {
            graphics.moveTo(0, j * CELL_SIZE);
            graphics.lineTo(width, j * CELL_SIZE);
        }
        graphics.strokePath();

        graphics.generateTexture('grid_bg', width, height);
        graphics.destroy();
    }
    
    createGameBgTexture() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const graphics = this.add.graphics();
        graphics.fillGradientStyle(0x1a1a1a, 0x1a1a1a, 0x3d3d3d, 0x3d3d3d, 1);
        graphics.fillRect(0, 0, width, height);
        graphics.generateTexture('game_bg', width, height);
        graphics.destroy();
    }
    
    createHeartTexture() {
        const size = 32;
        const graphics = this.add.graphics();
        graphics.fillStyle(0xff4757, 1); // A nice red color
        graphics.beginPath();
        const topY = size * 0.35;
        const bottomY = size;
        const halfX = size / 2;
        
        graphics.moveTo(halfX, topY);
        graphics.cubicBezierTo(halfX * 0.7, 0, 0, 0, 0, topY);
        graphics.cubicBezierTo(0, size * 0.7, halfX, size * 0.9, halfX, bottomY);
        graphics.cubicBezierTo(halfX, size * 0.9, size, size * 0.7, size, topY);
        graphics.cubicBezierTo(size, 0, halfX * 1.3, 0, halfX, topY);

        graphics.closePath();
        graphics.fillPath();
        graphics.generateTexture('icon_heart', size, size);
        graphics.destroy();
    }
}

export default PreloadScene;