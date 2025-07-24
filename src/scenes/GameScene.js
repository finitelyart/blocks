import Phaser from 'phaser';
import Polyomino from '../objects/Polyomino.js';
import PieceGenerator from '../systems/PieceGenerator.js';
import ScoringSystem from '../systems/ScoringSystem.js';
import SoundManager from '../systems/SoundManager.js';

const CELL_SIZE = 64;
const GRID_WIDTH = 8;
const GRID_HEIGHT = 8;
const GRID_OFFSET_X = 64;
const GRID_OFFSET_Y = 120;

class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init() {
        this.grid = Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(0));
        this.gridSprites = Array(GRID_HEIGHT).fill(0).map(() => Array(GRID_WIDTH).fill(null));
        this.currentPieces = [];
        this.pieceGenerator = new PieceGenerator();
        this.scoringSystem = new ScoringSystem(this.events);
        this.piecesPlacedThisTurn = 0;
        this.soundManager = null;
    }
    
    create() {
        this.soundManager = new SoundManager(this);
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'game_bg').setOrigin(0.5).setAlpha(0.5);
        this.add.image(GRID_OFFSET_X, GRID_OFFSET_Y, 'grid_bg').setOrigin(0);

        this.ghostContainer = this.add.container().setAlpha(0.5).setDepth(0);
        
        this.generateNewPieceSet();
        this.setupDragListeners();

        this.scoringSystem.reset();
    }

    setupDragListeners() {
        this.input.on('dragstart', (pointer, gameObject) => {
            gameObject.setDepth(1);
            this.children.bringToTop(gameObject);
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;
            this.updateGhostPiece(pointer, gameObject);
        });

        this.input.on('dragend', (pointer, gameObject) => {
            this.placePiece(pointer, gameObject);
            this.ghostContainer.removeAll(true);
        });
    }

    generateNewPieceSet() {
        const pieceDataArray = this.pieceGenerator.generateNewPieces(this.grid);
        
        // Position the piece queue near the bottom of the screen.
        const queueY = this.cameras.main.height - 180;

        const queuePositions = [
            { x: 120, y: queueY },
            { x: 320, y: queueY },
            { x: 520, y: queueY },
        ];

        this.currentPieces = pieceDataArray.map((pieceData, index) => {
            const pos = queuePositions[index];
            const polyomino = new Polyomino(this, pos.x, pos.y, pieceData);
            polyomino.originalPosition = { x: pos.x, y: pos.y };

            // Spawn animation
            polyomino.setScale(0);
            this.tweens.add({
                targets: polyomino,
                scale: 1,
                duration: 300,
                ease: 'Back.easeOut', // A nice bouncy effect
                delay: index * 100
            });

            return polyomino;
        });

        if (this.isGameOver()) {
            this.handleGameOver();
        }
    }

    updateGhostPiece(pointer, piece) {
        this.ghostContainer.removeAll(true);
        
        // The pointer is at the center of the piece. Find the top-left corner.
        const pieceTopLeftX = pointer.x - piece.width / 2;
        const pieceTopLeftY = pointer.y - piece.height / 2;

        // Calculate grid cell to snap to. Using Math.round feels more natural.
        const gridX = Math.round((pieceTopLeftX - GRID_OFFSET_X) / CELL_SIZE);
        const gridY = Math.round((pieceTopLeftY - GRID_OFFSET_Y) / CELL_SIZE);
        
        // Find the top-left world position for the snapped piece
        const snappedWorldX = GRID_OFFSET_X + gridX * CELL_SIZE;
        const snappedWorldY = GRID_OFFSET_Y + gridY * CELL_SIZE;

        const isValid = this.isValidPlacement(piece.matrix, gridX, gridY);

        // Render ghost piece from its matrix data, which is more robust
        const matrix = piece.matrix;
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] === 1) {
                    const ghostBlockX = snappedWorldX + x * CELL_SIZE;
                    const ghostBlockY = snappedWorldY + y * CELL_SIZE;
                    const ghostBlock = this.add.image(ghostBlockX, ghostBlockY, `block_${piece.color}`)
                        .setOrigin(0, 0)
                        .setTint(isValid ? 0x00ff00 : 0xff0000);
                    this.ghostContainer.add(ghostBlock);
                }
            }
        }
    }
    
    placePiece(pointer, piece) {
        // The pointer is at the center of the piece. Find the top-left corner.
        const pieceTopLeftX = pointer.x - piece.width / 2;
        const pieceTopLeftY = pointer.y - piece.height / 2;

        // Calculate grid cell to snap to. Must match ghost piece logic.
        const gridX = Math.round((pieceTopLeftX - GRID_OFFSET_X) / CELL_SIZE);
        const gridY = Math.round((pieceTopLeftY - GRID_OFFSET_Y) / CELL_SIZE);

        if (this.isValidPlacement(piece.matrix, gridX, gridY)) {
            this.commitPieceToGrid(piece, gridX, gridY);
            this.soundManager.play('place');
            this.currentPieces = this.currentPieces.filter(p => p !== piece);
            piece.destroy();
            
            this.piecesPlacedThisTurn++;
            this.scoringSystem.addPiecePlacementScore(piece.pieceData.size);
            
            const linesCleared = this.clearLines();
            this.scoringSystem.addLineClearScore(linesCleared);

            this.scoringSystem.endOfTurn(this.piecesPlacedThisTurn);

            if (this.currentPieces.length === 0) {
                this.generateNewPieceSet();
            } else {
                // After placing a piece, check if any of the remaining pieces can be placed.
                if (this.isGameOver()) {
                    this.handleGameOver();
                }
            }
        } else {
            // Invalid placement, return to original position
            this.tweens.add({
                targets: piece,
                x: piece.originalPosition.x,
                y: piece.originalPosition.y,
                duration: 200,
                ease: 'Power2'
            });
            piece.setDepth(0);
        }
    }

    isValidPlacement(pieceMatrix, targetGridX, targetGridY) {
        for (let y = 0; y < pieceMatrix.length; y++) {
            for (let x = 0; x < pieceMatrix[y].length; x++) {
                if (pieceMatrix[y][x] === 1) {
                    const checkX = targetGridX + x;
                    const checkY = targetGridY + y;
                    if (checkX < 0 || checkX >= GRID_WIDTH || checkY < 0 || checkY >= GRID_HEIGHT) {
                        return false;
                    }
                    if (this.grid[checkY][checkX] !== 0) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    commitPieceToGrid(piece, gridX, gridY) {
        const matrix = piece.matrix;
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] === 1) {
                    const finalX = gridX + x;
                    const finalY = gridY + y;
                    this.grid[finalY][finalX] = 1; // Or a color index
                    
                    const blockSprite = this.add.image(
                        GRID_OFFSET_X + (finalX + 0.5) * CELL_SIZE,
                        GRID_OFFSET_Y + (finalY + 0.5) * CELL_SIZE,
                        `block_${piece.color}`
                    ).setOrigin(0.5);

                    this.gridSprites[finalY][finalX] = blockSprite;
                    
                    // Placement animation
                    blockSprite.setScale(0);
                    this.tweens.add({
                        targets: blockSprite,
                        scale: 1,
                        duration: 250,
                        ease: 'Back.easeOut',
                        delay: (y * matrix[y].length + x) * 20
                    });
                }
            }
        }
    }
    
    clearLines() {
        let rowsToClear = [];
        for (let y = 0; y < GRID_HEIGHT; y++) {
            if (this.grid[y].every(cell => cell !== 0)) {
                rowsToClear.push(y);
            }
        }

        let colsToClear = [];
        for (let x = 0; x < GRID_WIDTH; x++) {
            let isFull = true;
            for (let y = 0; y < GRID_HEIGHT; y++) {
                if (this.grid[y][x] === 0) {
                    isFull = false;
                    break;
                }
            }
            if (isFull) {
                colsToClear.push(x);
            }
        }

        const totalLines = rowsToClear.length + colsToClear.length;
        if (totalLines > 0) {
            this.soundManager.play(totalLines > 1 ? 'clear_combo' : 'clear_line');
        }

        rowsToClear.forEach(y => this.clearRow(y));
        colsToClear.forEach(x => this.clearCol(x));
        
        return totalLines;
    }

    clearRow(y) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            this.grid[y][x] = 0;
            if (this.gridSprites[y][x]) {
                this.blastAnimation(this.gridSprites[y][x]);
                this.gridSprites[y][x] = null;
            }
        }
    }

    clearCol(x) {
        for (let y = 0; y < GRID_HEIGHT; y++) {
            this.grid[y][x] = 0;
            if (this.gridSprites[y][x]) {
                this.blastAnimation(this.gridSprites[y][x]);
                this.gridSprites[y][x] = null;
            }
        }
    }

    blastAnimation(sprite) {
        // Flash effect
        this.tweens.add({
            targets: sprite,
            alpha: 0,
            duration: 100,
            ease: 'Cubic.easeIn',
            yoyo: true,
            onComplete: () => {
                // Main blast animation
                this.tweens.add({
                    targets: sprite,
                    scale: 0,
                    angle: Phaser.Math.Between(-90, 90), // Add a little spin
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => sprite.destroy()
                });
            }
        });
    }

    isGameOver() {
        for (const piece of this.currentPieces) {
            for (let y = 0; y < GRID_HEIGHT; y++) {
                for (let x = 0; x < GRID_WIDTH; x++) {
                    if (this.isValidPlacement(piece.matrix, x, y)) {
                        return false; // Found a valid move
                    }
                }
            }
        }
        return true;
    }

    handleGameOver() {
        const isNewHighScore = this.scoringSystem.checkAndSaveHighScore();
        this.scene.pause();
        this.scene.pause('UIScene');
        this.scene.launch('GameOverScene', {
            score: this.scoringSystem.getScore(),
            highScore: this.scoringSystem.getHighScore(),
            newHighScore: isNewHighScore
        });
    }
}

export default GameScene;