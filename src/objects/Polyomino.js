import Phaser from 'phaser';

const CELL_SIZE = 64;

class Polyomino extends Phaser.GameObjects.Container {
    constructor(scene, x, y, pieceData) {
        super(scene, x, y);

        this.pieceData = pieceData;
        this.matrix = pieceData.matrix;
        this.color = pieceData.color;
        
        this.createBlocks();
        
        this.setSize(this.getBounds().width, this.getBounds().height);
        this.setInteractive({ draggable: true });
        
        scene.add.existing(this);
    }

    createBlocks() {
        const matrix = this.matrix;
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] === 1) {
                    const blockX = x * CELL_SIZE;
                    const blockY = y * CELL_SIZE;
                    const block = this.scene.add.image(blockX, blockY, `block_${this.color}`);
                    block.setOrigin(0, 0);
                    this.add(block);
                }
            }
        }
    }
}

export default Polyomino;