import Phaser from 'phaser';

class GameOverScene extends Phaser.Scene {
    constructor() {
        super('GameOverScene');
    }

    create(data) {
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

        const restartButton = this.add.image(0, 100, 'button_restart').setInteractive({ useHandCursor: true });
        container.add(restartButton);

        restartButton.on('pointerdown', () => {
            this.sound.play('sfx_click');
            this.scene.get('GameScene').scene.restart();
            this.scene.get('UIScene').scene.restart();
            this.scene.stop();
        });

        restartButton.on('pointerover', () => {
            restartButton.setTexture('button_restart_hover');
        });

        restartButton.on('pointerout', () => {
            restartButton.setTexture('button_restart');
        });
        
        this.sound.play('sfx_game_over');
    }
}

export default GameOverScene;