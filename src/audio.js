// Audio Manager - handles sound effects and music
export class AudioManager {
    constructor() {
        this.context = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.musicPlaying = false;
        
        // Sound state
        this.initialized = false;
    }
    
    init() {
        if (this.initialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            this.musicGain = this.context.createGain();
            this.musicGain.gain.value = 0.3;
            this.musicGain.connect(this.context.destination);
            
            this.sfxGain = this.context.createGain();
            this.sfxGain.gain.value = 0.5;
            this.sfxGain.connect(this.context.destination);
            
            this.initialized = true;
        } catch (e) {
            console.warn('Audio not supported:', e);
        }
    }
    
    // Play a simple beep/tone
    playTone(frequency, duration, type = 'sine') {
        if (!this.initialized) this.init();
        if (!this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        
        gainNode.gain.setValueAtTime(0.3, this.context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.sfxGain);
        
        oscillator.start();
        oscillator.stop(this.context.currentTime + duration);
    }
    
    // Sound effects
    playJump() {
        // Rising tone for jump
        this.playTone(300, 0.15, 'sine');
        setTimeout(() => this.playTone(400, 0.1, 'sine'), 50);
    }
    
    playCollect() {
        // Happy ding for item collection
        this.playTone(523, 0.1, 'sine'); // C5
        setTimeout(() => this.playTone(659, 0.1, 'sine'), 80); // E5
    }
    
    playBurrow() {
        // Low whoosh for burrow
        this.playTone(150, 0.3, 'triangle');
    }
    
    playUnburrow() {
        // Rising whoosh
        this.playTone(150, 0.2, 'triangle');
        setTimeout(() => this.playTone(300, 0.15, 'triangle'), 100);
    }
    
    playAlert() {
        // Warning sound when detected
        this.playTone(440, 0.1, 'square');
        setTimeout(() => this.playTone(440, 0.1, 'square'), 150);
    }
    
    playWin() {
        // Victory fanfare
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.3, 'sine'), i * 150);
        });
    }
    
    playGameOver() {
        // Sad descending tones
        this.playTone(400, 0.2, 'sine');
        setTimeout(() => this.playTone(300, 0.2, 'sine'), 200);
        setTimeout(() => this.playTone(200, 0.4, 'sine'), 400);
    }
    
    // Music (simple ambient)
    startMusic() {
        if (!this.initialized) this.init();
        if (!this.context || this.musicPlaying) return;
        
        // Create a simple ambient drone
        this.musicPlaying = true;
        this.playAmbientDrone();
    }
    
    playAmbientDrone() {
        if (!this.musicPlaying || !this.context) return;
        
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.value = 80;
        
        gainNode.gain.setValueAtTime(0.1, this.context.currentTime);
        
        oscillator.connect(gainNode);
        gainNode.connect(this.musicGain);
        
        oscillator.start();
        
        // Store for stopping
        this.musicOscillator = oscillator;
    }
    
    stopMusic() {
        this.musicPlaying = false;
        if (this.musicOscillator) {
            this.musicOscillator.stop();
            this.musicOscillator = null;
        }
    }
}