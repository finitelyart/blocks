class SoundManager {
    constructor(scene) {
        this.scene = scene;
        this.audioContext = null;
        this.soundQueue = [];
        this.soundsEnabled = true;

        // Handle audio context unlocking, which is required by modern browsers.
        // Sounds will be queued until the context is unlocked by a user gesture.
        const soundManager = this.scene.sound;
        if (soundManager.context.state === 'suspended') {
            soundManager.once('unlocked', () => {
                this.audioContext = soundManager.context;
                this._playQueuedSounds();
            });
        } else {
            this.audioContext = soundManager.context;
        }
    }

    toggleMute() {
        this.soundsEnabled = !this.soundsEnabled;
        return this.soundsEnabled;
    }

    play(soundType, options = {}) {
        if (!this.soundsEnabled) return;

        // If context is not ready, queue the sound. It will be played once unlocked.
        if (!this.audioContext) {
            this.soundQueue.push({ soundType, options });
            return;
        }

        const time = this.audioContext.currentTime;
        this._playSound(soundType, time, options);
    }

    _playSound(soundType, time, options = {}) {
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

    _playQueuedSounds() {
        while(this.soundQueue.length > 0) {
            const { soundType, options } = this.soundQueue.shift();
            this.play(soundType, options); // This will now go through the non-queued path
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
    
    // A more impactful sound for placing a piece
    playPlaceSound(time) {
        // Randomize pitch slightly to avoid monotony
        const randomPitch = 200 + (Math.random() - 0.5) * 40; // Varies between 180 and 220

        const osc = this._createOscillator('square', randomPitch, time);
        const gain = this._createGain(0.4, time); // A bit louder

        osc.frequency.exponentialRampToValueAtTime(randomPitch / 2, time + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.15);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.start(time);
        osc.stop(time + 0.15);
    }

    // Sound for clearing a single line - a quick, pleasant chime
    playClearLineSound(time) {
        let noteTime = time;
        const notes = [600, 800, 1000]; // A quick rising arpeggio
        
        notes.forEach((note) => {
            const osc = this._createOscillator('triangle', note, noteTime);
            const gain = this._createGain(0.3, noteTime);
            
            gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.2);
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.start(noteTime);
            osc.stop(noteTime + 0.2);
            
            noteTime += 0.05;
        });
    }

    // A more exciting sound for multiple lines - a triumphant fanfare
    playClearComboSound(time) {
        let noteTime = time;
        // A triumphant C-major 7th arpeggio, ending on a high E
        const notes = [523.25, 659.25, 783.99, 987.77, 1318.51]; // C5, E5, G5, B5, E6

        notes.forEach((note, i) => {
            const osc = this._createOscillator('triangle', note, noteTime);
            const gain = this._createGain(i === notes.length - 1 ? 0.5 : 0.3, noteTime); // Emphasize last note
            
            gain.gain.linearRampToValueAtTime(0.0001, noteTime + 0.3);
            
            osc.connect(gain);
            gain.connect(this.audioContext.destination);
            osc.start(noteTime);
            osc.stop(noteTime + 0.3);
            
            noteTime += 0.06; // Quick succession
        });
    }

    // A more dramatic sound for game over
    playGameOverSound(time) {
        // Bass tone
        const osc1 = this._createOscillator('sawtooth', 150, time);
        const gain1 = this._createGain(0.4, time);
        osc1.frequency.exponentialRampToValueAtTime(50, time + 1.2);
        gain1.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);
        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        osc1.start(time);
        osc1.stop(time + 1.2);
        
        // Higher tone for dissonance
        const osc2 = this._createOscillator('square', 155, time); // Slightly detuned for a chorus effect
        const gain2 = this._createGain(0.4, time);
        osc2.frequency.exponentialRampToValueAtTime(55, time + 1.2);
        gain2.gain.exponentialRampToValueAtTime(0.0001, time + 1.2);
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        osc2.start(time);
        osc2.stop(time + 1.2);
    }
    
    // A crisp, modern UI click sound
    playClickSound(time) {
        const osc = this._createOscillator('triangle', 1200, time);
        const gain = this._createGain(0.3, time);

        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);

        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start(time);
        osc.stop(time + 0.1);
    }
}

export default SoundManager;