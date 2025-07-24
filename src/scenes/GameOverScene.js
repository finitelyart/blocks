import Phaser from 'phaser';
import SoundManager from '../systems/SoundManager.js';

class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
        this.soundManager = null;
    }

    create(data) {
        this.soundManager = new SoundManager(this);
        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.5)');

        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const container = this.add.container(centerX, centerY);

        const bg = this.add.graphics();
        bg.fillStyle(0x333333, 0.9);
        bg.fillRoundedRect(-150, -150, 300, 300, 16);
        container.add(bg);

        container.add(this.make.text({
            x: 0,
            y: -100,
            text: 'Game Over',
            style: { fontSize: '40px', fontFamily: 'Arial', color: '#ffffff' }
        }).setOrigin(0.5));

        const scoreText = `Final Score: ${data.score}`;
        container.add(this.make.text({
            x: 0,
            y: -30,
            text: scoreText,
            style: { fontSize: '24px', fontFamily: 'Arial', color: '#ffffff' }
        }).setOrigin(0.5));

        const bestScoreText = `Best Score: ${data.highScore}`;
        container.add(this.make.text({
            x: 0,
            y: 10,
            text: bestScoreText,
            style: { fontSize: '24px', fontFamily: 'Arial', color: '#dddddd' }
        }).setOrigin(0.5));

        if (data.newHighScore) {
            container.add(this.make.text({
            x: 0,
            y: 40,
            text: 'New High Score!',
            style: { fontSize: '22px', fontFamily: 'Arial', color: '#ffd700' }
            }).setOrigin(0.5));
        }

        const restartButtonContainer = this.add.container(0, 100);
        container.add(restartButtonContainer);

        const buttonWidth = 200;
        const buttonHeight = 60;
        const borderRadius = 16;
        const buttonBgColor = 0x007bff;
        const buttonHoverColor = 0x0056b3;

        const buttonBg = this.add.graphics()
            .fillStyle(buttonBgColor)
            .fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);

        const buttonText = this.add.text(0, 0, 'Restart', { fontSize: '28px', fontFamily: 'Arial', color: '#ffffff' }).setOrigin(0.5);

        restartButtonContainer.add([buttonBg, buttonText]);
        restartButtonContainer.setSize(buttonWidth, buttonHeight);
        restartButtonContainer.setInteractive({ useHandCursor: true });

        restartButtonContainer.on('pointerdown', () => {
            this.soundManager.play('click');
            this.scene.get('GameScene').scene.restart();
            this.scene.get('UIScene').scene.restart();
            this.scene.stop();
        });

        restartButtonContainer.on('pointerover', () => {
            buttonBg.clear().fillStyle(buttonHoverColor).fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        });

        restartButtonContainer.on('pointerout', () => {
            buttonBg.clear().fillStyle(buttonBgColor).fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, borderRadius);
        });
        
        // Animate the whole container
        container.setScale(0);
        this.tweens.add({
            targets: container,
            scale: 1,
            ease: 'Elastic.easeOut',
            duration: 800,
            delay: 200
        });

        this.soundManager.play('game_over');
    }
}

export default GameOverScene;