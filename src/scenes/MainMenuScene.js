import Phaser from 'phaser';
import SoundManager from '../systems/SoundManager.js';

class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        this.soundManager = new SoundManager(this);
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'game_bg').setOrigin(0.5).setAlpha(0.5);

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        this.add.text(centerX, centerY - 200, 'Block Blast', {
            fontSize: '64px',
            fontFamily: 'Arial',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Play Button
        const playButton = this.createButton(centerX, centerY, 'Play');
        playButton.on('pointerdown', () => {
            this.soundManager.play('click');
            this.scene.start('GameScene');
            this.scene.launch('UIScene');
        });
    }

    createButton(x, y, text) {
        const buttonContainer = this.add.container(x, y);

        const buttonWidth = 250;
        const buttonHeight = 80;
        const borderRadius = 20;
        const buttonBgColor = 0x007bff;
        const buttonHoverColor = 0x0056b3;

        const buttonBg = this.add.graphics()
            .fillStyle(buttonBgColor)
            .fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);

        const buttonText = this.add.text(0, 0, text, { fontSize: '40px', fontFamily: 'Arial', color: '#ffffff' }).setOrigin(0.5);

        buttonContainer.add([buttonBg, buttonText]);
        buttonContainer.setSize(buttonWidth, buttonHeight);
        buttonContainer.setInteractive({ useHandCursor: true });

        buttonContainer.on('pointerover', () => {
            buttonBg.clear().fillStyle(buttonHoverColor).fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        });

        buttonContainer.on('pointerout', () => {
            buttonBg.clear().fillStyle(buttonBgColor).fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        });
        
        buttonContainer.on('pointerdown', () => {
            this.tweens.add({
                targets: buttonContainer,
                scale: 0.95,
                duration: 100,
                ease: 'Power1',
                yoyo: true,
            });
        });
        
        return buttonContainer;
    }
}

export default MainMenuScene;