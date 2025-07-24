class SoundManager {
    constructor(scene) {
        this.scene = scene;
        // Handle audio context unlocking, which is required by modern browsers.
        if (scene.sound.context.state === 'suspended') {
            scene.sound.once('unlocked', () => {
                this.audioContext = scene.sound.context;
            });
        } else {
            this.audioContext = scene.sound.context;
        }
        this.soundsEnabled = true;
    }

    play(soundType, options = {}) {
        if (!this.soundsEnabled || !this.audioContext) return;

        const time = this.audioContext.currentTime;

        switch(soundType) {
            case 'place':
                this.playPlaceSound(time, options);
                break;
            case 'clear_line':
                this.playClearLineSound(time, options);
                break;
            case 'clear_combo':
                this.playClearComboSound(time, options);
                break;
            case 'game_over':
                this.playGameOverSound(time, options);
                break;
            case 'click':
                this.playClickSound(time, options);
                break;
        }
    }

    _createOscillator(type, freq, time) {
        const osc = this.audioContext.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, time);
        return osc;
    }

    _createGain(startValue, time) {
        const gain = this.audioContext.createGain();
        gain.gain.setValueAtTime(startValue, time);
        return gain;
    }
    
    // A simple sound for placing a piece
    playPlaceSound(time) {
        const osc = this._createOscillator('triangle', 120, time);
        const gain = this._createGain(0.3, time);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
        osc.start(time);
        osc.stop(time + 0.1);
    }

    // Sound for clearing a single line
    playClearLineSound(time) {
        const osc = this._createOscillator('sine', 440, time);
        const gain = this._createGain(0.3, time);

        osc.frequency.exponentialRampToValueAtTime(880, time + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.2);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(time);
        osc.stop(time + 0.2);
    }

    // A more exciting sound for multiple lines
    playClearComboSound(time) {
        let noteTime = time;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

        notes.forEach((note) => {
            const osc = this._createOscillator('triangle', note, noteTime);
            const gain = this._createGain(0.2, noteTime);
            
            gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.1);
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.start(noteTime);
            osc.stop(noteTime + 0.1);
            
            noteTime += 0.08;
        });
    }

    // A sound for game over
    playGameOverSound(time) {
        const osc = this._createOscillator('sawtooth', 220, time);
        const gain = this._createGain(0.4, time);

        osc.frequency.exponentialRampToValueAtTime(110, time + 0.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.8);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(time);
        osc.stop(time + 0.8);
    }
    
    // A generic UI click sound
    playClickSound(time) {
        const osc = this._createOscillator('sine', 880, time);
        const gain = this._createGain(0.2, time);

        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(time);
        osc.stop(time + 0.05);
    }
}

export default SoundManager;