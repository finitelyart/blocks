const PIECE_DEFINITIONS = {
    // Monomino
    mono: { matrix: [[1]], size: 1, tier: 'Easy', weight: 15, color: 'blue' },
    
    // Dominoes
    domino_h: { matrix: [[1, 1]], size: 2, tier: 'Easy', weight: 10, color: 'green' },
    domino_v: { matrix: [[1], [1]], size: 2, tier: 'Easy', weight: 10, color: 'green' },

    // Trominoes
    tromino_i: { matrix: [[1, 1, 1]], size: 3, tier: 'Easy', weight: 8, color: 'cyan' },
    tromino_l: { matrix: [[1, 0], [1, 1]], size: 3, tier: 'Medium', weight: 7, color: 'yellow' },

    // Tetrominoes
    tetro_o: { matrix: [[1, 1], [1, 1]], size: 4, tier: 'Easy', weight: 8, color: 'yellow' },
    tetro_t: { matrix: [[0, 1, 0], [1, 1, 1]], size: 4, tier: 'Medium', weight: 5, color: 'purple' },
    tetro_l: { matrix: [[0, 0, 1], [1, 1, 1]], size: 4, tier: 'Medium', weight: 5, color: 'orange' },
    tetro_j: { matrix: [[1, 0, 0], [1, 1, 1]], size: 4, tier: 'Medium', weight: 5, color: 'blue' },
    tetro_s: { matrix: [[0, 1, 1], [1, 1, 0]], size: 4, tier: 'Hard', weight: 3, color: 'red' },
    tetro_z: { matrix: [[1, 1, 0], [0, 1, 1]], size: 4, tier: 'Hard', weight: 3, color: 'magenta' },
    tetro_i: { matrix: [[1, 1, 1, 1]], size: 4, tier: 'Easy', weight: 6, color: 'cyan'},

    // Pentominoes
    pento_i: { matrix: [[1, 1, 1, 1, 1]], size: 5, tier: 'Medium', weight: 4, color: 'cyan' },
    pento_p: { matrix: [[1, 1], [1, 1], [1, 0]], size: 5, tier: 'Hard', weight: 2, color: 'pink' },
    pento_f: { matrix: [[0, 1, 1], [1, 1, 0], [0, 1, 0]], size: 5, tier: 'Hard', weight: 2, color: 'green' },
    pento_l: { matrix: [[1, 0], [1, 0], [1, 0], [1, 1]], size: 5, tier: 'Medium', weight: 3, color: 'orange' },
    pento_n: { matrix: [[0, 1], [1, 1], [1, 0], [1, 0]], size: 5, tier: 'Hard', weight: 2, color: 'red' },
    pento_t: { matrix: [[1, 1, 1], [0, 1, 0], [0, 1, 0]], size: 5, tier: 'Medium', weight: 3, color: 'purple' },
    pento_u: { matrix: [[1, 0, 1], [1, 1, 1]], size: 5, tier: 'Medium', weight: 3, color: 'blue' },
    pento_v: { matrix: [[1, 0, 0], [1, 0, 0], [1, 1, 1]], size: 5, tier: 'Medium', weight: 3, color: 'yellow' },
    pento_w: { matrix: [[1, 0, 0], [1, 1, 0], [0, 1, 1]], size: 5, tier: 'Hard', weight: 2, color: 'cyan' },
    pento_x: { matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], size: 5, tier: 'Easy', weight: 5, color: 'magenta' },
    pento_y: { matrix: [[0, 1], [1, 1], [0, 1], [0, 1]], size: 5, tier: 'Medium', weight: 3, color: 'pink' },
    pento_z: { matrix: [[1, 1, 0], [0, 1, 0], [0, 1, 1]], size: 5, tier: 'Hard', weight: 2, color: 'red' },

    // Large Square
    square_3x3: { matrix: [[1, 1, 1], [1, 1, 1], [1, 1, 1]], size: 9, tier: 'Hard', weight: 1, color: 'red' },
};

class PieceGenerator {
    constructor() {
        this.weightedPieces = [];
        for (const key in PIECE_DEFINITIONS) {
            const piece = { ...PIECE_DEFINITIONS[key], key };
            for (let i = 0; i < piece.weight; i++) {
                this.weightedPieces.push(piece);
            }
        }
    }

    _isValidPlacement(grid, pieceMatrix, targetGridX, targetGridY) {
        for (let y = 0; y < pieceMatrix.length; y++) {
            for (let x = 0; x < pieceMatrix[y].length; x++) {
                if (pieceMatrix[y][x] !== 0) {
                    const checkX = targetGridX + x;
                    const checkY = targetGridY + y;

                    if (checkX < 0 || checkX >= 8 || checkY < 0 || checkY >= 8) {
                        return false; // Out of bounds
                    }
                    if (grid[checkY][checkX] !== 0) {
                        return false; // Collision
                    }
                }
            }
        }
        return true;
    }

    _canPlace(grid, pieceMatrix) {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (this._isValidPlacement(grid, pieceMatrix, x, y)) {
                    return true;
                }
            }
        }
        return false;
    }

    generateNewPieces(grid) {
        const selectedPieces = [];
        const selectedKeys = new Set();

        while (selectedPieces.length < 3) {
            const randomIndex = Math.floor(Math.random() * this.weightedPieces.length);
            const piece = this.weightedPieces[randomIndex];

            if (!selectedKeys.has(piece.key) && this._canPlace(grid, piece.matrix)) {
                selectedPieces.push(piece);
                selectedKeys.add(piece.key);
            }
        }
        return selectedPieces;
    }
}

export default PieceGenerator;