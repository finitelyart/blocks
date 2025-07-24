const COMBO_POINTS = {
    1: 10,
    2: 30,
    3: 60,
    4: 100,
    5: 150,
    6: 250,
};

const HIGH_SCORE_KEY = 'blockBlastCloneHighScore';

class ScoringSystem {
    constructor(events) {
        this.events = events;
        this.score = 0;
        this.streakMultiplier = 1;
        this.highScore = parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0', 10);
        this.lineClearedThisTurn = false;
    }

    reset() {
        this.score = 0;
        this.streakMultiplier = 1;
        this.lineClearedThisTurn = false;
        this.emitScoreUpdate();
        this.emitStreakUpdate();
    }

    addPiecePlacementScore(blockCount) {
        this.score += blockCount;
        this.emitScoreUpdate();
    }

    addLineClearScore(lineCount) {
        if (lineCount > 0) {
            const basePoints = COMBO_POINTS[lineCount] || 0;
            const totalPoints = basePoints * this.streakMultiplier;
            this.score += totalPoints;
            this.lineClearedThisTurn = true;
            this.emitScoreUpdate();
        }
    }

    endOfTurn(piecesPlaced) {
        if (piecesPlaced % 3 === 0) {
            if (this.lineClearedThisTurn) {
                this.streakMultiplier++;
                this.emitStreakUpdate();
            } else {
                this.streakMultiplier = 1;
                this.emitStreakUpdate();
            }
            this.lineClearedThisTurn = false;
        }
    }

    getScore() {
        return this.score;
    }

    getHighScore() {
        return this.highScore;
    }

    getStreak() {
        return this.streakMultiplier;
    }

    checkAndSaveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(HIGH_SCORE_KEY, this.highScore.toString());
            return true; // New high score
        }
        return false;
    }

    emitScoreUpdate() {
        this.events.emit('updateScore', this.score, this.highScore);
    }
    
    emitStreakUpdate() {
        this.events.emit('updateStreak', this.streakMultiplier);
    }
}

export default ScoringSystem;