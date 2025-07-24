import Phaser from 'phaser';

const CELL_SIZE = 64;

class Polyomino extends Phaser.GameObjects.Container {
    constructor(scene, x, y, pieceData) {
        super(scene, x, y);

        this.pieceData = pieceData;
        this.matrix = pieceData.matrix;
        this.color = pieceData.color;
        
        const { width, height } = this.createBlocks();
        
        this.setSize(width, height);
        this.setInteractive({ draggable: true });
        
        scene.add.existing(this);
    }

    createBlocks() {
        const matrix = this.matrix;

        let minX = Infinity, minY = Infinity;
        let maxX = -Infinity, maxY = -Infinity;

        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] === 1) {
                    minX = Math.min(minX, x);
                    minY = Math.min(minY, y);
                    maxX = Math.max(maxX, x);
                    maxY = Math.max(maxY, y);
                }
            }
        }
        
        if (minX === Infinity) return { width: 0, height: 0 }; // empty piece

        const width = (maxX - minX + 1) * CELL_SIZE;
        const height = (maxY - minY + 1) * CELL_SIZE;

        // Calculate the offset to center the shape in the container
        const offsetX = width / 2;
        const offsetY = height / 2;

        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                if (matrix[y][x] === 1) {
                    // Position blocks relative to the container's center
                    const blockX = (x - minX + 0.5) * CELL_SIZE - offsetX;
                    const blockY = (y - minY + 0.5) * CELL_SIZE - offsetY;
                    const block = this.scene.add.image(blockX, blockY, `block_${this.color}`);
                    this.add(block);
                }
            }
        }
        
        return { width, height };
    }
}

export default Polyomino;