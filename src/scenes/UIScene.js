import Phaser from 'phaser';

class UIScene extends Phaser.Scene {
    constructor() {
        super('UIScene');
    }

    create() {
        // Score Display
        this.scoreText = this.add.text(this.cameras.main.width / 2, 50, 'Score: 0', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // High Score Display
        this.highScoreText = this.add.text(120, 50, 'Best: 0', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#dddddd'
        }).setOrigin(0.5);
        
        // Streak Indicator
        this.streakIcon = this.add.image(this.cameras.main.width - 120, 40, 'icon_heart').setScale(0.8);
        this.streakText = this.add.text(this.cameras.main.width - 80, 50, 'x1', {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // Listen for events from GameScene
        const gameScene = this.scene.get('GameScene');
        gameScene.events.on('updateScore', (score, highScore) => {
            this.updateScore(score, highScore);
        });
        gameScene.events.on('updateStreak', (streak) => {
            this.updateStreak(streak);
        });

        this.initUI(gameScene.scoringSystem);

        // Mute Button
        const soundManager = gameScene.soundManager;
        const muteButton = this.add.text(
            this.cameras.main.width - 20, 
            this.cameras.main.height - 20, 
            'Mute', 
            { fontSize: '20px', fontFamily: 'Arial', color: '#ffffff', backgroundColor: '#00000080', padding: { x: 10, y: 5 }, align: 'center' }
        )
        .setOrigin(1, 1) // Align to bottom-right
        .setInteractive({ useHandCursor: true });
        
        muteButton.on('pointerdown', () => {
            const isEnabled = soundManager.toggleMute();
            muteButton.setText(isEnabled ? 'Mute' : 'Unmute');
            muteButton.setAlpha(isEnabled ? 1.0 : 0.6);
            
            // Play a click sound to confirm enabling sound
            if (isEnabled) {
                soundManager.play('click');
            }
        });
    }
    
    initUI(scoringSystem) {
        this.updateScore(scoringSystem.getScore(), scoringSystem.getHighScore());
        this.updateStreak(scoringSystem.getStreak());
    }

    updateScore(score, highScore) {
        this.scoreText.setText(`Score: ${score}`);
        this.highScoreText.setText(`Best: ${highScore}`);

        // Pop animation
        this.tweens.add({
            targets: this.scoreText,
            scale: 1.1,
            duration: 100,
            yoyo: true,
            ease: 'Cubic.easeInOut'
        });
    }

    updateStreak(streak) {
        this.streakText.setText(`x${streak}`);
        this.tweens.add({
            targets: [this.streakIcon, this.streakText],
            scale: streak > 1 ? 1.2 : 1,
            duration: 200,
            yoyo: true,
            ease: 'Cubic.easeInOut'
        });
    }
}

export default UIScene;