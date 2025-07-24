import Phaser from 'phaser';
import Polyomino from '../objects/Polyomino.js';
import PieceGenerator from '../systems/PieceGenerator.js';
import ScoringSystem from '../systems/ScoringSystem.js';

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
    }
    
    create() {
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
        
        const queuePositions = [
            { x: 120, y: 780 },
            { x: 320, y: 780 },
            { x: 520, y: 780 },
        ];

        this.currentPieces = pieceDataArray.map((pieceData, index) => {
            const pos = queuePositions[index];
            const polyomino = new Polyomino(this, pos.x, pos.y, pieceData);
            polyomino.originalPosition = { x: pos.x, y: pos.y };
            return polyomino;
        });

        if (this.isGameOver()) {
            this.handleGameOver();
        }
    }

    updateGhostPiece(pointer, piece) {
        this.ghostContainer.removeAll(true);
        const gridX = Math.floor((pointer.x - GRID_OFFSET_X) / CELL_SIZE);
        const gridY = Math.floor((pointer.y - GRID_OFFSET_Y) / CELL_SIZE);
        
        const snappedX = GRID_OFFSET_X + gridX * CELL_SIZE;
        const snappedY = GRID_OFFSET_Y + gridY * CELL_SIZE;

        const isValid = this.isValidPlacement(piece.matrix, gridX, gridY);

        for(let block of piece.list) {
            const ghostBlock = this.add.image(block.x, block.y, block.texture.key)
                .setOrigin(0,0)
                .setTint(isValid ? 0x00ff00 : 0xff0000);
            this.ghostContainer.add(ghostBlock);
        }
        this.ghostContainer.setPosition(snappedX, snappedY);
    }
    
    placePiece(pointer, piece) {
        const gridX = Math.floor((pointer.x - GRID_OFFSET_X) / CELL_SIZE);
        const gridY = Math.floor((pointer.y - GRID_OFFSET_Y) / CELL_SIZE);

        if (this.isValidPlacement(piece.matrix, gridX, gridY)) {
            this.commitPieceToGrid(piece, gridX, gridY);
            // this.sound.play('sfx_place');
            this.currentPieces = this.currentPieces.filter(p => p !== piece);
            piece.destroy();
            
            this.piecesPlacedThisTurn++;
            this.scoringSystem.addPiecePlacementScore(piece.pieceData.size);
            
            const linesCleared = this.clearLines();
            this.scoringSystem.addLineClearScore(linesCleared);

            this.scoringSystem.endOfTurn(this.piecesPlacedThisTurn);

            if (this.currentPieces.length === 0) {
                this.generateNewPieceSet();
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
                        GRID_OFFSET_X + finalX * CELL_SIZE,
                        GRID_OFFSET_Y + finalY * CELL_SIZE,
                        `block_${piece.color}`
                    ).setOrigin(0);
                    this.gridSprites[finalY][finalX] = blockSprite;
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
            // this.sound.play(totalLines > 1 ? 'sfx_clear_combo' : 'sfx_clear_line');
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
        this.tweens.add({
            targets: sprite,
            scale: 0,
            duration: 200,
            ease: 'Power2',
            onComplete: () => sprite.destroy()
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